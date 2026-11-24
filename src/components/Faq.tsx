import { useState } from 'react';

export default function Faq() {
  const faqs = [
    { q: "Bagaimana cara login ke sistem?", a: "Masukkan username dan password yang sudah diberikan oleh admin." },
    { q: "Bagaimana cara mengecek tagihan saya?", a: "Buka menu 'Tagihan' pada dashboard, lalu lihat daftar tagihan yang belum dibayar." },
    { q: "Bagaimana cara mengunduh invoice?", a: "Buka detail tagihan Anda, lalu klik tombol 'Download Invoice'." },
    { q: "Kenapa bukti transfer harus diunggah?", a: "Bukti transfer diperlukan sistem sebelum kwitansi resmi dicetak." },
    { q: "Siapa saja yang bisa mengakses aplikasi ini?", a: "Admin, Pelanggan Kredit, dan Manajer/Pemilik Usaha." }
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