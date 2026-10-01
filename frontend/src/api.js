function pegarSenha() {
  return localStorage.getItem('financeiro_senha') || ''
}

export function salvarSenha(senha) {
  localStorage.setItem('financeiro_senha', senha)
}

export function limparSenha() {
  localStorage.removeItem('financeiro_senha')
}

async function chamar(caminho, opcoes = {}) {
  const resp = await fetch(caminho, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      'x-financeiro-senha': pegarSenha(),
      ...(opcoes.headers || {}),
    },
  })
  if (resp.status === 401) {
    limparSenha()
    throw new Error('Senha inválida.')
  }
  const corpo = await resp.json()
  if (!resp.ok) throw new Error(corpo.erro || `erro ${resp.status}`)
  return corpo
}

export const api = {
  resumo: () => chamar('/api/resumo'),
  gastosFixos: () => chamar('/api/gastos-fixos'),
  connectToken: () => chamar('/api/pluggy/connect-token'),
  registrarItem: (itemId) => chamar('/api/pluggy/item', { method: 'POST', body: JSON.stringify({ itemId }) }),
  sincronizar: () => chamar('/api/sincronizar', { method: 'POST' }),
  criarTransacao: (dados) => chamar('/api/transacoes', { method: 'POST', body: JSON.stringify(dados) }),
  marcarFixo: (id, fixo) => chamar(`/api/transacoes/${id}`, { method: 'PATCH', body: JSON.stringify({ fixo }) }),
  criarInvestimento: (dados) => chamar('/api/investimentos', { method: 'POST', body: JSON.stringify(dados) }),
}
