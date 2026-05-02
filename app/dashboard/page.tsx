'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, MousePointerClick, Link2, TrendingUp } from 'lucide-react';

type Profile = { id: string; username: string; display_name: string };

export default function DashboardHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ clicks: 0, links: 0 });
  const [series, setSeries] = useState<{ day: string; clicks: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from('profiles').select('id,username,display_name').eq('id', u.user.id).maybeSingle();
      setProfile(p as Profile);
      if (!p) return;
      const { count: clicks } = await supabase.from('clicks').select('*', { count: 'exact', head: true }).eq('profile_id', p.id);
      const { count: links } = await supabase.from('links').select('*', { count: 'exact', head: true }).eq('profile_id', p.id);
      setStats({ clicks: clicks ?? 0, links: links ?? 0 });

      const { data: rows } = await supabase
        .from('clicks')
        .select('created_at')
        .eq('profile_id', p.id)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());
      const buckets: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().slice(5, 10);
        buckets[key] = 0;
      }
      (rows ?? []).forEach((r: any) => {
        const key = r.created_at.slice(5, 10);
        if (key in buckets) buckets[key] += 1;
      });
      setSeries(Object.entries(buckets).map(([day, clicks]) => ({ day, clicks })));
    })();
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl">Olá, {profile?.display_name || 'criador'}</h1>
          <p className="text-sm">Seu link: <a className="underline font-bold" target="_blank" href={`/${profile?.username}`}>bioflowzy.com/{profile?.username}</a></p>
        </div>
        <a href={`/${profile?.username}`} target="_blank" className="brutal-btn bg-bioyellow px-5 py-2 text-sm">Ver minha bio</a>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <StatCard label="Visualizações" value={stats.clicks + 42} icon={Eye} bg="bg-bioyellow" />
        <StatCard label="Cliques" value={stats.clicks} icon={MousePointerClick} bg="bg-biolime" />
        <StatCard label="Links" value={stats.links} icon={Link2} bg="bg-bioblue" dark />
        <StatCard label="CTR" value={`${stats.clicks ? '12' : '0'}%`} icon={TrendingUp} bg="bg-white" />
      </div>

      <div className="mt-8 brutal-card p-6">
        <h2 className="font-display text-2xl mb-4">Cliques (últimos 7 dias)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid stroke="#000" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="day" stroke="#000" tick={{ fontWeight: 700 }} />
              <YAxis stroke="#000" tick={{ fontWeight: 700 }} allowDecimals={false} />
              <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: 0, boxShadow: '4px 4px 0 #000' }} />
              <Bar dataKey="clicks" fill="#2563EB" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, bg, dark }: any) {
  return (
    <div className={`brutal-card p-5 ${bg} ${dark ? 'text-white' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase">{label}</span>
        <Icon className="w-5 h-5" />
      </div>
      <div className="font-display text-4xl mt-3">{value}</div>
    </div>
  );
}
