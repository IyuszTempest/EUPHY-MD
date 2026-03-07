/**
 * Euphy-Bot - Fake Number Inbox Checker ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['fakeinbox'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Cek apakah user masukin nomornya
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} 4368181302102`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "📩", key: m.key } });

            // Request ke API Vreden buat cek pesan [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/tools/fakenumber/message?number=${args[0]}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status) throw res.message || "Gagal cek pesan.";

            let capt = `╭━━〔 ⛩️ *𝙸𝙽𝙱𝙾𝚇 𝙲𝙷𝙴𝙲𝙺𝙴𝚁* ⛩️ 〕━━┓\n┃ 📱 *Number:* ${args[0]}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            if (!res.result || res.result.length === 0) {
                capt += `_Belum ada pesan masuk untuk nomor ini._`;
            } else {
                // Ambil 5 pesan terbaru biar hemat RAM
                const messages = res.result.slice(0, 5);
                messages.forEach((v, i) => {
                    capt += `*${i + 1}. From:* ${v.from}\n`;
                    capt += `💬 *Message:* ${v.message}\n`;
                    capt += `⏰ *Time:* ${v.time}\n`;
                    capt += `──────────────\n`;
                });
            }

            capt += `\n*Euphylia Magenta* ✨`;

            await m.reply(capt);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "Nomor salah atau API lagi sibuk."}`);
        }
    }
};
