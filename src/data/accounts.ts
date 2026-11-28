import { AuthUser } from '../types';

export interface AccountCredential extends AuthUser {
  password: string;
}

/**
 * Team Accounts:
 * - 1 Super Admin (Manajer / Pemilik Usaha): Fernando
 * - 10 Admin accounts: Julie Choo, Atika Rahmah, Cosmas Nafrisius, Evelina Magdalene,
 *   Jelice Denny Cia, Kezia Wilianti, Melissa Octaviani, Olyvia Chrystina, Sutina, Alvin
 */
export const DEMO_ACCOUNTS: AccountCredential[] = [
  {
    id: 'usr-super-fernando',
    username: 'fernando',
    password: 'manajer123',
    name: 'Fernando',
    role: 'super_admin',
    title: 'Super Admin / Pemilik Usaha',
  },
  {
    id: 'usr-admin-julie',
    username: 'julie',
    password: 'admin123',
    name: 'Julie Choo',
    role: 'admin',
    title: 'Admin Credit Limit & AR',
  },
  {
    id: 'usr-admin-atika',
    username: 'atika',
    password: 'admin123',
    name: 'Atika Rahmah',
    role: 'admin',
    title: 'Admin Simulasi & Kredit',
  },
  {
    id: 'usr-admin-cosmas',
    username: 'cosmas',
    password: 'admin123',
    name: 'Cosmas Nafrisius',
    role: 'admin',
    title: 'Admin Piutang (AR)',
  },
  {
    id: 'usr-admin-evelina',
    username: 'evelina',
    password: 'admin123',
    name: 'Evelina Magdalene',
    role: 'admin',
    title: 'Admin Tagihan & Invoice',
  },
  {
    id: 'usr-admin-jelice',
    username: 'jelice',
    password: 'admin123',
    name: 'Jelice Denny Cia',
    role: 'admin',
    title: 'Admin Keuangan & AR',
  },
  {
    id: 'usr-admin-kezia',
    username: 'kezia',
    password: 'admin123',
    name: 'Kezia Wilianti',
    role: 'admin',
    title: 'Admin Verifikasi Pembayaran',
  },
  {
    id: 'usr-admin-melissa',
    username: 'melissa',
    password: 'admin123',
    name: 'Melissa Octaviani',
    role: 'admin',
    title: 'Admin Laporan & Export',
  },
  {
    id: 'usr-admin-olyvia',
    username: 'olyvia',
    password: 'admin123',
    name: 'Olyvia Chrystina',
    role: 'admin',
    title: 'Admin Audit & Kepatuhan',
  },
  {
    id: 'usr-admin-sutina',
    username: 'sutina',
    password: 'admin123',
    name: 'Sutina',
    role: 'admin',
    title: 'Admin Layanan Pelanggan',
  },
  {
    id: 'usr-admin-alvin',
    username: 'alvin',
    password: 'admin123',
    name: 'Alvin',
    role: 'admin',
    title: 'Admin Penagihan',
  },
];

export function authenticateUser(
  username: string,
  password: string,
  accounts: AccountCredential[] = DEMO_ACCOUNTS
): AuthUser | null {
  const normalized = username.trim().toLowerCase();
  const match = accounts.find(
    (acc) => acc.username.toLowerCase() === normalized && acc.password === password
  );
  if (!match) return null;
  return {
    id: match.id,
    username: match.username,
    name: match.name,
    role: match.role,
    title: match.title,
  };
}
