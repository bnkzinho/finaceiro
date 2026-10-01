-- Financeiro — schema do Supabase. Rode isso inteiro no SQL Editor do
-- seu projeto Supabase (cria um projeto novo, separado dos outros —
-- dado financeiro é mais sensível, melhor não misturar).

create extension if not exists pgcrypto;

-- Uma "conexão" com um banco via Pluggy (pode ter várias contas dentro
-- do mesmo item — ex: conta corrente + cartão de crédito do mesmo banco).
create table if not exists public.pluggy_items (
  id uuid primary key default gen_random_uuid(),
  pluggy_item_id text not null unique,
  instituicao text,
  status text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.contas (
  id uuid primary key default gen_random_uuid(),
  pluggy_item_id uuid references public.pluggy_items(id) on delete cascade,
  pluggy_account_id text unique, -- null = conta criada manualmente
  nome text not null,
  tipo text not null default 'BANK' check (tipo in ('BANK', 'CREDIT', 'INVESTMENT', 'MANUAL')),
  instituicao text,
  saldo numeric(14,2) not null default 0,
  atualizado_em timestamptz not null default now(),
  criado_em timestamptz not null default now()
);

create table if not exists public.transacoes (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid references public.contas(id) on delete cascade,
  pluggy_transaction_id text unique, -- null = lançada manualmente
  descricao text not null,
  valor numeric(14,2) not null, -- negativo = gasto, positivo = receita (mesmo padrão da Pluggy)
  categoria text,
  data date not null,
  fixo boolean not null default false, -- marcado como "gasto fixo" (aluguel, assinatura, etc)
  origem text not null default 'manual' check (origem in ('pluggy', 'manual')),
  criado_em timestamptz not null default now()
);

create table if not exists public.investimentos (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid references public.contas(id) on delete set null,
  descricao text not null,
  valor numeric(14,2) not null, -- positivo = aporte, negativo = resgate
  data date not null,
  origem text not null default 'manual' check (origem in ('pluggy', 'manual')),
  criado_em timestamptz not null default now()
);

create index if not exists idx_transacoes_data on public.transacoes(data);
create index if not exists idx_transacoes_conta on public.transacoes(conta_id);
create index if not exists idx_investimentos_data on public.investimentos(data);

-- Uso pessoal, protegido por uma senha única no backend (não por login
-- de usuário) — então RLS fica desligado e o backend usa a chave
-- "service_role" (acesso total), nunca a chave anon pública direto do
-- navegador. Veja backend/.env.example.
alter table public.pluggy_items disable row level security;
alter table public.contas disable row level security;
alter table public.transacoes disable row level security;
alter table public.investimentos disable row level security;
