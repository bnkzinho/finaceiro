import { supabase } from './supabase.js'

function inicioDoMes() {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().slice(0, 10)
}

export async function pegarResumo() {
  const desde = inicioDoMes()

  const { data: transacoesMes, error: erro1 } = await supabase
    .from('transacoes')
    .select('valor, fixo')
    .gte('data', desde)
  if (erro1) throw new Error(erro1.message)

  const totalGastoMes = transacoesMes.filter((t) => t.valor < 0).reduce((s, t) => s + Math.abs(t.valor), 0)
  const totalReceitaMes = transacoesMes.filter((t) => t.valor > 0).reduce((s, t) => s + t.valor, 0)
  const gastosFixosMes = transacoesMes.filter((t) => t.fixo && t.valor < 0).reduce((s, t) => s + Math.abs(t.valor), 0)

  const { data: investimentos, error: erro2 } = await supabase.from('investimentos').select('valor')
  if (erro2) throw new Error(erro2.message)
  const totalInvestido = investimentos.reduce((s, i) => s + i.valor, 0)

  const { data: contasInvestimento, error: erro3 } = await supabase.from('contas').select('saldo').eq('tipo', 'INVESTMENT')
  if (erro3) throw new Error(erro3.message)
  const saldoContasInvestimento = contasInvestimento.reduce((s, c) => s + Number(c.saldo), 0)

  return {
    totalGastoMes,
    totalReceitaMes,
    gastosFixosMes,
    totalInvestido: totalInvestido + saldoContasInvestimento,
  }
}

export async function listarTransacoesRecentes(limite = 50) {
  const { data, error } = await supabase
    .from('transacoes')
    .select('id, descricao, valor, categoria, data, fixo, origem, contas(nome)')
    .order('data', { ascending: false })
    .limit(limite)
  if (error) throw new Error(error.message)
  return data
}

export async function listarGastosFixos() {
  const { data, error } = await supabase
    .from('transacoes')
    .select('id, descricao, valor, categoria, data, contas(nome)')
    .eq('fixo', true)
    .order('data', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}
