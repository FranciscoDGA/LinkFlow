-- ==============================================================================
-- CENTRAL EDITORIAL INTELIGENTE — MIGRATION 001: INITIAL SCHEMA
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ADMIN PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_profiles_read_self" ON public.admin_profiles
    FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Trigger automático para autorizar novos administradores criados no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_profiles (user_id, email, full_name, is_active, is_super_admin)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrador LinkFlow'), true, true)
    ON CONFLICT (user_id) DO UPDATE SET is_active = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_iat DOUBLE PRECISION;
    v_admin RECORD;
BEGIN
    BEGIN
        v_iat := (auth.jwt() ->> 'iat')::DOUBLE PRECISION;
    EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
    END;

    IF v_iat IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT is_active, revoked_at 
    INTO v_admin
    FROM public.admin_profiles 
    WHERE user_id = auth.uid();

    IF NOT FOUND OR v_admin.is_active = FALSE THEN
        RETURN FALSE;
    END IF;

    IF v_admin.revoked_at IS NOT NULL AND to_timestamp(v_iat) <= v_admin.revoked_at THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;
ALTER FUNCTION public.is_authorized_admin() OWNER TO postgres;

-- ------------------------------------------------------------------------------
-- 2. SITES & CONFIGURAÇÕES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    description TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('passacumaru_api', 'github_pr_astro', 'github_pr_next', 'github_pr_html')),
    public_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_site_id_active UNIQUE (id, is_active)
);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites_select" ON public.sites FOR SELECT TO authenticated USING (public.is_authorized_admin());
CREATE POLICY "sites_insert" ON public.sites FOR INSERT TO authenticated WITH CHECK (public.is_authorized_admin());
CREATE POLICY "sites_update" ON public.sites FOR UPDATE TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());

CREATE TABLE IF NOT EXISTS public.site_settings (
    site_id UUID PRIMARY KEY REFERENCES public.sites(id) ON DELETE RESTRICT,
    language TEXT NOT NULL DEFAULT 'pt-BR',
    default_author TEXT NOT NULL,
    content_path_pattern TEXT NOT NULL DEFAULT '^src/content/guides/[a-z0-9\-]+\.md$',
    integration_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_select" ON public.site_settings FOR SELECT TO authenticated USING (public.is_authorized_admin());
CREATE POLICY "site_settings_update" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());

-- ------------------------------------------------------------------------------
-- 3. PAUTAS (TOPICS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    primary_keyword TEXT NOT NULL,
    secondary_keywords TEXT[] NOT NULL DEFAULT '{}',
    theme TEXT,
    search_intent TEXT NOT NULL DEFAULT 'informational' CHECK (search_intent IN ('informational', 'commercial', 'transactional', 'navigational')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_production', 'completed', 'canceled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_topic_site_composite UNIQUE (id, site_id)
);
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topics_select" ON public.topics FOR SELECT TO authenticated USING (public.is_authorized_admin());
CREATE POLICY "topics_insert" ON public.topics FOR INSERT TO authenticated WITH CHECK (public.is_authorized_admin());
CREATE POLICY "topics_update" ON public.topics FOR UPDATE TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());
CREATE POLICY "topics_delete" ON public.topics FOR DELETE TO authenticated USING (public.is_authorized_admin());

-- ------------------------------------------------------------------------------
-- 4. ARTIGOS & VERSÕES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE RESTRICT,
    topic_id UUID,
    current_version INT NOT NULL DEFAULT 0,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    primary_keyword TEXT,
    seo_description TEXT,
    content_markdown TEXT,
    status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'in_production', 'reviewing', 'approved', 'archived')),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_site_slug UNIQUE (site_id, slug),
    CONSTRAINT uq_article_site_composite UNIQUE (id, site_id),
    CONSTRAINT fk_article_topic_site FOREIGN KEY (topic_id, site_id)
        REFERENCES public.topics(id, site_id) ON DELETE RESTRICT
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_select" ON public.articles FOR SELECT TO authenticated USING (public.is_authorized_admin());
CREATE POLICY "articles_insert" ON public.articles FOR INSERT TO authenticated WITH CHECK (public.is_authorized_admin());
CREATE POLICY "articles_update" ON public.articles FOR UPDATE TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());
CREATE POLICY "articles_delete" ON public.articles FOR DELETE TO authenticated USING (public.is_authorized_admin());

CREATE TABLE IF NOT EXISTS public.article_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE RESTRICT,
    version_number INT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content_html TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    content_hash TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_article_version UNIQUE (article_id, version_number)
);
ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "versions_select" ON public.article_versions FOR SELECT TO authenticated USING (public.is_authorized_admin());
CREATE POLICY "versions_insert" ON public.article_versions FOR INSERT TO authenticated WITH CHECK (public.is_authorized_admin());

-- ------------------------------------------------------------------------------
-- 5. REGISTRO DE ATIVIDADES (AUDIT LOGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('site', 'topic', 'article', 'auth', 'settings')),
    entity_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_logs_select" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_authorized_admin());

-- ------------------------------------------------------------------------------
-- 6. CONFIGURAÇÕES DO SISTEMA (APP SETTINGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_settings_select" ON public.app_settings FOR SELECT TO authenticated USING (public.is_authorized_admin());
CREATE POLICY "app_settings_update" ON public.app_settings FOR UPDATE TO authenticated USING (public.is_authorized_admin()) WITH CHECK (public.is_authorized_admin());

-- ------------------------------------------------------------------------------
-- 7. TRIGGERS DE SEGURANÇA E IMUTABILIDADE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_prevent_immutable_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operação proibida: esta tabela é estritamente imutável (append-only).';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_versions_no_update_delete
BEFORE UPDATE OR DELETE ON public.article_versions
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_immutable_modification();

CREATE TRIGGER trg_activity_logs_no_update_delete
BEFORE UPDATE OR DELETE ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_immutable_modification();

-- ------------------------------------------------------------------------------
-- 8. MATRIZ DE PRIVILÉGIOS (REVOKE / GRANT)
-- ------------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.admin_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.sites TO authenticated;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT SELECT, INSERT ON public.article_versions TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT, UPDATE ON public.app_settings TO authenticated;

-- Service role tem acesso total exclusivo no backend
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
