import { Instagram, Youtube, Twitter, Github, Music2, Globe, Facebook, Linkedin, AtSign, Twitch, MessageCircle, Send, Mail, Music, Video, Pin as Pin } from 'lucide-react';
import type { ComponentType } from 'react';

export type SocialKey =
  | 'instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook' | 'linkedin'
  | 'github' | 'threads' | 'pinterest' | 'spotify' | 'soundcloud'
  | 'twitch' | 'discord' | 'whatsapp' | 'telegram' | 'email' | 'website';

export type SocialMeta = {
  key: SocialKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  placeholder: string;
  prefix?: string;
};

export const SOCIALS: SocialMeta[] = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C', placeholder: '@seuuser ou URL', prefix: 'https://instagram.com/' },
  { key: 'tiktok', label: 'TikTok', icon: Music2, color: '#000000', placeholder: '@seuuser ou URL', prefix: 'https://tiktok.com/@' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000', placeholder: 'URL do canal' },
  { key: 'x', label: 'X (Twitter)', icon: Twitter, color: '#000000', placeholder: '@seuuser ou URL', prefix: 'https://x.com/' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2', placeholder: 'URL do perfil' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2', placeholder: 'URL do perfil' },
  { key: 'github', label: 'GitHub', icon: Github, color: '#000000', placeholder: '@user ou URL', prefix: 'https://github.com/' },
  { key: 'threads', label: 'Threads', icon: AtSign, color: '#000000', placeholder: '@seuuser', prefix: 'https://threads.net/@' },
  { key: 'pinterest', label: 'Pinterest', icon: Pin, color: '#BD081C', placeholder: 'URL do perfil' },
  { key: 'spotify', label: 'Spotify', icon: Music, color: '#1DB954', placeholder: 'URL do artista/perfil' },
  { key: 'soundcloud', label: 'SoundCloud', icon: Music, color: '#FF5500', placeholder: 'URL do perfil' },
  { key: 'twitch', label: 'Twitch', icon: Twitch, color: '#9146FF', placeholder: '@canal', prefix: 'https://twitch.tv/' },
  { key: 'discord', label: 'Discord', icon: MessageCircle, color: '#5865F2', placeholder: 'URL do convite' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366', placeholder: '+55 11 99999-9999 ou link' },
  { key: 'telegram', label: 'Telegram', icon: Send, color: '#26A5E4', placeholder: '@user ou link', prefix: 'https://t.me/' },
  { key: 'email', label: 'Email', icon: Mail, color: '#000000', placeholder: 'voce@exemplo.com' },
  { key: 'website', label: 'Website', icon: Globe, color: '#000000', placeholder: 'https://seusite.com' },
];

export const SOCIALS_BY_KEY: Record<string, SocialMeta> = SOCIALS.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {} as Record<string, SocialMeta>);

export function normalizeSocial(key: SocialKey, raw: string): string {
  const v = (raw || '').trim();
  if (!v) return '';
  if (key === 'email') return v.includes('@') ? `mailto:${v.replace(/^mailto:/, '')}` : '';
  if (key === 'whatsapp') {
    if (/^https?:\/\//i.test(v)) return v;
    const digits = v.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }
  if (/^https?:\/\//i.test(v)) return v;
  const meta = SOCIALS_BY_KEY[key];
  const handle = v.replace(/^@/, '');
  if (meta?.prefix) return `${meta.prefix}${handle}`;
  return `https://${v}`;
}
