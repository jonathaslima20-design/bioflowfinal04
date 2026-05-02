'use client';

import { getTheme } from '@/themes/registry';

export function BioClient({ profile, links, socials, videos, banners }: any) {
  const Theme = getTheme(profile?.theme).component;

  async function track(entity_type: string, entity_id: string | null) {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profile.id, entity_type, entity_id }),
      });
    } catch {}
  }

  return (
    <Theme
      profile={profile}
      links={links}
      socials={socials}
      videos={videos}
      banners={banners}
      track={track}
    />
  );
}
