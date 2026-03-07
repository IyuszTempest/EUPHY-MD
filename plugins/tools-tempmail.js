/**
 * Euphy-Bot - Fake Email Generator ✨
 * API: Vreden
 */

const axios = require('axios');

module.exports = {
    command: ['tempmail'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "📧", key: m.key } });

            // Request create email baru [cite: 2026-03-07]
            const apiUrl = `https://api.vreden.my.id/api/v1/tools/fakemail/create`;
            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.result) throw "Gagal membuat email palsu.";

            const data = res.result;
            const email = data.addresses[0].address;

            let capt = `╭━━〔 ⛩️ *𝙵𝙰𝙺𝙴 𝙼𝙰𝙸𝙻* ⛩️ 〕━━┓\n`;
            capt += `┃ 📧 *Email:* \`${email}\`\n`;
            capt += `┃ 🆔 *Session ID:* \`${data.id}\`\n`;
            capt += `┃ ⏰ *Expired:* ${data.expiresAt.split('T')[1].split('+')[0]} WIB\n`;
            capt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            capt += `*Note:* Copas Session ID buat cek inbox nanti!\n`;
            capt += `*Euphylia Magenta* ✨`;

            await m.reply(capt);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || "API lagi sibuk."}`);
        }
    }
};
          
