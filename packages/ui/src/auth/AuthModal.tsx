'use client';

import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

export interface AuthModalUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  authProvider?: string;
  avatarUrl?: string;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthModalUser | null;
  testModeEnabled?: boolean;
  googleClientId?: string;
  onGoogleLogin: (credential: string) => Promise<void> | void;
  onMockLogin?: (roleKey: 'demo-student' | 'teacher-olena' | 'admin-cms') => Promise<void> | void;
  onLogout?: () => void;
  onJoinCode?: (code: string) => void;
  apiUrl?: string;
}

/**
 * 🔐 AuthModal
 * Канонічне модальне вікно автентифікації для застосунків екосистеми Smart-BKT-Chain.
 * Підтримує Google OAuth 2.0, системний тестовий режим (Test Mode Bypass) та інвайт-коди класів.
 */
export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  testModeEnabled = true,
  googleClientId,
  onGoogleLogin,
  onMockLogin,
  onLogout,
  onJoinCode,
}: AuthModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credential: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await onGoogleLogin(credential);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Помилка авторизації Google');
    } finally {
      setLoading(false);
    }
  };

  const handleMockClick = async (roleKey: 'demo-student' | 'teacher-olena' | 'admin-cms') => {
    if (!onMockLogin) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      await onMockLogin(roleKey);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Помилка тестового входу');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) return;
    if (onJoinCode) {
      onJoinCode(cleanCode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемнений бекдроп */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fadeIn" 
        onClick={onClose}
      />

      {/* Модальне вікно */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Шапка модального вікна */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {currentUser ? 'Профіль Користувача' : 'Вхід до Smart-BKT-Chain'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentUser ? 'Керування поточною сесією' : 'Адаптивна платформа та BKT-аналітика'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Тіло модального вікна */}
        <div className="p-5 flex flex-col gap-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Режим 1: Користувач уже авторизований */}
          {currentUser ? (
            <div className="flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate">
                      {currentUser.name || currentUser.email}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono truncate">{currentUser.email}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Провайдер: <span className="text-slate-300 font-medium">{currentUser.authProvider || 'LOCAL'}</span>
                  </p>
                </div>
              </div>

              {/* Інвайт-код блок */}
              {onJoinCode && (
                <form onSubmit={handleJoinSubmit} className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Приєднатися до навчальної групи</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Введіть код (напр. KOD-KN21)"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!inviteCode.trim()}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <span>ОК</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl border border-rose-800/50 hover:bg-rose-950/30 text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Вийти з акаунта</span>
                </button>
              )}
            </div>
          ) : (
            /* Режим 2: Вхід у систему */
            <div className="flex flex-col gap-4">
              
              {/* Google Sign-In */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-slate-400">Швидка реєстрація та збереження знань:</span>
                <GoogleSignInButton
                  onSuccess={handleGoogleSuccess}
                  googleClientId={googleClientId}
                  disabled={loading}
                />
              </div>

              {/* Тестовий режим Bypass (якщо увімкнено адміністратором) */}
              {testModeEnabled && onMockLogin && (
                <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Тестовий Режим (1-Клік Вхід)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">SYSTEM_TEST_MODE</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMockClick('demo-student')}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 text-left text-xs text-slate-200 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-medium">Студент: Дмитро Стеценко</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">STUDENT →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMockClick('teacher-olena')}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 text-left text-xs text-slate-200 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-medium">Викладач: Олена Коваленко</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">TEACHER →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMockClick('admin-cms')}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 text-left text-xs text-slate-200 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-medium">Адміністратор: CMS Admin</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">ADMIN →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Інвайт-код для незалогінених */}
              {onJoinCode && (
                <form onSubmit={handleJoinSubmit} className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Маєте інвайт-код групи?</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="KOD-XXXX"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!inviteCode.trim()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span>Знайти</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Футер */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Smart-BKT-Chain Auth v2.0</span>
          <span>Zero-Friction Onboarding</span>
        </div>

      </div>
    </div>
  );
}
