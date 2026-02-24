/**
 * Plugin F2Anime - Convert Image to Anime
 * Menggunakan API AI/F2Anime
 */

const axios = require('axios');

module.exports = {
    command: ['toanime'],
    category: 'ai',
    noPrefix: true, 
    premium: true,
    call: async (conn, m, { text, command }) => {
        // Ambil URL gambar dari reply atau dari link yang diketik
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        let url;

        if (/image/.test(mime)) {
            // Jika user kirim/reply gambar, harusnya diupload dulu ke telegra.ph atau sejenisnya
            // Tapi kalau kamu mau pake link langsung dari text, logicnya di bawah:
            let media = await q.download();
            // Di sini kamu butuh fungsi upload media ke URL agar bisa dibaca API
            // Contoh asumsi: kamu punya global.uploadImage(media)
            url = await global.uploadImage(media); 
        } else if (text && text.startsWith('http')) {
            url = text;
        }

        if (!url) return m.reply(`Kirim atau reply gambar dengan caption *${command}* atau masukkan link gambar langsung!`);

        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } });

        try {
            // Memanggil API menggunakan variabel global
            // Pastikan URL gambar di-encode agar tidak pecah saat dikirim ke API
            const response = await axios.get(`${global.apiyus}/api/ai?feature=f2anime&query=${encodeURIComponent(url)}&apikey=${global.apikey}`);
            
            if (response.data.status === false) {
                return m.reply(`Gagal: ${response.data.msg}`);
            }

            const resultUrl = response.data.result || response.data.url;

            // Kirim hasil gambar anime
            await conn.sendMessage(m.chat, { 
                image: { url: resultUrl }, 
                caption: `✨ Berhasil diubah menjadi anime!`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat memproses gambar di server AI.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
