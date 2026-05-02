'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GripVertical, Plus, Trash2, Video as VideoIcon } from 'lucide-react';
import { parseVideoUrl } from '@/lib/embed';

type Video = {
  id: string;
  title: string;
  url: string;
  platform: string;
  provider_id: string;
  embed_url: string;
  thumbnail: string;
  aspect: string;
  position: number;
  is_active: boolean;
};

export default function VideosPage() {
  const [profileId, setProfileId] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setProfileId(u.user.id);
      const { data } = await supabase.from('videos').select('*').eq('profile_id', u.user.id).order('position');
      setVideos((data as Video[]) ?? []);
    })();
  }, []);

  async function addVideo() {
    const { data } = await supabase.from('videos').insert({
      profile_id: profileId, title: 'Novo vídeo', url: '', position: videos.length,
    }).select().single();
    if (data) setVideos([...videos, data as Video]);
  }

  async function update(id: string, patch: Partial<Video>) {
    setVideos(videos.map(v => v.id === id ? { ...v, ...patch } : v));
    await supabase.from('videos').update(patch).eq('id', id);
  }

  async function onUrlChange(id: string, url: string) {
    const parsed = parseVideoUrl(url);
    const patch: Partial<Video> = parsed
      ? { url, platform: parsed.platform, provider_id: parsed.provider_id, embed_url: parsed.embed_url, thumbnail: parsed.thumbnail }
      : { url };
    await update(id, patch);
  }

  async function remove(id: string) {
    setVideos(videos.filter(v => v.id !== id));
    await supabase.from('videos').delete().eq('id', id);
  }

  async function onDrop(targetId: string) {
    if (!dragging || dragging === targetId) return;
    const ids = videos.map(v => v.id);
    const from = ids.indexOf(dragging);
    const to = ids.indexOf(targetId);
    const reordered = [...videos];
    const [m] = reordered.splice(from, 1);
    reordered.splice(to, 0, m);
    const updated = reordered.map((v, i) => ({ ...v, position: i }));
    setVideos(updated);
    setDragging(null);
    await Promise.all(updated.map(v => supabase.from('videos').update({ position: v.position }).eq('id', v.id)));
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl">Vídeos</h1>
          <p className="text-sm font-bold text-black/60 mt-1">Cole URLs do YouTube, Vimeo, TikTok ou Instagram.</p>
        </div>
        <button onClick={addVideo} className="brutal-btn bg-bioyellow px-4 py-2 gap-2">
          <Plus className="w-4 h-4" /> Novo vídeo
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {videos.length === 0 && (
          <div className="brutal-card p-8 text-center">
            <VideoIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold">Nenhum vídeo ainda.</p>
          </div>
        )}
        {videos.map(v => (
          <div
            key={v.id}
            draggable
            onDragStart={() => setDragging(v.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(v.id)}
            className="brutal-card p-4"
          >
            <div className="flex items-start gap-3">
              <GripVertical className="w-5 h-5 mt-3 cursor-grab text-black/60" />
              <div className="flex-1 flex flex-col gap-2">
                <input
                  value={v.title}
                  onChange={e => update(v.id, { title: e.target.value })}
                  className="brutal-input px-3 py-2 font-bold"
                  placeholder="Título"
                />
                <input
                  value={v.url}
                  onChange={e => onUrlChange(v.id, e.target.value)}
                  className="brutal-input px-3 py-2 text-sm"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-bold uppercase bg-black text-white px-2 py-1 brutal-border">
                    {(v.platform || 'generic').toUpperCase()}
                  </span>
                  <label className="flex items-center gap-2 text-xs font-bold">
                    <input type="checkbox" checked={v.is_active} onChange={e => update(v.id, { is_active: e.target.checked })} />
                    Ativo
                  </label>
                </div>
                {v.embed_url && (
                  <div className="brutal-border mt-2 aspect-video bg-black">
                    <iframe
                      src={v.embed_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
              <button onClick={() => remove(v.id)} className="brutal-btn bg-white w-9 h-9">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
