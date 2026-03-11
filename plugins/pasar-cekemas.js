/**
 * Euphy-Bot - Gold Price Checker 🪙
 * Memantau harga emas Antam terkini.
 */

const axios = require('axios');

module.exports = {
    command: ['hargaemas', 'cekemas'],
    category: 'economic',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        try {
            // Mengambil data dari API harga emas publik (Indonesia)
            const { data } = await axios.get('https://logam-mulia-api.vercel.app/prices/antam');

            if (!data || !data.data) return m.reply('⚠️ Gagal mengambil data harga emas terbaru.');

            const emas = data.data[0]; // Mengambil data terbaru (index 0)
            const date = new Date(emas.date).toLocaleDateString('id-ID', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });

            let teks = `*🪙 HARGA EMAS ANTAM TERKINI 🪙*\n`;
            teks += `_Update: ${date}_\n\n`;
            teks += `*• Harga Dasar:* Rp ${emas.price.toLocaleString('id-ID')}/gram\n`;
            teks += `*• Harga Buyback:* Rp ${emas.buyback.toLocaleString('id-ID')}/gram\n\n`;
            
            teks += `_Harga bisa berubah sewaktu-waktu. Yuk mulai nabung emas buat masa depan!_ 🚀`;

            m.reply(teks);
        } catch (e) {
            console.error(e);
            m.reply('⚠️ Terjadi kesalahan saat menghubungi server harga emas. Coba lagi nanti ya!');
        }
    }
};
