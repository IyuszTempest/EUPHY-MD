/**
 * Euphy-Bot - Fake Email Inbox Checker ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['cektmpmail'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Cek apakah user memasukkan Session ID
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} U2Vzc2lvbjrW5sgERndJWoD368bMG8Hb`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

            // Request ke API Vreden buat cek inbox [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/tools/fakemail/inbox?id=${args[0]}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status) throw res.message || "Gagal cek inbox, Yus.";

            let capt = `╭━━〔 ⛩️ *𝙼𝙰𝙸𝙻 𝙸𝙽𝙱𝙾𝚇* ⛩️ 〕━━┓\n┃ 🆔 *ID:* ${args[0].substring(0, 10)}...\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            const messages = res.result.emails || [];
            
            if (messages.length === 0) {
                capt += `_Belum ada pesan masuk untuk session ini. Coba cek beberapa saat lagi!_`;
            } else {
                // Ambil 5 pesan terbaru biar nggak spam
                messages.slice(0, 5).forEach((v, i) => {
                    capt += `*${i + 1}. From:* ${v.from.address}\n`;
                    capt += `📝 *Subject:* ${v.subject || '(No Subject)'}\n`;
                    capt += `💬 *Preview:* ${v.text.substring(0, 150)}...\n`;
                    capt += `──────────────\n`;
                });
            }

            capt += `\n*Euphylia Magenta* ✨`;

            await m.reply(capt);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "Session ID salah atau sudah expired."}`);
        }
    }
};
