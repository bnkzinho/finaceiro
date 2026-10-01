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

function SyncIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

function BankIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v9M10 10v9M14 10v9M19 10v9" />
      <path d="M3 19h18" />
    </svg>
  )
}

function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ArrowMovimento({ saida }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${saida ? 'bg-bad-bg text-bad-text' : 'bg-good-bg text-good-text'}`}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {saida ? <path d="M12 5v14M18 13l-6 6-6-6" /> : <path d="M12 19V5M6 11l6-6 6 6" />}
      </svg>
    </span>
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

// Paleta categórica validada (ordem fixa, ΔE conferido contra o fundo escuro do app) —
// nunca gera cor nova pra uma categoria: depois do 6º slot, agrupa em "Outros".
const PALETA_CATEGORIAS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300']
const COR_OUTROS = '#5c574a'

function agruparGastosPorCategoria(transacoes) {
  const mesAtual = new Date().toISOString().slice(0, 7)
  const porCategoria = new Map()

  for (const t of transacoes) {
    if (t.valor >= 0) continue
    if (t.data.slice(0, 7) !== mesAtual) continue
    const chave = t.categoria || 'Sem categoria'
    porCategoria.set(chave, (porCategoria.get(chave) || 0) + Math.abs(t.valor))
  }

  const ordenado = [...porCategoria.entries()].sort((a, b) => b[1] - a[1])
  const principais = ordenado.slice(0, PALETA_CATEGORIAS.length)
  const resto = ordenado.slice(PALETA_CATEGORIAS.length)
  if (resto.length > 0) {
    principais.push(['Outros', resto.reduce((s, [, v]) => s + v, 0)])
  }

  const total = principais.reduce((s, [, v]) => s + v, 0)
  return principais.map(([nome, valor], i) => ({
    nome,
    valor,
    pct: total > 0 ? (valor / total) * 100 : 0,
    cor: nome === 'Outros' ? COR_OUTROS : PALETA_CATEGORIAS[i],
  }))
}

function GastosDonut({ dados }) {
  const total = dados.reduce((s, d) => s + d.valor, 0)
  const raio = 40
  const circunferencia = 2 * Math.PI * raio
  const gap = 2.5
  let acumulado = 0

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" width="160" height="160" className="-rotate-90">
          <circle cx="50" cy="50" r={raio} fill="none" stroke="#2a2620" strokeWidth="14" />
          {dados.map((d) => {
            const comprimento = total > 0 ? (d.valor / total) * circunferencia : 0
            const segmento = Math.max(comprimento - gap, 0)
            const offset = -acumulado
            acumulado += comprimento
            return (
              <circle
                key={d.nome}
                cx="50"
                cy="50"
                r={raio}
                fill="none"
                stroke={d.cor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${segmento} ${circunferencia - segmento}`}
                strokeDashoffset={offset}
              >
                <title>{`${d.nome}: ${formatarDinheiro(d.valor)} (${d.pct.toFixed(0)}%)`}</title>
              </circle>
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted">Gastos</span>
          <span className="text-sm font-semibold text-ink">{formatarDinheiro(total)}</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        {dados.map((d) => (
          <div key={d.nome} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.cor }} />
              {d.nome}
            </span>
            <span className="text-muted">{d.pct.toFixed(0)}%</span>
          </div>
        ))}
        {dados.length === 0 && <span className="text-sm text-muted">Sem gastos categorizados este mês ainda.</span>}
      </div>
    </div>
  )
}

function FormularioTransacao({ aoSalvar, aoFechar }) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('')
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
        categoria: categoria || null,
        data,
        fixo,
      })
      setDescricao('')
      setValor('')
      setCategoria('')
      setFixo(false)
      aoSalvar()
      aoFechar?.()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="stat-label">Descrição</label>
        <input className="field-input" value={descricao} onChange={(e) => setDescricao(e.target.value)} required style={{ width: 180 }} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="stat-label">Valor</label>
        <input type="number" step="0.01" className="field-input" value={valor} onChange={(e) => setValor(e.target.value)} required style={{ width: 110 }} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="stat-label">Categoria</label>
        <input className="field-input" placeholder="opcional" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ width: 130 }} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="stat-label">Data</label>
        <input type="date" className="field-input" value={data} onChange={(e) => setData(e.target.value)} required />
      </div>
      <select className="field-input" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: 110 }}>
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

const FILTROS = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'gastos', rotulo: 'Gastos' },
  { chave: 'receitas', rotulo: 'Receitas' },
  { chave: 'fixos', rotulo: 'Fixos' },
]

function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [erro, setErro] = useState('')
  const [sincronizando, setSincronizando] = useState(false)
  const [connectToken, setConnectToken] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtro, setFiltro] = useState('todos')

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

  const saldoMes = resumo ? resumo.totalReceitaMes - resumo.totalGastoMes : 0
  const transacoes = resumo?.transacoes || []
  const transacoesFiltradas = transacoes.filter((t) => {
    if (filtro === 'gastos') return t.valor < 0
    if (filtro === 'receitas') return t.valor > 0
    if (filtro === 'fixos') return t.fixo
    return true
  })
  const dadosDonut = agruparGastosPorCategoria(transacoes)

  return (
    <div className="min-h-screen bg-[#0b0b0d]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-brand-500/40 text-brand-500">
              <LockIcon />
            </div>
            <span className="text-sm font-semibold tracking-[0.25em] text-ink">FINANCEIRO</span>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setMostrarForm((v) => !v)}>
              <PlusIcon /> Lançar
            </button>
            <button className="btn-ghost" onClick={handleSincronizar} disabled={sincronizando}>
              <SyncIcon className={sincronizando ? 'animate-spin' : ''} />
              {sincronizando ? 'Sincronizando…' : 'Sincronizar'}
            </button>
            <button className="btn-primary" onClick={handleConectarBanco}>
              <BankIcon /> Conectar banco
            </button>
          </div>
        </div>

        {erro && <div className="card border-bad-border bg-bad-bg text-sm text-bad-text">{erro}</div>}

        {resumo && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card sm:col-span-2">
              <div className="stat-label">Saldo do mês</div>
              <div className={`mt-1 text-3xl font-semibold leading-tight ${saldoMes < 0 ? 'text-bad-text' : 'text-good-text'}`}>
                {formatarDinheiro(saldoMes)}
              </div>
              <div className="mt-3 flex gap-5 text-xs text-muted">
                <span>Receita: <span className="text-good-text">{formatarDinheiro(resumo.totalReceitaMes)}</span></span>
                <span>Gasto: <span className="text-bad-text">{formatarDinheiro(resumo.totalGastoMes)}</span></span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <StatCard label="Gastos fixos" valor={resumo.gastosFixosMes} />
              <StatCard label="Total investido" valor={resumo.totalInvestido} cor="text-brand-500" />
            </div>
          </div>
        )}

        {mostrarForm && <FormularioTransacao aoSalvar={carregar} aoFechar={() => setMostrarForm(false)} />}

        <div className="card">
          <div className="mb-4 text-sm font-semibold text-ink">Seus gastos do mês</div>
          <GastosDonut dados={dadosDonut} />
        </div>

        <div className="card overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
            <span className="text-sm font-semibold text-ink">Movimentações</span>
            <div className="flex gap-1.5">
              {FILTROS.map((f) => (
                <button
                  key={f.chave}
                  onClick={() => setFiltro(f.chave)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filtro === f.chave ? 'bg-gradient-to-r from-[#e0bb7c] to-[#b98f4a] text-[#1a1510]' : 'border border-line text-muted hover:text-ink'
                  }`}
                >
                  {f.rotulo}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-line">
            {transacoesFiltradas.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <ArrowMovimento saida={t.valor < 0} />
                  <div>
                    <div className="font-medium text-ink">{t.descricao}</div>
                    <div className="text-xs text-muted">{t.data} · {t.contas?.nome || 'manual'}{t.categoria ? ` · ${t.categoria}` : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={t.valor < 0 ? 'text-bad-text' : 'text-good-text'}>{formatarDinheiro(t.valor)}</span>
                  <button
                    className={`rounded-full border px-2 py-0.5 text-xs ${t.fixo ? 'border-brand-500 bg-brand-50 text-brand-500' : 'border-line text-muted'}`}
                    onClick={() => handleMarcarFixo(t.id, t.fixo)}
                  >
                    fixo
                  </button>
                </div>
              </div>
            ))}
            {resumo && transacoesFiltradas.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted">Nenhuma transação aqui ainda — conecta um banco ou lança uma acima.</div>
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
    </div>
  )
}

export default function App() {
  const [logado, setLogado] = useState(false)
  if (!logado) return <PasswordGate onEntrar={() => setLogado(true)} />
  return <Dashboard />
}
