import { useEffect, useState } from 'react'
import { PluggyConnect } from 'react-pluggy-connect'
import { api, salvarSenha } from './api.js'

function formatarDinheiro(valor) {
  return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function PasswordGate({ onEntrar }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    salvarSenha(senha)
    try {
      await api.resumo()
      onEntrar()
    } catch (err) {
      setErro('Senha incorreta.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <form onSubmit={handleSubmit} className="card flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-lg font-semibold">Financeiro</h1>
        <input
          type="password"
          className="field-input"
          placeholder="Senha"
          autoFocus
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        {erro && <p className="text-sm text-bad-text">{erro}</p>}
        <button type="submit" className="btn-primary">Entrar</button>
      </form>
    </div>
  )
}

function StatCard({ label, valor, cor = 'text-ink' }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${cor}`}>{formatarDinheiro(valor)}</div>
    </div>
  )
}

function FormularioTransacao({ aoSalvar }) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [tipo, setTipo] = useState('gasto')
  const [fixo, setFixo] = useState(false)
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const valorNumerico = Math.abs(Number(valor))
      await api.criarTransacao({
        descricao,
        valor: tipo === 'gasto' ? -valorNumerico : valorNumerico,
        data,
        fixo,
      })
      setDescricao('')
      setValor('')
      setFixo(false)
      aoSalvar()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="stat-label">Descrição</label>
        <input className="field-input" value={descricao} onChange={(e) => setDescricao(e.target.value)} required style={{ width: 200 }} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="stat-label">Valor</label>
        <input type="number" step="0.01" className="field-input" value={valor} onChange={(e) => setValor(e.target.value)} required style={{ width: 120 }} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="stat-label">Data</label>
        <input type="date" className="field-input" value={data} onChange={(e) => setData(e.target.value)} required />
      </div>
      <select className="field-input" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: 120 }}>
        <option value="gasto">Gasto</option>
        <option value="receita">Receita</option>
      </select>
      <label className="flex items-center gap-1.5 text-sm text-muted">
        <input type="checkbox" checked={fixo} onChange={(e) => setFixo(e.target.checked)} />
        fixo
      </label>
      <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando…' : 'Lançar'}</button>
    </form>
  )
}

function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [erro, setErro] = useState('')
  const [sincronizando, setSincronizando] = useState(false)
  const [connectToken, setConnectToken] = useState(null)

  async function carregar() {
    try {
      setResumo(await api.resumo())
    } catch (err) {
      setErro(err.message)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleConectarBanco() {
    try {
      const { connectToken } = await api.connectToken()
      setConnectToken(connectToken)
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleSucessoConexao(itemData) {
    setConnectToken(null)
    await api.registrarItem(itemData.item.id)
    carregar()
  }

  async function handleSincronizar() {
    setSincronizando(true)
    try {
      await api.sincronizar()
      await carregar()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSincronizando(false)
    }
  }

  async function handleMarcarFixo(id, fixoAtual) {
    await api.marcarFixo(id, !fixoAtual)
    carregar()
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Financeiro</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={handleSincronizar} disabled={sincronizando}>
            {sincronizando ? 'Sincronizando…' : 'Sincronizar'}
          </button>
          <button className="btn-primary" onClick={handleConectarBanco}>Conectar banco</button>
        </div>
      </div>

      {erro && <div className="card border-bad-border bg-bad-bg text-sm text-bad-text">{erro}</div>}

      {resumo && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Gasto este mês" valor={resumo.totalGastoMes} cor="text-bad-text" />
          <StatCard label="Receita este mês" valor={resumo.totalReceitaMes} cor="text-good-text" />
          <StatCard label="Gastos fixos" valor={resumo.gastosFixosMes} />
          <StatCard label="Total investido" valor={resumo.totalInvestido} cor="text-brand-600" />
        </div>
      )}

      <FormularioTransacao aoSalvar={carregar} />

      <div className="card overflow-hidden p-0">
        <div className="border-b border-line px-5 py-3 text-sm font-semibold">Transações recentes</div>
        <div className="divide-y divide-line">
          {resumo?.transacoes?.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <div className="font-medium">{t.descricao}</div>
                <div className="text-xs text-muted">{t.data} · {t.contas?.nome || 'manual'}{t.categoria ? ` · ${t.categoria}` : ''}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={t.valor < 0 ? 'text-bad-text' : 'text-good-text'}>{formatarDinheiro(t.valor)}</span>
                <button
                  className={`rounded-full border px-2 py-0.5 text-xs ${t.fixo ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line text-muted'}`}
                  onClick={() => handleMarcarFixo(t.id, t.fixo)}
                >
                  fixo
                </button>
              </div>
            </div>
          ))}
          {resumo && resumo.transacoes?.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted">Nenhuma transação ainda — conecta um banco ou lança uma acima.</div>
          )}
        </div>
      </div>

      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          onSuccess={handleSucessoConexao}
          onError={(err) => setErro(err?.message || 'Falha ao conectar banco.')}
          onClose={() => setConnectToken(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  const [logado, setLogado] = useState(false)
  if (!logado) return <PasswordGate onEntrar={() => setLogado(true)} />
  return <Dashboard />
}
