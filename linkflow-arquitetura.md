# LinkFlow — Arquitetura e Fluxo de Dados

## 📊 Modelo de Dados

### Tabelas Principais

#### `blogs`
- Blogs da rede de backlinks do usuário
- Campos: id, user_id, nome, url, nicho, dr, trafego_mensal, limite_links_mes, plataforma (nextjs|wordpress|outro)
- RLS: usuário acessa apenas seus blogs

#### `relacionamentos`
- Matriz de conexões: qual blog pode linkar para qual
- Campos: id, user_id, blog_origem_id, blog_destino_id, relevancia (1-10), ativo
- Restrição: origem ≠ destino
- RLS: usuário acessa apenas seus relacionamentos

#### `artigos`
- Artigos gerados pela IA
- Campos: id, user_id, blog_origem_id, blog_destino_id, titulo, conteudo (HTML), anchor_text, palavra_chave, status, url_publicada, publicado_em, indexado_em
- Status: rascunho → aprovado → publicado → indexado
- RLS: usuário acessa apenas seus artigos

#### `links_ativos`
- Registry de links publicados e em funcionamento
- Campos: id, user_id, artigo_id, blog_origem_id, blog_destino_id, anchor_text, url_origem, url_destino, status (ativo|removido)
- Criado quando artigo passa para "publicado"
- RLS: usuário acessa apenas seus links

#### `anchor_texts`
- Pool de anchor texts para cada blog destino
- Campos: id, user_id, blog_destino_id, texto, vezes_usado, ultimo_uso
- Uso: Sugerir anchors menos usados em gerações futuras
- RLS: usuário acessa apenas seus anchors

#### `cadencia`
- Controle de limite de links por mês
- Campos: id, user_id, blog_destino_id, mes, ano, links_recebidos, limite_mensal
- Criado automaticamente ou incrementado ao publicar
- RLS: usuário acessa apenas sua cadência

---

## 🔄 Fluxo de Geração e Publicação

### Sprint 4: Geração (✅ Completo)
```
1. Usuário seleciona blog_destino
2. Sistema filtra blogs_origem (relacionamentos ativos)
3. Usuário define: palavra_chave, anchor_text, titulo
4. IA gera conteúdo HTML (Claude Sonnet 4.6)
5. Artigo salvo como RASCUNHO
6. Anchor text registrado em anchor_texts
7. Cadencia incrementada
```

### Sprint 5: Revisão e Publicação (🚀 Iniciando)
```
RASCUNHO → APROVADO → PUBLICADO → INDEXADO

Status: RASCUNHO
- Página /artigos/[id]: Visualizar + Editar + Aprovar
- Editor simples de HTML
- Botão "Aprovar" → muda para APROVADO

Status: APROVADO
- Página /artigos: Listar com filtro
- Botão "Publicar" → muda para PUBLICADO
- Ao publicar:
  * Salva registro em links_ativos
  * Salva url_publicada e publicado_em
  * Incrementa links_recebidos em cadencia

Status: PUBLICADO
- Botão "Verificar Indexação" → pesquisa Google
- Após confirmação → INDEXADO

Status: INDEXADO
- Apenas visualização/arquivo
```

---

## 💾 Validações Críticas

### Ao Publicar
```javascript
✓ Blog ainda ativo?
✓ Relacionamento ainda ativo?
✓ Limite mensal não atingido?
✓ URL publicada informada?
```

### Ao Salvar em links_ativos
```javascript
✓ blog_origem_id e blog_destino_id validados
✓ URL origem e destino informadas
✓ anchor_text não vazio
```

---

## 🎨 Páginas e Componentes

### /artigos (Lista)
- **Página**: `app/(dashboard)/artigos/page.tsx`
- **Filtros**: status, blog_origem, blog_destino, data
- **Ações por status**:
  - RASCUNHO: Revisar, Deletar
  - APROVADO: Publicar, Voltar para rascunho
  - PUBLICADO: Verificar indexação, Ver links ativos
  - INDEXADO: Ver links ativos

### /artigos/[id] (Detalhe)
- **Página**: `app/(dashboard)/artigos/[id]/page.tsx`
- **Componentes**:
  - ArtigoPreview: Visualiza o HTML
  - ArtigoEditor: Editor simples (textarea ou contenteditable)
  - ArtigoAcoes: Botões de ação por status

### / (Dashboard Home)
- **Melhorias**:
  - Contador: "X artigos aguardando revisão"
  - Contador: "X artigos prontos para publicação"
  - Último artigo gerado

---

## 🔐 RLS Policies

Todas as operações são protegidas por RLS no Supabase:
```sql
-- Exemplo: usuário só vê seus artigos
SELECT * FROM artigos WHERE user_id = auth.uid()
```

---

## 🚀 Próximas Sprints

- **Sprint 6**: Google Search Console (verificar indexação real)
- **Sprint 7**: WordPress REST API (publicação automática)
- **Sprint 8**: Multi-tenant + billing
