import { useState } from 'react';

export default function Faq() {
  const faqs = [
  { q: "Siapa saja yang bisa login ke sistem LiteKai AR?", a: "Terdapat tiga peran pengguna: Admin (mengelola sistem), Pelanggan Kredit (melihat tagihan sendiri), dan Manajer/Pemilik Usaha (melihat laporan)." },
  { q: "Apa perbedaan status Menunggak, Jatuh Tempo H-1, Lancar, dan Lunas?", a: "Menunggak berarti lewat jatuh tempo. H-1 berarti jatuh tempo besok. Lancar berarti pembayaran sesuai jadwal. Lunas berarti seluruh angsuran telah dibayar penuh." },
  { q: "Apa fungsi kotak 'Jatuh Tempo Besok (H-1)' di bagian atas?", a: "Itu adalah pengingat otomatis agar Anda bisa segera menagih pelanggan yang tagihannya jatuh tempo besok." },
  { q: "Bagaimana cara mengirim pengingat tagihan ke pelanggan?", a: "Pada kotak pengingat H-1, klik tombol hijau 'Kirim Pengingat WhatsApp'. Sistem akan otomatis membuat pesan penagihan ke nomor pelanggan." },
  { q: "Kenapa bukti transfer harus diunggah sebelum cetak kwitansi?", a: "Bukti transfer diperlukan oleh sistem sebagai validasi sebelum kwitansi resmi dicetak, untuk memastikan tidak ada kesalahan pencatatan." },
  { q: "Bagaimana cara pelanggan mengecek tagihannya sendiri?", a: "Pelanggan yang sudah login dapat masuk ke akun mereka untuk melihat daftar tagihan yang belum dibayar serta mengunduh invoice secara mandiri." },
  { q: "Bagaimana cara menambahkan pelanggan baru?", a: "Klik tombol '+ Tambah Kredit' di bagian atas dashboard, lalu isi formulir data pelanggan, detail barang, dan skema angsuran." },
  { q: "Apa itu 'Kartu AR Digital'?", a: "Itu adalah ringkasan detail kredit milik satu pelanggan. Anda bisa membukanya dengan mengklik baris nama pelanggan di tabel Pantauan Status Piutang." },
  { q: "Apa yang terjadi jika saya menekan 'Reset Data Demo'?", a: "Tombol itu akan mengembalikan seluruh data pelanggan dan transaksi ke kondisi awal. Gunakan fitur ini hanya untuk uji coba." },
  { q: "Bagaimana jika saya lupa password?", a: "Silakan hubungi Admin melalui menu kontak atau WhatsApp yang tertera untuk melakukan reset password." }
];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Ada yang bisa kami bantu?
        </h1>
        <p className="text-slate-500">
          Temukan jawaban cepat seputar LiteKai AR.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="w-full text-left p-4 font-semibold text-slate-800 flex justify-between items-center bg-white hover:bg-slate-50 rounded-lg"
            >
              <span>{faq.q}</span>
              <span className="text-blue-500 font-bold text-xl">
                {openIndex === index ? '-' : '+'}
              </span>
            </button>
            
            {openIndex === index && (
              <div className="p-4 border-t border-slate-100 text-slate-600 bg-slate-50 rounded-b-lg">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}