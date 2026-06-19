/**
 * Plugin: Anime Trending Characters Tracker 📈🌸
 * Deskripsi: Menampilkan daftar karakter anime yang sedang populer/trending saat ini via Theresav API.
 * Style: Clean, Aesthetic & Informative ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['charatrending'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        await conn.sendMessage(m.chat, { react: { text: '📈', key: m.key } });

        try {
            const res = await fetch(`https://api.theresav.biz.id/anime/acdb/trending?apikey=${global.thrsavapi}`);
            
            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);
            
            const json = await res.json();

            if (!json.status || !json.data || !json.data.results || json.data.results.length === 0) {
                throw new Error('Gagal memuat daftar karakter anime yang sedang trending.');
            }

            const data = json.data;
            
            let responseText = `✨ *TRENDING ANIME CHARACTERS* ✨\n\n`
                             + `🔥 *Total Trending:* ${data.total} Karakter\n\n`;

            const topTrending = data.results.slice(0, 15);

            topTrending.forEach((char, index) => {
                responseText += `${index + 1}. *${char.name}*\n`;
                responseText += `   └ 🔗 info: ${char.url}\n\n`;
            });

            responseText += `🌟 _Karakter favoritmu masuk daftar trending minggu ini gak, senpai?_`;

            await conn.sendMessage(m.chat, {
                text: responseText.trim(),
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

        } catch (e) {
            console.error("Anime Trending API Error:", e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Proses gagal:* ${e.message || "Terjadi kesalahan pada sistem database anime."}`);
        }
    }
};
