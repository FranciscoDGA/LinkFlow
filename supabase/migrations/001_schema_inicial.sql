-- =============================================================
-- LinkFlow — Schema Inicial
-- SaaS de orquestração de backlinks internos para rede de blogs
-- =============================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- =============================================================
-- Tabela: blogs
-- =============================================================
create table if not exists blogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nome text not null,
  url text not null,
  nicho text not null,
  descricao text,
  publico_alvo text,
  dr integer default 0,
  trafego_mensal integer default 0,
  plataforma text default 'nextjs', -- nextjs | wordpress | outro
  wp_api_url text,                   -- para publicação automática (fase 2)
  wp_api_key text,
  limite_links_mes integer default 4,
  ativo boolean default true,
  criado_em timestamptz default now(),
  unique (user_id, url)
);

create index if not exists idx_blogs_user_id on blogs (user_id);
create index if not exists idx_blogs_nicho on blogs (nicho);

-- =============================================================
-- Tabela: relacionamentos
-- =============================================================
create table if not exists relacionamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  blog_origem_id uuid references blogs on delete cascade not null,
  blog_destino_id uuid references blogs on delete cascade not null,
  relevancia integer default 5,       -- 1 a 10
  ativo boolean default true,
  criado_em timestamptz default now(),
  unique (blog_origem_id, blog_destino_id),
  constraint chk_relevancia check (relevancia between 1 and 10),
  constraint chk_origem_destino_diferentes check (blog_origem_id <> blog_destino_id)
);

create index if not exists idx_relacionamentos_user_id on relacionamentos (user_id);
create index if not exists idx_relacionamentos_origem on relacionamentos (blog_origem_id);
create index if not exists idx_relacionamentos_destino on relacionamentos (blog_destino_id);

-- =============================================================
-- Tabela: artigos
-- =============================================================
create table if not exists artigos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  blog_origem_id uuid references blogs on delete cascade not null,
  blog_destino_id uuid references blogs on delete cascade not null,
  titulo text not null,
  conteudo text not null,
  anchor_text text not null,
  palavra_chave text,
  status text default 'rascunho',     -- rascunho | aprovado | publicado | indexado
  url_publicada text,
  publicado_em timestamptz,
  indexado_em timestamptz,
  criado_em timestamptz default now(),
  constraint chk_artigo_status check (status in ('rascunho', 'aprovado', 'publicado', 'indexado'))
);

create index if not exists idx_artigos_user_id on artigos (user_id);
create index if not exists idx_artigos_status on artigos (status);
create index if not exists idx_artigos_origem on artigos (blog_origem_id);
create index if not exists idx_artigos_destino on artigos (blog_destino_id);

-- =============================================================
-- Tabela: links_ativos
-- =============================================================
create table if not exists links_ativos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  artigo_id uuid references artigos on delete cascade not null,
  blog_origem_id uuid references blogs on delete cascade not null,
  blog_destino_id uuid references blogs on delete cascade not null,
  anchor_text text not null,
  url_origem text not null,
  url_destino text not null,
  status text default 'ativo',        -- ativo | removido
  criado_em timestamptz default now(),
  constraint chk_link_status check (status in ('ativo', 'removido'))
);

create index if not exists idx_links_user_id on links_ativos (user_id);
create index if not exists idx_links_status on links_ativos (status);
create index if not exists idx_links_origem on links_ativos (blog_origem_id);
create index if not exists idx_links_destino on links_ativos (blog_destino_id);

-- =============================================================
-- Tabela: anchor_texts
-- =============================================================
create table if not exists anchor_texts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  blog_destino_id uuid references blogs on delete cascade not null,
  texto text not null,
  vezes_usado integer default 0,
  ultimo_uso timestamptz,
  criado_em timestamptz default now(),
  unique (blog_destino_id, texto)
);

create index if not exists idx_anchor_user_id on anchor_texts (user_id);
create index if not exists idx_anchor_destino on anchor_texts (blog_destino_id);

-- =============================================================
-- Tabela: cadencia
-- =============================================================
create table if not exists cadencia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  blog_destino_id uuid references blogs on delete cascade not null,
  mes integer not null,
  ano integer not null,
  links_recebidos integer default 0,
  limite_mensal integer default 4,    -- máximo de links novos por mês
  unique (blog_destino_id, mes, ano),
  constraint chk_mes check (mes between 1 and 12)
);

create index if not exists idx_cadencia_user_id on cadencia (user_id);
create index if not exists idx_cadencia_destino on cadencia (blog_destino_id);

-- =============================================================
-- Row Level Security (RLS)
-- Cada usuário só acessa seus próprios registros.
-- =============================================================
alter table blogs enable row level security;
alter table relacionamentos enable row level security;
alter table artigos enable row level security;
alter table links_ativos enable row level security;
alter table anchor_texts enable row level security;
alter table cadencia enable row level security;

-- Policies: blogs
create policy "usuario_le_seus_blogs" on blogs
  for select using (auth.uid() = user_id);
create policy "usuario_insere_seus_blogs" on blogs
  for insert with check (auth.uid() = user_id);
create policy "usuario_atualiza_seus_blogs" on blogs
  for update using (auth.uid() = user_id);
create policy "usuario_deleta_seus_blogs" on blogs
  for delete using (auth.uid() = user_id);

-- Policies: relacionamentos
create policy "usuario_le_seus_relacionamentos" on relacionamentos
  for select using (auth.uid() = user_id);
create policy "usuario_insere_seus_relacionamentos" on relacionamentos
  for insert with check (auth.uid() = user_id);
create policy "usuario_atualiza_seus_relacionamentos" on relacionamentos
  for update using (auth.uid() = user_id);
create policy "usuario_deleta_seus_relacionamentos" on relacionamentos
  for delete using (auth.uid() = user_id);

-- Policies: artigos
create policy "usuario_le_seus_artigos" on artigos
  for select using (auth.uid() = user_id);
create policy "usuario_insere_seus_artigos" on artigos
  for insert with check (auth.uid() = user_id);
create policy "usuario_atualiza_seus_artigos" on artigos
  for update using (auth.uid() = user_id);
create policy "usuario_deleta_seus_artigos" on artigos
  for delete using (auth.uid() = user_id);

-- Policies: links_ativos
create policy "usuario_le_seus_links" on links_ativos
  for select using (auth.uid() = user_id);
create policy "usuario_insere_seus_links" on links_ativos
  for insert with check (auth.uid() = user_id);
create policy "usuario_atualiza_seus_links" on links_ativos
  for update using (auth.uid() = user_id);
create policy "usuario_deleta_seus_links" on links_ativos
  for delete using (auth.uid() = user_id);

-- Policies: anchor_texts
create policy "usuario_le_seus_anchors" on anchor_texts
  for select using (auth.uid() = user_id);
create policy "usuario_insere_seus_anchors" on anchor_texts
  for insert with check (auth.uid() = user_id);
create policy "usuario_atualiza_seus_anchors" on anchor_texts
  for update using (auth.uid() = user_id);
create policy "usuario_deleta_seus_anchors" on anchor_texts
  for delete using (auth.uid() = user_id);

-- Policies: cadencia
create policy "usuario_le_sua_cadencia" on cadencia
  for select using (auth.uid() = user_id);
create policy "usuario_insere_sua_cadencia" on cadencia
  for insert with check (auth.uid() = user_id);
create policy "usuario_atualiza_sua_cadencia" on cadencia
  for update using (auth.uid() = user_id);
create policy "usuario_deleta_sua_cadencia" on cadencia
  for delete using (auth.uid() = user_id);
