/**
 * Plugin: KAORI Nusantara Anime News Reader 📢⛩️
 * Deskripsi: Mengambil jajaran berita anime terbaru dari KAORI Nusantara via Theresav API.
 * Style: Clean & Minimalist ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['animenews', 'kaorinews', 'beritaanime'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: '📰', key: m.key } });

            // Tembak API Theresav untuk mengambil berita anime KAORI
            const res = await fetch(`https://api.theresav.biz.id/anime/kaori?apikey=${global.thrsavapi}`);
            
            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);
            
            const json = await res.json();

            if (!json.status || !json.result || json.result.length === 0) {
                throw new Error('Gagal mendapatkan daftar berita atau data kosong.');
            }

            // Susun teks dari array hasil berita (dibatasi 10 berita teratas agar tidak spam panjang)
            let txt = `⛩️ *KAORI ANIME NEWS* ⛩️\n\n`;
            
            const daftarBerita = json.result.slice(0, 10); 
            daftarBerita.forEach((news, index) => {
                txt += `${index + 1}. *${news.judul.trim()}*\n`;
                txt += `🔗 _${news.link}_\n\n`;
            });

            txt += `_Gunakan tautan di atas untuk membaca artikel berita selengkapnya._`;

            // Kirim kumpulan berita dengan format Newsletter terusan minimalis
            await conn.sendMessage(m.chat, {
                text: txt,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: global.namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (err) {
            console.error("Theresav Kaori News Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Gagal memuat berita:* ${err.message || "Terjadi masalah pada API."}`);
        }
    }
};
