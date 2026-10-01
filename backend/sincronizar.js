import { supabase } from './supabase.js'
import { buscarItem, listarContasDoItem, listarTransacoes } from './pluggy.js'

// Depois que o usuário conecta um banco pelo widget (frontend manda o
// itemId pra cá), guarda a conexão e puxa contas + transações pela
// primeira vez.
export async function registrarNovoItem(itemId) {
  const item = await buscarItem(itemId)
  const { data: linha, error } = await supabase
    .from('pluggy_items')
    .upsert(
      { pluggy_item_id: itemId, instituicao: item.connector?.name || null, status: item.status, atualizado_em: new Date().toISOString() },
      { onConflict: 'pluggy_item_id' }
    )
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  await sincronizarItem(itemId, linha.id)
  return linha.id
}

// Busca de novo as contas/transações de um item já conectado — usado
// pelo botão "Sincronizar" do site.
export async function sincronizarItem(pluggyItemId, idInternoItem) {
  let idItem = idInternoItem
  if (!idItem) {
    const { data } = await supabase.from('pluggy_items').select('id').eq('pluggy_item_id', pluggyItemId).single()
    idItem = data?.id
  }
  if (!idItem) throw new Error('Item não encontrado — conecte o banco de novo.')

  const contasPluggy = await listarContasDoItem(pluggyItemId)

  for (const conta of contasPluggy) {
    const { data: contaSalva, error } = await supabase
      .from('contas')
      .upsert(
        {
          pluggy_item_id: idItem,
          pluggy_account_id: conta.id,
          nome: conta.name,
          tipo: conta.type === 'CREDIT' ? 'CREDIT' : conta.subtype === 'INVESTMENT' ? 'INVESTMENT' : 'BANK',
          instituicao: conta.institution?.name || null,
          saldo: conta.balance ?? 0,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: 'pluggy_account_id' }
      )
      .select('id')
      .single()
    if (error) throw new Error(error.message)

    const transacoes = await listarTransacoes(conta.id)
    if (!transacoes.length) continue

    const linhas = transacoes.map((t) => ({
      conta_id: contaSalva.id,
      pluggy_transaction_id: t.id,
      descricao: t.description,
      valor: t.amount,
      categoria: t.category || null,
      data: t.date?.slice(0, 10),
      origem: 'pluggy',
    }))
    const { error: erroTransacoes } = await supabase.from('transacoes').upsert(linhas, { onConflict: 'pluggy_transaction_id' })
    if (erroTransacoes) throw new Error(erroTransacoes.message)
  }
}

export async function sincronizarTodosOsItems() {
  const { data: items, error } = await supabase.from('pluggy_items').select('id, pluggy_item_id')
  if (error) throw new Error(error.message)
  for (const item of items) {
    await sincronizarItem(item.pluggy_item_id, item.id)
  }
}
