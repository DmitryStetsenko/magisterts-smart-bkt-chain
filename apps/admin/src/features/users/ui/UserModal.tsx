'use client';

import React, { useState } from 'react';
import { UserPlus, Check, AlertCircle } from 'lucide-react';
import { AuthUserDto, CreateUserDto, UpdateUserDto, UserRole, UserStatus } from '@sbc/types';
import { Modal, Button } from '@sbc/ui';

interface UserModalProps {
  user?: AuthUserDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(user);
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.profile?.firstName || '');
  const [lastName, setLastName] = useState(user?.profile?.lastName || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'STUDENT');
  const [status, setStatus] = useState<UserStatus>(user?.status || 'ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email є обов\'язковим полем');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      if (isEditing) {
        await onSave({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          role,
          status,
        });
      } else {
        await onSave({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          role,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Помилка збереження користувача');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      icon={
        <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <UserPlus className="w-4 h-4" />
        </div>
      }
      title={isEditing ? 'Редагування користувача' : 'Додати користувача'}
      subtitle={isEditing ? user?.email : 'Створення нового профілю в системі'}
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Скасувати
          </Button>
          <Button
            type="submit"
            form="admin-user-modal-form"
            variant="accent"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Збереження...' : isEditing ? 'Зберегти зміни' : 'Створити'}
          </Button>
        </div>
      }
    >
      <form id="admin-user-modal-form" onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Ім'я
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Дмитро"
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Прізвище
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Стеценко"
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Роль
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 text-xs cursor-pointer"
              >
                <option value="STUDENT">Студент (STUDENT)</option>
                <option value="TEACHER">Викладач (TEACHER)</option>
                <option value="ADMIN">Адміністратор (ADMIN)</option>
                <option value="RECRUITER">Рекрутер (RECRUITER)</option>
              </select>
            </div>

            {isEditing && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Статус
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 text-xs cursor-pointer"
                >
                  <option value="ACTIVE">Активний</option>
                  <option value="SUSPENDED">Заблокований</option>
                </select>
              </div>
            )}
          </div>
        </form>
    </Modal>
  );
};
