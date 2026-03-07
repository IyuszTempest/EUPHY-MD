/**
 * Euphy-Bot - Fake Number Generator ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['fakenumber'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        // Default ID ke 'at' (Austria) kalau user gak masukin kode negara
        let countryId = args[0] || 'at';

        try {
            await conn.sendMessage(m.chat, { react: { text: "📱", key: m.key } });

            // Request ke API Vreden [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/tools/fakenumber/number?id=${countryId}`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result) throw "Gagal ambil data nomor.";

            let capt = `╭━━〔 ⛩️ *𝙵𝙰𝙺𝙴 𝙽𝚄𝙼𝙱𝙴𝚁* ⛩️ 〕━━┓\n┃ 📍 *Country:* ${res.result[0].country}\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            
            // Ambil maksimal 10 nomor biar gak menuhin layar
            const numbers = res.result.slice(0, 10);
            numbers.forEach((v, i) => {
                capt += `*${i + 1}.* \`${v.number}\`\n`;
            });

            capt += `\n*Note:* Gunakan dengan bijak ya!\n*Euphylia Magenta* ✨`;

            await m.reply(capt);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "Kode negara gak valid atau API down."}`);
        }
    }
};
