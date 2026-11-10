'use client';

import React, { useState } from 'react';

export interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (err: any) => void;
  googleClientId?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * 🌐 GoogleSignInButton
 * Кнопка швидкої авторизації через Google OAuth 2.0 / Google Identity Services
 * із делікатним fallback-режимом для dev/demo середовища.
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  googleClientId,
  label = 'Продовжити через Google',
  className = '',
  disabled = false,
}: GoogleSignInButtonProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleClick = () => {
    if (disabled) return;

    // Якщо є дійсний Google Client ID у продакшені, тут ініціюється Google Identity Services
    if (googleClientId && typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
        return;
      } catch (err) {
        console.warn('Google One-Tap prompt error, falling back to simulated auth:', err);
      }
    }

    // У dev/demo середовищі відкриваємо швидкий вибір або генеруємо тестовий Google токен
    setShowPrompt(true);
  };

  const handleSimulatedGoogleLogin = (username: string) => {
    setShowPrompt(false);
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'student';
    const mockToken = `mock-google-token-${clean}`;
    onSuccess(mockToken);
  };

  return (
    <div className="relative inline-block w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-slate-900 hover:bg-slate-800/90 text-white text-xs sm:text-sm font-medium rounded-xl border border-slate-700/80 hover:border-slate-600 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {/* Офіційний логотип Google G */}
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{label}</span>
      </button>

      {/* Швидкий симулятор Google Identity для офлайн та локального тестування */}
      {showPrompt && (
        <div className="absolute left-0 top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400 font-medium">
            <span>Вхід через Google (Dev Mode)</span>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-slate-500 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="py-2.5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleSimulatedGoogleLogin('dmitro')}
              className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Дмитро Шевченко</span>
              <span className="text-[10px] text-slate-500 font-mono">dmitro@gmail.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulatedGoogleLogin('olena')}
              className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Олена Коваленко</span>
              <span className="text-[10px] text-slate-500 font-mono">olena@gmail.com</span>
            </button>

            <div className="pt-1.5 border-t border-slate-800/80 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Введіть інше ім'я..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customName.trim()) {
                    handleSimulatedGoogleLogin(customName);
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleSimulatedGoogleLogin(customName || 'student')}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Вхід
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
