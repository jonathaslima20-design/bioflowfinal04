'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Shield, ShieldOff, Zap, ZapOff, Ban, CircleCheck as CheckCircle2, ExternalLink, ChevronLeft, ChevronRight, RefreshCw, Filter, X, Eye } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  is_pro: boolean;
  role: string;
  suspended_at: string | null;
  created_at: string;
  theme: string;
}

interface UserDetail extends Profile {
  links_count: number;
  socials_count: number;
  videos_count: number;
  banners_count: number;
}

const PAGE_SIZE = 25;

type FilterRole = 'all' | 'admin' | 'user';
type FilterPlan = 'all' | 'pro' | 'free';
type FilterStatus = 'all' | 'active' | 'suspended';

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterPlan, setFilterPlan] = useState<FilterPlan>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; profile: Profile } | null>(null);
  const [adminId, setAdminId] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAdminId(data.user.id);
    });
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url, is_pro, role, suspended_at, created_at, theme', { count: 'exact' });

    if (search) q = q.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    if (filterRole !== 'all') q = q.eq('role', filterRole);
    if (filterPlan === 'pro') q = q.eq('is_pro', true);
    if (filterPlan === 'free') q = q.eq('is_pro', false);
    if (filterStatus === 'active') q = q.is('suspended_at', null);
    if (filterStatus === 'suspended') q = q.not('suspended_at', 'is', null);

    const { data, count } = await q
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    setProfiles(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [search, filterRole, filterPlan, filterStatus, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  async function logAction(action: string, targetId: string, details: object = {}) {
    await supabase.from('admin_audit_log').insert({
      admin_id: adminId,
      action,
      target_type: 'profile',
      target_id: targetId,
      details,
    });
  }

  async function togglePro(profile: Profile) {
    setActionLoading(profile.id + '_pro');
    const newVal = !profile.is_pro;
    await supabase.from('profiles').update({ is_pro: newVal }).eq('id', profile.id);
    await logAction(newVal ? 'grant_pro' : 'revoke_pro', profile.id);
    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_pro: newVal } : p));
    setActionLoading(null);
    setConfirmAction(null);
  }

  async function toggleRole(profile: Profile) {
    setActionLoading(profile.id + '_role');
    const newRole = profile.role === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id);
    await logAction(newRole === 'admin' ? 'promote_admin' : 'demote_admin', profile.id);
    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role: newRole } : p));
    setActionLoading(null);
    setConfirmAction(null);
  }

  async function toggleSuspend(profile: Profile) {
    setActionLoading(profile.id + '_suspend');
    const newVal = profile.suspended_at ? null : new Date().toISOString();
    await supabase.from('profiles').update({ suspended_at: newVal }).eq('id', profile.id);
    await logAction(newVal ? 'suspend_user' : 'unsuspend_user', profile.id);
    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, suspended_at: newVal } : p));
    setActionLoading(null);
    setConfirmAction(null);
  }

  async function openDetail(profile: Profile) {
    setDetailLoading(true);
    setDetail({ ...profile, links_count: 0, socials_count: 0, videos_count: 0, banners_count: 0 });
    const { data } = await supabase.rpc('user_detail_counts', { p_profile_id: profile.id });
    const row = Array.isArray(data) ? data[0] : data;
    setDetail({
      ...profile,
      links_count: Number(row?.links_count ?? 0),
      socials_count: Number(row?.socials_count ?? 0),
      videos_count: Number(row?.videos_count ?? 0),
      banners_count: Number(row?.banners_count ?? 0),
    });
    setDetailLoading(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl mb-1">Gestão de Usuários</h1>
        <p className="text-gray-500 text-sm">{total.toLocaleString('pt-BR')} usuários cadastrados</p>
      </div>

      {/* Search + Filters */}
      <div className="brutal-card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou @username..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="brutal-input pl-9 py-2 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value as FilterRole); setPage(0); }}
            className="brutal-input py-1.5 text-sm"
          >
            <option value="all">Todos os papéis</option>
            <option value="admin">Admin</option>
            <option value="user">Usuário</option>
          </select>
          <select
            value={filterPlan}
            onChange={e => { setFilterPlan(e.target.value as FilterPlan); setPage(0); }}
            className="brutal-input py-1.5 text-sm"
          >
            <option value="all">Todos os planos</option>
            <option value="pro">Pro</option>
            <option value="free">Free</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value as FilterStatus); setPage(0); }}
            className="brutal-input py-1.5 text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="suspended">Suspensos</option>
          </select>
          <button onClick={fetchProfiles} className="brutal-btn px-3 py-1.5 bg-white text-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="brutal-card overflow-hidden mb-4">
        {loading ? (
          <div className="p-12 text-center font-bold text-gray-400 animate-pulse">Carregando...</div>
        ) : profiles.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Nenhum usuário encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50">
                  <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider">Usuário</th>
                  <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider hidden md:table-cell">Tema</th>
                  <th className="text-center px-4 py-3 font-display text-xs uppercase tracking-wider">Plano</th>
                  <th className="text-center px-4 py-3 font-display text-xs uppercase tracking-wider">Papel</th>
                  <th className="text-center px-4 py-3 font-display text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider hidden lg:table-cell">Cadastro</th>
                  <th className="text-right px-4 py-3 font-display text-xs uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-400 text-xs">
                            {(p.display_name || p.username)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold leading-tight">{p.display_name || p.username}</div>
                          <div className="text-xs text-gray-400">@{p.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500 capitalize">{p.theme || 'brutalist'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.is_pro ? (
                        <span className="bg-bioyellow text-black text-[10px] font-bold px-2 py-0.5 brutal-border inline-block">PRO</span>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">FREE</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.role === 'admin' ? (
                        <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 inline-block">ADMIN</span>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">USER</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.suspended_at ? (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 border border-red-300 inline-block">SUSPENSO</span>
                      ) : (
                        <span className="text-xs text-green-600 font-bold">ATIVO</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Ver detalhes"
                          onClick={() => openDetail(p)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <a
                          href={`/${p.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver perfil público"
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </a>
                        <button
                          title={p.is_pro ? 'Remover Pro' : 'Conceder Pro'}
                          onClick={() => setConfirmAction({ type: 'pro', profile: p })}
                          disabled={actionLoading === p.id + '_pro'}
                          className="p-1.5 hover:bg-yellow-50 rounded transition-colors"
                        >
                          {p.is_pro ? <ZapOff className="w-4 h-4 text-yellow-500" /> : <Zap className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button
                          title={p.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                          onClick={() => setConfirmAction({ type: 'role', profile: p })}
                          disabled={actionLoading === p.id + '_role'}
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                        >
                          {p.role === 'admin' ? <ShieldOff className="w-4 h-4 text-blue-500" /> : <Shield className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button
                          title={p.suspended_at ? 'Reativar conta' : 'Suspender conta'}
                          onClick={() => setConfirmAction({ type: 'suspend', profile: p })}
                          disabled={actionLoading === p.id + '_suspend'}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        >
                          {p.suspended_at ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Ban className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Página {page + 1} de {totalPages} ({total} usuários)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="brutal-btn px-3 py-1.5 bg-white text-sm disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="brutal-btn px-3 py-1.5 bg-white text-sm disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card bg-white p-6 max-w-sm w-full">
            <h3 className="font-display text-xl mb-2">Confirmar ação</h3>
            <p className="text-sm text-gray-600 mb-1">
              {confirmAction.type === 'pro' && (
                confirmAction.profile.is_pro
                  ? `Remover status Pro de @${confirmAction.profile.username}?`
                  : `Conceder status Pro para @${confirmAction.profile.username}?`
              )}
              {confirmAction.type === 'role' && (
                confirmAction.profile.role === 'admin'
                  ? `Remover papel de Admin de @${confirmAction.profile.username}?`
                  : `Promover @${confirmAction.profile.username} para Admin?`
              )}
              {confirmAction.type === 'suspend' && (
                confirmAction.profile.suspended_at
                  ? `Reativar a conta de @${confirmAction.profile.username}?`
                  : `Suspender a conta de @${confirmAction.profile.username}?`
              )}
            </p>
            <p className="text-xs text-gray-400 mb-5">Esta ação será registrada no log de auditoria.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmAction.type === 'pro') togglePro(confirmAction.profile);
                  if (confirmAction.type === 'role') toggleRole(confirmAction.profile);
                  if (confirmAction.type === 'suspend') toggleSuspend(confirmAction.profile);
                }}
                className="brutal-btn bg-black text-white px-4 py-2 text-sm flex-1"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="brutal-btn bg-white px-4 py-2 text-sm flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card bg-white p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {detail.avatar_url ? (
                  <img src={detail.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover brutal-border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 brutal-border flex items-center justify-center font-display text-xl">
                    {(detail.display_name || detail.username)[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-display text-lg leading-tight">{detail.display_name || detail.username}</div>
                  <div className="text-sm text-gray-400">@{detail.username}</div>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detail.bio && (
              <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 border border-gray-100">{detail.bio}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Links', value: detailLoading ? '…' : detail.links_count },
                { label: 'Redes sociais', value: detailLoading ? '…' : detail.socials_count },
                { label: 'Vídeos', value: detailLoading ? '…' : detail.videos_count },
                { label: 'Banners', value: detailLoading ? '…' : detail.banners_count },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 brutal-border text-center">
                  <div className="font-display text-2xl">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-400 space-y-1 mb-4">
              <div>Tema: <span className="font-bold text-black capitalize">{detail.theme || 'brutalist'}</span></div>
              <div>Cadastro: <span className="font-bold text-black">{new Date(detail.created_at).toLocaleDateString('pt-BR')}</span></div>
              <div>Status: <span className="font-bold text-black">{detail.suspended_at ? 'Suspenso' : 'Ativo'}</span></div>
            </div>

            <a
              href={`/${detail.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn bg-bioyellow px-4 py-2 text-sm w-full justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Ver perfil público
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
