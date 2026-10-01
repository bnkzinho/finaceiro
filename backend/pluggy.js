// Integração com a Pluggy (api.pluggy.ai) — serviço de Open Finance que
// conecta de verdade com os bancos brasileiros. Conta grátis em
// pluggy.ai pra uso pessoal/desenvolvimento.
//
// AVISO — mesmo princípio dos outros projetos: não tenho como testar
// contra a API de verdade daqui (preciso das SUAS credenciais, que só
// você tem). Segui a documentação oficial da Pluggy com cuidado, mas é
// bem possível que precise de um ajuste fino depois do primeiro teste
// ao vivo — me manda a mensagem de erro exata se algo não bater.

const BASE_URL = 'https://api.pluggy.ai'

let apiKeyCache = { valor: null, expiraEm: 0 }

// A API key da Pluggy expira depois de um tempo — guarda em memória e
// só pede uma nova quando perto de vencer.
async function pegarApiKey() {
  if (apiKeyCache.valor && Date.now() < apiKeyCache.expiraEm) return apiKeyCache.valor

  const resp = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
  })
  if (!resp.ok) throw new Error(`Falha ao autenticar na Pluggy: ${resp.status} ${await resp.text()}`)
  const { apiKey } = await resp.json()
  apiKeyCache = { valor: apiKey, expiraEm: Date.now() + 100 * 60 * 1000 } // renova a cada ~100min (expira em 2h)
  return apiKey
}

async function pluggyFetch(caminho, opcoes = {}) {
  const apiKey = await pegarApiKey()
  const resp = await fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json', ...(opcoes.headers || {}) },
  })
  if (!resp.ok) throw new Error(`Pluggy ${caminho}: ${resp.status} ${await resp.text()}`)
  return resp.json()
}

// Token temporário que o widget do Pluggy Connect usa no navegador pra
// abrir a tela de login do banco — nunca expõe a apiKey de verdade pro
// front, só esse token de uso único.
export async function criarConnectToken(itemId) {
  const corpo = itemId ? { itemId } : {}
  const { accessToken } = await pluggyFetch('/connect_token', {
    method: 'POST',
    body: JSON.stringify(corpo),
  })
  return accessToken
}

export async function buscarItem(itemId) {
  return pluggyFetch(`/items/${itemId}`)
}

export async function listarContasDoItem(itemId) {
  const { results } = await pluggyFetch(`/accounts?itemId=${itemId}`)
  return results
}

export async function listarTransacoes(accountId, { desde } = {}) {
  let pagina = 1
  let todas = []
  while (true) {
    const params = new URLSearchParams({ accountId, pageSize: '500', page: String(pagina) })
    if (desde) params.set('from', desde)
    const { results, totalPages } = await pluggyFetch(`/transactions?${params}`)
    todas = todas.concat(results)
    if (pagina >= totalPages) break
    pagina++
  }
  return todas
}
