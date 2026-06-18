/**
 * Plugin: Umamusume Character Finder 🐎⛩️
 * Deskripsi: Mencari informasi detail profil karakter Umamusume via Theresav API.
 * Style: Clean & Minimalist ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['umamusume', 'uma', 'charuma'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        // Validasi: Harus memasukkan nama karakter
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Masukkan nama karakter Umamusume yang ingin dicari!\nContoh: *${command} tokai teio*`);
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '🐎', key: m.key } });

            // Tembak API Theresav untuk mengambil data karakter Umamusume
            const res = await fetch(`https://api.theresav.biz.id/anime/umamusume?name=${encodeURIComponent(text)}&apikey=${global.thrsavapi}`);
            
            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);
            
            const json = await res.json();

            if (!json.status || !json.result) {
                throw new Error(`Karakter "${text}" tidak ditemukan.`);
            }

            const data = json.result;
            const profile = data.profile || {};
            const images = data.images || {};

            // Menyusun teks informasi profil dengan gaya Clean & Minimalist
            let txt = `🐎 *UMAMUSUME PROFILE* 🐎\n\n`
                    + `👤 *Nama:* ${data.name || '-'}\n`
                    + `🗣️ *Seiyuu (VA):* ${profile.va || '-'}\n`
                    + `🎂 *Ulang Tahun:* ${profile.birthday || '-'}\n`
                    + `📏 *Tinggi Badan:* ${profile.height || '-'}\n`
                    + `⚖️ *Berat Badan:* ${profile.weight || '-'}\n\n`
                    + `💬 *Slogan:* _"${profile.catch || '-'}"_\n\n`
                    + `📝 *Deskripsi:* ${profile.detail || '-'}\n\n`
                    + `🎵 *Voice Link:* ${data.voice || '-'}`;

            // Menentukan gambar yang akan dikirim (Prioritas banner, fallback ke galeri atau global)
            let targetImage = images.banner || (images.gallery && images.gallery[0]?.image) || global.imgall;

            // Kirim profil beserta gambar menggunakan format Newsletter terusan
            await conn.sendMessage(m.chat, {
                image: { url: targetImage },
                caption: txt,
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
            console.error("Theresav Umamusume Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Gagal mencari karakter:* ${err.message || "Terjadi masalah pada API."}`);
        }
    }
};
