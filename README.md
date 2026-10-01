# Financeiro

Site pessoal de finanças: conecta direto nos seus bancos (via Pluggy —
Open Finance), mostra quanto você gastou, quanto investiu, e separa os
gastos fixos. Também dá pra lançar manualmente.

## Como funciona

```
Navegador ──► backend (Node/Express, serve o site + API) ──► Supabase (dados)
                        │
                        └──► Pluggy (conexão com o banco)
```

Um deploy só: o backend serve o site (React) e a API no mesmo lugar —
sem CORS pra configurar, sem dois serviços pra manter no ar.

Protegido por uma **senha única** (não é login de usuário de verdade) —
suficiente pra uso pessoal, sem expor seus dados se alguém achar a URL.

## 1. Banco de dados (Supabase)

1. Cria um projeto **novo** em [supabase.com/dashboard](https://supabase.com/dashboard)
   (separado dos seus outros projetos — dado financeiro é mais sensível).
2. SQL Editor → cola e roda todo o conteúdo de `supabase/schema.sql`.
3. Project Settings → API → guarda a **Project URL** e a chave
   **service_role** (não a "anon" — essa aqui dá acesso total, só o
   backend usa, nunca aparece no navegador).

## 2. Conexão com os bancos (Pluggy)

1. Cria uma conta grátis em [dashboard.pluggy.ai](https://dashboard.pluggy.ai).
2. Settings → Credentials → guarda o **Client ID** e o **Client Secret**.

**Importante — melhor esforço:** a integração com a Pluggy foi escrita
seguindo a documentação oficial, mas eu não tenho como testar contra a
API de verdade (preciso das suas credenciais, que só você tem). É bem
possível que o primeiro teste de "Conectar banco" precise de um ajuste
fino — me manda a mensagem de erro exata que aparecer, ou abre o
DevTools do navegador (F12 → aba Console/Network) e copia o erro.

## 3. Publicar o backend (que também serve o site)

1. Cria uma conta em [render.com](https://render.com) (plano grátis).
2. **New +** → **Web Service** → conecta este repositório.
3. Root Directory: deixa em branco (raiz do repo).
4. Build Command:
   ```
   cd frontend && npm install && npm run build && cd ../backend && npm install
   ```
5. Start Command:
   ```
   cd backend && npm start
   ```
6. Em **Environment**, adiciona as variáveis (veja `backend/.env.example`):
   - `FINANCEIRO_SENHA` — inventa uma senha forte
   - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (passo 1)
   - `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` (passo 2)
7. Deploy. Guarda a URL (tipo `https://financeiro-xxxx.onrender.com`).

## 4. Usar

Abre a URL, digita a senha que você inventou. Clica em **Conectar
banco** pra abrir a tela de login do seu banco (via Pluggy — seguro,
você nunca digita a senha do banco num site que não seja o do próprio
banco, o widget da Pluggy só faz a ponte). Depois de conectar, clica em
**Sincronizar** pra trazer as transações mais recentes quando quiser.

Pra lançar algo manualmente (sem banco conectado), usa o formulário
"Lançar" na própria tela.

## O que já tem / o que falta

**Já funciona:**
- Dashboard com gasto do mês, receita do mês, gastos fixos, total investido
- Conectar banco de verdade via Pluggy, sincronizar transações
- Lançamento manual de gastos/receitas
- Marcar uma transação como "gasto fixo" (clicando nela)

**Ainda não tem:**
- Editar/apagar lançamentos manuais
- Gráficos (hoje é só números e lista)
- Categorização automática mais refinada (a Pluggy já manda uma
  categoria básica, mas não tem edição manual de categoria ainda)
- Investimentos lançados manualmente não têm formulário na tela ainda
  (a rota `/api/investimentos` já existe no backend, só falta o botão)
