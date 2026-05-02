import type { BioProfile } from '@/themes/types';

export const DEMO_PROFILE: Partial<BioProfile> = {
  id: 'demo',
  username: 'maria.cria',
  display_name: '@maria.cria',
  bio: 'Criadora de conteudo - SP',
  avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=256',
  theme: 'brutalist',
  theme_settings: {},
  avatar_size: 90,
  is_pro: false,
};

export const DEMO_LINKS = [
  { id: 'l1', title: 'Meu novo curso', subtitle: 'Inscricoes abertas', url: '#', is_active: true },
  { id: 'l2', title: 'Loja oficial', subtitle: 'Frete gratis', url: '#', is_active: true },
  { id: 'l3', title: 'Newsletter semanal', subtitle: 'Assine gratis', url: '#', is_active: true },
];

export const DEMO_SOCIALS = [
  { id: 's1', platform: 'instagram', url: '#' },
  { id: 's2', platform: 'youtube', url: '#' },
  { id: 's3', platform: 'tiktok', url: '#' },
];

export const DEMO_VIDEOS = [
  {
    id: 'v1',
    platform: 'youtube',
    title: 'Como criar uma bio que converte',
    embed_url: '',
    thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const DEMO_BANNERS: any[] = [];