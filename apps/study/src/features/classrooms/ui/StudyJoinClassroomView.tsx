'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  BookOpen, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { GoogleSignInButton, AuthModalUser } from '@sbc/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface StudyJoinClassroomViewProps {
  initialCode?: string;
}

export function StudyJoinClassroomView({ initialCode = '' }: StudyJoinClassroomViewProps) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [classroom, setClassroom] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthModalUser | null>(null);
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('sbc_auth_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/config`);
        if (res.ok) {
          const data = await res.json();
          setTestModeEnabled(!!data.testModeEnabled);
          setGoogleClientId(data.googleClientId);
        }
      } catch (err) {
        console.warn('Failed to load auth config:', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (initialCode) {
      loadClassroom(initialCode);
    }
  }, [initialCode]);

  const loadClassroom = async (targetCode: string) => {
    const clean = targetCode.trim().toUpperCase();
    if (!clean) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`${API_URL}/api/v1/classrooms/join/${clean}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Навчальну групу з таким кодом не знайдено');
        setClassroom(null);
        return;
      }
      setClassroom(data.classroom);
      setCode(clean);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Помилка підключення до сервера');
      setClassroom(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = async (userIdToUse?: string) => {
    const activeUserId = userIdToUse || currentUser?.id;
    if (!activeUserId) {
      setErrorMsg('Будь ласка, увійдіть у систему перед приєднанням до групи');
      return;
    }
    if (!classroom?.code) return;

    try {
      setJoining(true);
      setErrorMsg(null);
      const res = await fetch(`${API_URL}/api/v1/classrooms/join/${classroom.code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Не вдалося приєднатися до групи');
        return;
      }

      setJoinedSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Помилка виконання запиту');
    } finally {
      setJoining(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`${API_URL}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.message || 'Помилка авторизації Google');
      }

      const user: AuthModalUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.profile?.firstName 
          ? `${data.user.profile.firstName} ${data.user.profile.lastName || ''}`.trim()
          : data.user.email,
        role: data.user.role,
        authProvider: data.user.authProvider,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('sbc_auth_token', data.token);
        localStorage.setItem('sbc_auth_user', JSON.stringify(user));
      }
      setCurrentUser(user);

      if (classroom) {
        await handleJoinClassroom(user.id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Помилка Google OAuth');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async (roleKey: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`${API_URL}/api/v1/auth/mock-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdOrEmail: roleKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.message || 'Помилка тестового входу');
      }

      const user: AuthModalUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.profile?.firstName 
          ? `${data.user.profile.firstName} ${data.user.profile.lastName || ''}`.trim()
          : data.user.email,
        role: data.user.role,
        authProvider: data.user.authProvider,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('sbc_auth_token', data.token);
        localStorage.setItem('sbc_auth_user', JSON.stringify(user));
      }
      setCurrentUser(user);

      if (classroom) {
        await handleJoinClassroom(user.id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Помилка авторизації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col">
        
        {/* Шапка */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Підручник & Теорія</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 uppercase">
                  Classroom
                </span>
              </h1>
              <p className="text-xs text-slate-400">Приєднання до навчальної групи</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="На головну"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Тіло */}
        <div className="p-6 flex flex-col gap-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!classroom && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadClassroom(code);
              }}
              className="flex flex-col gap-3"
            >
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>Введіть інвайт-код навчальної групи:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="KOD-KN21"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 uppercase tracking-wider"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 shadow-lg shadow-blue-600/20"
                >
                  {loading ? 'Пошук...' : 'Знайти'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {classroom && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                      Інвайт-код: {classroom.code}
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">{classroom.name}</h2>
                  </div>
                  <button
                    onClick={() => {
                      setClassroom(null);
                      setJoinedSuccess(false);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 underline cursor-pointer"
                  >
                    Змінити код
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-semibold text-white">Курс:</span>
                    <span>{classroom.course?.title || 'Навчальний курс'}</span>
                  </div>

                  {classroom.teacher && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Викладач:</span>
                      <span className="text-slate-300 font-medium">
                        {classroom.teacher.profile?.firstName
                          ? `${classroom.teacher.profile.firstName} ${classroom.teacher.profile.lastName || ''}`.trim()
                          : classroom.teacher.email}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-400">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Режим:</span>
                    <span className="text-amber-300 font-medium">
                      {classroom.defaultMode === 'TESTING_ONLY'
                        ? 'Діагностичне тестування'
                        : classroom.defaultMode === 'MODULAR'
                        ? 'Модульний доступ'
                        : 'Повний цикл BKT'}
                    </span>
                  </div>
                </div>
              </div>

              {joinedSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col gap-3 items-center text-center animate-fadeIn">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ви успішно зараховані до групи!</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Курс «{classroom.course?.title}» відкрито у вашому профілі.
                    </p>
                  </div>
                  <div className="w-full flex flex-col sm:flex-row gap-2 mt-1">
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Читати Підручник</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a
                      href={`http://localhost:3002/practice/${classroom.course?.slug || 'js-dev'}`}
                      className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Тренажер BKT</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : currentUser ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Акаунт:</span>
                    <span className="font-semibold text-white truncate max-w-[200px]">
                      {currentUser.name || currentUser.email}
                    </span>
                  </div>

                  <button
                    onClick={() => handleJoinClassroom()}
                    disabled={joining}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    {joining ? 'Зарахування...' : 'Підтвердити та приєднатися'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-300 font-medium">
                    Для зарахування увійдіть у свій акаунт:
                  </div>

                  <GoogleSignInButton
                    onSuccess={handleGoogleSuccess}
                    googleClientId={googleClientId}
                    disabled={loading || joining}
                    label="Увійти через Google та приєднатися"
                  />

                  {testModeEnabled && (
                    <div className="pt-2 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Тестовий вхід (Test Mode Bypass)</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleMockLogin('demo-student')}
                        disabled={loading || joining}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left text-xs text-slate-200 transition-colors cursor-pointer"
                      >
                        <span className="font-medium">Вхід як Дмитро Стеценко (Студент)</span>
                        <span className="text-[10px] font-mono text-blue-400">1-Клік →</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Smart-BKT-Chain v2.0</span>
          <span>Study Classroom</span>
        </div>

      </div>
    </div>
  );
}
