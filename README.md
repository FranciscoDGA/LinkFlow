# LinkFlow

SaaS de orquestração de **backlinks internos** para uma rede de blogs. Gera
artigos com IA, respeita cadência de links por site e controla diversidade de
anchor texts para evitar footprint de SEO.

## Stack

- **Next.js 14** (App Router) — frontend + backend
- **Supabase** (PostgreSQL) — banco de dados e Auth
- **Anthropic API** (`claude-sonnet-4-6`) — geração de artigos
- **Tailwind CSS** — estilização
- **Vercel** — deploy

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

### 3. Banco de dados

Rode a migration no seu projeto Supabase (SQL Editor ou CLI):

```bash
supabase/migrations/001_schema_inicial.sql
```

Isso cria as tabelas (`blogs`, `relacionamentos`, `artigos`, `links_ativos`,
`anchor_texts`, `cadencia`) com Row Level Security ativado — cada usuário só
acessa os próprios registros.

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Rotas protegidas
redirecionam para `/login` quando não autenticado.

## Estrutura

```
app/
  (auth)/          # login, register e server actions de auth
  (dashboard)/     # área protegida (sidebar + header)
components/ui/     # Sidebar, Header, StatCard, etc.
lib/
  supabase/        # clients (browser/server) e middleware de sessão
  types.ts         # tipos do domínio
supabase/
  migrations/      # schema SQL
```

## Roadmap (Sprints)

- **Sprint 1** — Base: setup, Auth, migrations, layout do dashboard ✅
- **Sprint 2** — CRUD de blogs
- **Sprint 3** — Mapa de relacionamentos
- **Sprint 4** — Geração de artigo com Claude
- **Sprint 5** — Fila e publicação
- **Sprint 6** — Links ativos, anchor texts, cadência e alertas
- **Sprint 7** — Fase 2: WordPress REST API, Google Search Console, multi-tenant
