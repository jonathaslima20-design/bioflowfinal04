import { supabase } from '@/lib/supabase';
import { DEMO_PROFILE, DEMO_LINKS, DEMO_SOCIALS, DEMO_VIDEOS, DEMO_BANNERS } from '@/components/themes/demoData';

export type ShowcasePreset = {
  theme_key: string;
  catalog_profile: Record<string, any>;
  catalog_links: any[];
  catalog_socials: any[];
  catalog_videos: any[];
  catalog_banners: any[];
  catalog_theme_core: Record<string, any>;
  catalog_theme_settings: Record<string, any>;
  landing_profile: Record<string, any>;
  landing_links: any[];
  landing_socials: any[];
  landing_videos: any[];
  landing_banners: any[];
  landing_theme_core: Record<string, any>;
  landing_theme_settings: Record<string, any>;
  landing_tagline: string;
  show_in_catalog: boolean;
  show_in_landing_carousel: boolean;
  landing_order: number;
  updated_at?: string;
  updated_by?: string | null;
};

export type ShowcaseDemoData = {
  profile: Record<string, any>;
  links: any[];
  socials: any[];
  videos: any[];
  banners: any[];
  themeCore: Record<string, any>;
  themeSettings: Record<string, any>;
};

export function emptyPreset(themeKey: string): ShowcasePreset {
  return {
    theme_key: themeKey,
    catalog_profile: {},
    catalog_links: [],
    catalog_socials: [],
    catalog_videos: [],
    catalog_banners: [],
    catalog_theme_core: {},
    catalog_theme_settings: {},
    landing_profile: {},
    landing_links: [],
    landing_socials: [],
    landing_videos: [],
    landing_banners: [],
    landing_theme_core: {},
    landing_theme_settings: {},
    landing_tagline: '',
    show_in_catalog: true,
    show_in_landing_carousel: false,
    landing_order: 0,
  };
}

function mergeDemo(kind: 'catalog' | 'landing', preset: ShowcasePreset | null | undefined): ShowcaseDemoData {
  const p = preset || emptyPreset('');
  const profileOverride = kind === 'catalog' ? p.catalog_profile : p.landing_profile;
  const linksOverride = kind === 'catalog' ? p.catalog_links : p.landing_links;
  const socialsOverride = kind === 'catalog' ? p.catalog_socials : p.landing_socials;
  const videosOverride = kind === 'catalog' ? p.catalog_videos : p.landing_videos;
  const bannersOverride = kind === 'catalog' ? p.catalog_banners : p.landing_banners;
  const themeCore = (kind === 'catalog' ? p.catalog_theme_core : p.landing_theme_core) || {};
  const themeSettings = (kind === 'catalog' ? p.catalog_theme_settings : p.landing_theme_settings) || {};

  const profile = { ...DEMO_PROFILE, ...(profileOverride || {}), ...themeCore };
  const links = Array.isArray(linksOverride) && linksOverride.length > 0 ? linksOverride : DEMO_LINKS;
  const socials = Array.isArray(socialsOverride) && socialsOverride.length > 0 ? socialsOverride : DEMO_SOCIALS;
  const videos = Array.isArray(videosOverride) ? videosOverride : [];
  const banners = Array.isArray(bannersOverride) ? bannersOverride : [];

  return { profile, links, socials, videos, banners, themeCore, themeSettings };
}

export function catalogDemoFor(preset: ShowcasePreset | null | undefined): ShowcaseDemoData {
  return mergeDemo('catalog', preset);
}

export function landingDemoFor(preset: ShowcasePreset | null | undefined): ShowcaseDemoData {
  return mergeDemo('landing', preset);
}

export async function fetchAllShowcasePresets(): Promise<ShowcasePreset[]> {
  const { data, error } = await supabase
    .from('theme_showcase_presets')
    .select('*');
  if (error || !data) return [];
  return data as ShowcasePreset[];
}

export async function fetchLandingShowcase(): Promise<ShowcasePreset[]> {
  const { data, error } = await supabase
    .from('theme_showcase_presets')
    .select('*')
    .eq('show_in_landing_carousel', true)
    .order('landing_order', { ascending: true });
  if (error || !data) return [];
  return data as ShowcasePreset[];
}

export async function fetchShowcasePreset(themeKey: string): Promise<ShowcasePreset | null> {
  const { data, error } = await supabase
    .from('theme_showcase_presets')
    .select('*')
    .eq('theme_key', themeKey)
    .maybeSingle();
  if (error) return null;
  return (data as ShowcasePreset) || null;
}

export async function upsertShowcasePreset(preset: ShowcasePreset) {
  const { data: u } = await supabase.auth.getUser();
  const payload = { ...preset, updated_at: new Date().toISOString(), updated_by: u.user?.id ?? null };
  const { error } = await supabase
    .from('theme_showcase_presets')
    .upsert(payload, { onConflict: 'theme_key' });
  return { error };
}
