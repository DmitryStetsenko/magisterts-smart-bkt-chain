'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  GraduationCap,
  Sparkles,
  BookOpen,
  Edit2,
  Trash2,
  Ban,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import { AuthUserDto, CreateUserDto, UpdateUserDto, UserRole, UserStatus } from '@sbc/types';
import { UserModal } from './UserModal';
import { EnrollCourseModal } from './EnrollCourseModal';

interface UserManagementCenterProps {
  apiUrl: string;
}

export const UserManagementCenter: React.FC<UserManagementCenterProps> = ({ apiUrl }) => {
  const [users, setUsers] = useState<AuthUserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Auth config (Test Mode)
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [isTogglingTestMode, setIsTogglingTestMode] = useState<boolean>(false);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUserDto | null>(null);
  const [enrollingUser, setEnrollingUser] = useState<AuthUserDto | null>(null);
  const [userToDelete, setUserToDelete] = useState<AuthUserDto | null>(null);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${apiUrl}/api/v1/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Не вдалося завантажити користувачів');
      }

      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Помилка мережі');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, roleFilter, statusFilter, search]);

  // Fetch Auth Config
  const fetchAuthConfig = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/config`);
      const data = await res.json();
      if (res.ok) {
        setIsTestMode(Boolean(data.testModeEnabled));
      }
    } catch {}
  }, [apiUrl]);

  useEffect(() => {
    fetchUsers();
    fetchAuthConfig();
  }, [fetchUsers, fetchAuthConfig]);

  // Toggle Test Mode
  const handleToggleTestMode = async () => {
    try {
      setIsTogglingTestMode(true);
      const nextVal = !isTestMode;
      const res = await fetch(`${apiUrl}/api/v1/auth/test-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextVal }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsTestMode(Boolean(data.testModeEnabled));
      }
    } catch (err: any) {
      alert('Помилка оновлення конфігурації');
    } finally {
      setIsTogglingTestMode(false);
    }
  };

  // Create or Update user handler
  const handleSaveUser = async (data: CreateUserDto | UpdateUserDto) => {
    if (editingUser) {
      const res = await fetch(`${apiUrl}/api/v1/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Помилка оновлення');
    } else {
      const res = await fetch(`${apiUrl}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Помилка створення');
    }
    await fetchUsers();
  };

  // Toggle User Block Status
  const handleToggleUserStatus = async (user: AuthUserDto) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`${apiUrl}/api/v1/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch {}
  };

  // Delete User
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`${apiUrl}/api/v1/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUserToDelete(null);
        await fetchUsers();
      }
    } catch {
      alert('Помилка видалення користувача');
    }
  };

  // Role Badge Styling
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-3 h-3" />
            ADMIN
          </span>
        );
      case 'TEACHER':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <GraduationCap className="w-3 h-3" />
            ВИКЛАДАЧ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Users className="w-3 h-3" />
            СТУДЕНТ
          </span>
        );
    }
  };

  // Summary Metrics
  const studentsCount = users.filter((u) => u.role === 'STUDENT').length;
  const teachersCount = users.filter((u) => u.role === 'TEACHER').length;
  const adminsCount = users.filter((u) => u.role === 'ADMIN').length;
  const googleCount = users.filter((u) => u.authProvider === 'GOOGLE').length;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner & Test Mode Switcher */}
      <div className="pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Центр Керування Користувачами та Доступом (Users & RBAC)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Реєстрація через Google OAuth 2.0, управління ролями, індивідуальне зарахування на курси та тумблер тестового режиму
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Test Auth Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleTestMode}
            disabled={isTogglingTestMode}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all cursor-pointer text-xs select-none ${
              isTestMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Дозволяє тестовий вхід (студент, викладач, адмін) без Google OAuth"
          >
            {isTestMode ? (
              <ToggleRight className="w-4 h-4 text-amber-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-500" />
            )}
            <span className="font-medium text-[11px]">
              Тестовий режим: {isTestMode ? 'УВІМКНЕНО' : 'ВИМКНЕНО'}
            </span>
          </button>

          {/* Add User Button */}
          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setIsUserModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Додати користувача</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="px-3.5 py-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Всього акаунтів</span>
            <span className="text-base font-bold text-white font-mono">{total}</span>
          </div>
          <Users className="w-4 h-4 text-slate-500" />
        </div>

        <div className="px-3.5 py-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Студенти</span>
            <span className="text-base font-bold text-sky-400 font-mono">{studentsCount}</span>
          </div>
          <GraduationCap className="w-4 h-4 text-sky-500" />
        </div>

        <div className="px-3.5 py-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Викладачі</span>
            <span className="text-base font-bold text-purple-400 font-mono">{teachersCount}</span>
          </div>
          <Sparkles className="w-4 h-4 text-purple-500" />
        </div>

        <div className="px-3.5 py-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Google OAuth</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{googleCount}</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за email або ім'ям..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 select-none overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Роль:
          </span>
          {[
            { key: 'ALL', label: 'Всі' },
            { key: 'STUDENT', label: 'Студенти' },
            { key: 'TEACHER', label: 'Викладачі' },
            { key: 'ADMIN', label: 'Адміни' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setRoleFilter(item.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                roleFilter === item.key
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users List / Table */}
      <div className="flex flex-col divide-y divide-slate-800/50 border-t border-b border-slate-800/80">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Завантаження користувачів...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Користувачів за вказаними фільтрами не знайдено
          </div>
        ) : (
          users.map((user) => {
            const displayName =
              user.profile?.firstName || user.profile?.lastName
                ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
                : user.email.split('@')[0];

            const isBlocked = user.status === 'SUSPENDED';

            return (
              <div
                key={user.id}
                className={`py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors ${
                  isBlocked ? 'opacity-60' : ''
                }`}
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-slate-300">
                    {user.profile?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profile.avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{displayName}</span>
                      {getRoleBadge(user.role)}
                      {user.authProvider === 'GOOGLE' ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                          Google
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                          Local
                        </span>
                      )}
                      {isBlocked && (
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-800/40">
                          Заблокований
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">{user.email}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Enroll in Course */}
                  <button
                    type="button"
                    onClick={() => setEnrollingUser(user)}
                    className="px-2.5 py-1 rounded-lg border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-300 transition-colors cursor-pointer text-[11px] flex items-center gap-1.5"
                    title="Підключити курс учню"
                  >
                    <BookOpen className="w-3 h-3 text-indigo-400" />
                    <span>Підключити курс</span>
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(user);
                      setIsUserModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Редагувати профіль / роль"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Block / Unblock */}
                  <button
                    type="button"
                    onClick={() => handleToggleUserStatus(user)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isBlocked
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                    }`}
                    title={isBlocked ? 'Розблокувати акаунт' : 'Заблокувати акаунт'}
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setUserToDelete(user)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Видалити користувача"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Create / Edit Modal */}
      <UserModal
        user={editingUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />

      {/* Course Enrollment Modal */}
      {enrollingUser && (
        <EnrollCourseModal
          user={enrollingUser}
          apiUrl={apiUrl}
          isOpen={Boolean(enrollingUser)}
          onClose={() => setEnrollingUser(null)}
          onSuccess={() => {
            alert(`Курс успішно підключено учню ${enrollingUser.email}!`);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Видалити користувача?</h4>
                <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                  {userToDelete.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Ця дія незворотна. Усі дані проходження, історія BKT та спроби користувача будуть видалені.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer"
              >
                Підтвердити видалення
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
