import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Language, NewAdminInput } from '../types';

interface AddAdminModalProps {
  isOpen: boolean;
  existingUsernames: string[];
  lang: Language;
  onClose: () => void;
  onCreateAdmin: (input: NewAdminInput) => void;
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({
  isOpen,
  existingUsernames,
  lang,
  onClose,
  onCreateAdmin,
}) => {
  const isId = lang === 'id';
  const suggestedNum = existingUsernames.filter((u) => u.startsWith('admin')).length + 1;

  const [name, setName] = useState('');
  const [title, setTitle] = useState('Admin Piutang (AR)');
  const [username, setUsername] = useState(`admin${suggestedNum}`);
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!name.trim() || !cleanUser || !password.trim()) {
      setError(
        isId
          ? 'Mohon lengkapi nama, username, dan password.'
          : 'Please fill out name, username, and password.'
      );
      return;
    }
    if (existingUsernames.some((u) => u.toLowerCase() === cleanUser)) {
      setError(
        isId
          ? `Username "${cleanUser}" sudah digunakan. Silakan pilih username lain.`
          : `Username "${cleanUser}" is already taken.`
      );
      return;
    }

    onCreateAdmin({
      name: name.trim(),
      title: title.trim() || 'Admin Piutang (AR)',
      username: cleanUser,
      password: password.trim(),
    });
    setName('');
    setTitle('Admin Piutang (AR)');
    setUsername(`admin${suggestedNum + 1}`);
    setPassword('admin123');
    setError(null);
    onClose();
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {isId ? 'Tambah Akun Admin Baru' : 'Add New Admin Account'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isId
                ? 'Admin baru dapat langsung login dan dipantau dari sidebar Super Admin.'
                : 'The new admin can sign in immediately and be monitored from the Super Admin sidebar.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="text-xs font-bold text-slate-700">
              {isId ? 'Nama Lengkap Admin' : 'Admin Full Name'} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isId ? 'Contoh: Clara Wijaya' : 'e.g., Clara Wijaya'}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">
              {isId ? 'Jabatan / Wilayah' : 'Title / Region'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isId ? 'Contoh: Admin Penagihan Cabang Surabaya' : 'e.g., Collections Admin'}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Password *</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isId ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isId ? 'Simpan Admin Baru' : 'Create Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
