// =============================================================
// Tipos do domínio LinkFlow — espelham o schema do Supabase.
// =============================================================

export type Plataforma = "nextjs" | "wordpress" | "outro";

export type ArtigoStatus = "rascunho" | "aprovado" | "publicado" | "indexado";

export type LinkStatus = "ativo" | "removido";

export interface Blog {
  id: string;
  user_id: string;
  nome: string;
  url: string;
  nicho: string;
  descricao: string | null;
  publico_alvo: string | null;
  dr: number;
  trafego_mensal: number;
  plataforma: Plataforma;
  wp_api_url: string | null;
  wp_api_key: string | null;
  limite_links_mes: number;
  ativo: boolean;
  criado_em: string;
}

export interface Relacionamento {
  id: string;
  user_id: string;
  blog_origem_id: string;
  blog_destino_id: string;
  relevancia: number;
  ativo: boolean;
  criado_em: string;
}

export interface Artigo {
  id: string;
  user_id: string;
  blog_origem_id: string;
  blog_destino_id: string;
  titulo: string;
  conteudo: string;
  anchor_text: string;
  palavra_chave: string | null;
  status: ArtigoStatus;
  url_publicada: string | null;
  publicado_em: string | null;
  indexado_em: string | null;
  criado_em: string;
}

export interface LinkAtivo {
  id: string;
  user_id: string;
  artigo_id: string;
  blog_origem_id: string;
  blog_destino_id: string;
  anchor_text: string;
  url_origem: string;
  url_destino: string;
  status: LinkStatus;
  criado_em: string;
}

export interface AnchorText {
  id: string;
  user_id: string;
  blog_destino_id: string;
  texto: string;
  vezes_usado: number;
  ultimo_uso: string | null;
  criado_em: string;
}

export interface Cadencia {
  id: string;
  user_id: string;
  blog_destino_id: string;
  mes: number;
  ano: number;
  links_recebidos: number;
  limite_mensal: number;
}
