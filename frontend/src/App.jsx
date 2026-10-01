import { useEffect, useState } from 'react'
import { PluggyConnect } from 'react-pluggy-connect'
import { api, salvarSenha } from './api.js'

function formatarDinheiro(valor) {
  return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function EyeIcon({ off }) {
  return off ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 9.5 6 9.5 7a13.2 13.2 0 0 1-3.2 3.8M6.4 6.5C3.8 8.2 2.5 11 2.5 12c0 1 3.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8" />
      <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PasswordGate({ onEntrar }) {
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setEntrando(true)
    setErro('')
    salvarSenha(senha)
    try {
      await api.resumo()
      onEntrar()
    } catch (err) {
      setErro(err.message || 'Senha incorreta.')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0b0b0d]">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#0b0b0d_0%,#1a1710_55%,#0b0b0d_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,175,106,0.16),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(212,175,106,0.10),transparent_50%)]" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d4af6a]/40 text-[#d4af6a]">
            <LockIcon />
          </div>
          <span className="text-sm font-semibold tracking-[0.25em] text-[#f2e8d5]">FINANCEIRO</span>
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-3xl font-semibold leading-tight text-[#f2e8d5]">Seu dinheiro, organizado.</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#cdbf9b]">
            Conectado direto nos seus bancos — mostra quanto você gastou, quanto investiu e separa os gastos fixos, tudo num só lugar.
          </p>
        </div>

        <div className="relative flex gap-8 text-xs text-[#938768]">
          <span>Conexão direta com bancos</span>
          <span>Gastos e investimentos juntos</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#0e0e10] p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-[#2a2620] bg-[#151316] p-8 shadow-2xl">
          <h1 className="text-xl font-semibold text-[#f2e8d5]">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-[#938768]">Digite a senha pra acessar seu painel financeiro.</p>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#2a2620] bg-[#0e0e10] px-3 py-2.5 focus-within:border-[#d4af6a]/50">
            <LockIcon className="shrink-0 text-[#938768]" />
            <input
              type={mostrarSenha ? 'text' : 'password'}
              className="w-full bg-transparent text-sm text-[#f2e8d5] placeholder:text-[#6b6354] focus:outline-none"
              placeholder="Senha"
              autoFocus
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="shrink-0 text-[#938768] transition hover:text-[#d4af6a]"
              aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
            >
              <EyeIcon off={!mostrarSenha} />
            </button>
          </div>

          {erro && <p className="mt-3 text-sm text-[#e98a7a]">{erro}</p>}

          <button
            type="submit"
            disabled={entrando}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#e0bb7c] to-[#b98f4a] px-4 py-2.5 text-sm font-semibold text-[#1a1510] transition hover:brightness-110 disabled:opacity-60"
          >
            {entrando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
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
