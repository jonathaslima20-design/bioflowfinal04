import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { BioClient } from './BioClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = 'force-dynamic';

export default async function PublicBio({ params }: { params: { username: string } }) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .maybeSingle();

  if (!profile) return notFound();

  const [{ data: links }, { data: socials }, { data: videos }, { data: banners }] = await Promise.all([
    supabase.from('links').select('*').eq('profile_id', profile.id).eq('is_active', true).order('position'),
    supabase.from('social_links').select('*').eq('profile_id', profile.id).eq('is_active', true).order('position'),
    supabase.from('videos').select('*').eq('profile_id', profile.id).eq('is_active', true).order('position'),
    supabase.from('banners').select('*').eq('profile_id', profile.id).eq('is_active', true).order('position'),
  ]);

  return (
    <BioClient
      profile={profile}
      links={links ?? []}
      socials={socials ?? []}
      videos={videos ?? []}
      banners={banners ?? []}
    />
  );
}
