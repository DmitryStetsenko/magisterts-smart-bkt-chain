/**
 * Реєстр додатків екосистеми Smart-BKT-Chain та їх портів для локальної розробки
 */
export const APP_PORTS = {
  api: 3000,
  web: 3001,
  student: 3002,
  teacher: 3003,
  admin: 3004,
  docs: 3005,
  study: 3006,
} as const;

export type AppName = keyof typeof APP_PORTS;

/**
 * Отримання базового URL для цільового застосунку в залежності від середовища (Browser / Server)
 */
export function getAppBaseUrl(app: AppName): string {
  // Якщо визначено явний ENV-параметр для публічного домену
  if (typeof process !== 'undefined' && process.env) {
    const envKey = `NEXT_PUBLIC_${app.toUpperCase()}_URL`;
    if (process.env[envKey]) {
      return process.env[envKey] as string;
    }
  }

  // Для локального середовища використовуємо localhost з відповідним портом
  const port = APP_PORTS[app];
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${hostname}:${port}`;
  }

  return `http://localhost:${port}`;
}
