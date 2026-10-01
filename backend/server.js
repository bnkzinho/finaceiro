import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import { supabase } from './supabase.js'
import { criarConnectToken } from './pluggy.js'
import { registrarNovoItem, sincronizarTodosOsItems } from './sincronizar.js'
import { pegarResumo, listarTransacoesRecentes, listarGastosFixos } from './resumo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const SENHA = process.env.FINANCEIRO_SENHA

if (!SENHA) {
  console.warn('FINANCEIRO_SENHA não definida — qualquer pessoa que achar a URL veria seus dados financeiros. Configure no .env.')
}

function exigirSenha(req, res, next) {
  if (SENHA && req.get('x-financeiro-senha') !== SENHA) {
    return res.status(401).json({ erro: 'senha inválida' })
  }
  next()
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/saude', (_req, res) => res.json({ ok: true, servico: 'financeiro-backend' }))

app.use('/api', exigirSenha)

app.get('/api/resumo', async (_req, res) => {
  try {
    const [resumo, transacoes] = await Promise.all([pegarResumo(), listarTransacoesRecentes()])
    res.json({ ...resumo, transacoes })
  } catch (err) {
    console.error('Erro no /api/resumo:', err)
    res.status(500).json({ erro: err.message })
  }
})

app.get('/api/gastos-fixos', async (_req, res) => {
  try {
    res.json(await listarGastosFixos())
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Token de uso único pro widget do Pluggy Connect abrir no navegador.
app.get('/api/pluggy/connect-token', async (_req, res) => {
  try {
    res.json({ connectToken: await criarConnectToken() })
  } catch (err) {
    console.error('Erro ao criar connect token:', err)
    res.status(500).json({ erro: err.message })
  }
})

// Chamado pelo frontend depois que o usuário termina de logar no banco
// pelo widget — recebe o itemId e já sincroniza contas/transações.
app.post('/api/pluggy/item', async (req, res) => {
  const { itemId } = req.body || {}
  if (!itemId) return res.status(400).json({ erro: 'itemId é obrigatório' })
  try {
    await registrarNovoItem(itemId)
    res.json({ ok: true })
  } catch (err) {
    console.error('Erro ao registrar item da Pluggy:', err)
    res.status(500).json({ erro: err.message })
  }
})

app.post('/api/sincronizar', async (_req, res) => {
  try {
    await sincronizarTodosOsItems()
    res.json({ ok: true })
  } catch (err) {
    console.error('Erro ao sincronizar:', err)
    res.status(500).json({ erro: err.message })
  }
})

// Lançamento manual (sem banco conectado) — de gasto, receita ou aporte.
app.post('/api/transacoes', async (req, res) => {
  const { descricao, valor, categoria, data, fixo } = req.body || {}
  if (!descricao || valor == null || !data) {
    return res.status(400).json({ erro: 'descricao, valor e data são obrigatórios' })
  }
  try {
    const { error } = await supabase
      .from('transacoes')
      .insert({ descricao, valor, categoria: categoria || null, data, fixo: Boolean(fixo), origem: 'manual' })
    if (error) throw new Error(error.message)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

app.patch('/api/transacoes/:id', async (req, res) => {
  const { fixo } = req.body || {}
  try {
    const { error } = await supabase.from('transacoes').update({ fixo: Boolean(fixo) }).eq('id', req.params.id)
    if (error) throw new Error(error.message)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

app.post('/api/investimentos', async (req, res) => {
  const { descricao, valor, data } = req.body || {}
  if (!descricao || valor == null || !data) {
    return res.status(400).json({ erro: 'descricao, valor e data são obrigatórios' })
  }
  try {
    const { error } = await supabase.from('investimentos').insert({ descricao, valor, data, origem: 'manual' })
    if (error) throw new Error(error.message)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Serve o site (frontend/dist, depois do `npm run build` no frontend)
// direto por aqui — um deploy só, sem CORS pra configurar.
const DIST = path.join(__dirname, '..', 'frontend', 'dist')
app.use(express.static(DIST))
app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')))

app.listen(PORT, () => {
  console.log(`Financeiro (backend) rodando em http://localhost:${PORT}`)
})
