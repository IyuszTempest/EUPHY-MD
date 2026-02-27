/**
 * Euphy-Bot - Info Jadwal TV
 * Powered by Euphylia Magenta System ✨
 */

const axios = require('axios');

module.exports = {
    command: ['jadwaltv'],
    category: 'tools',
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Sebutkan channel TV-nya, Yus!\nContoh: *${usedPrefix + command} gtv*`);

        try {
            await conn.sendMessage(m.chat, { react: { text: '📺', key: m.key } });

            // Mengambil data dari endpoint yang sudah kamu tes barusan
            const response = await axios.get(`https://api.siputzx.my.id/api/info/jadwaltv?channel=${text.toLowerCase()}`);
            const res = response.data;

            if (!res.status) return m.reply(`Channel *${text}* gak ketemu. Coba channel lain kayak gtv, rcti, atau trans7.`);

            let txt = `*─── [ ⛩️ JADWAL TV: ${text.toUpperCase()} ] ───*\n\n`;
            
            // Looping data acara TV
            res.data.forEach((v) => {
                txt += `🕒 *${v.jam}* - ${v.acara}\n`;
            });

            txt += `\n_Update Real-time Via Api_ ✨`;

            // Mengirim jadwal TV lengkap ke chat
            await conn.reply(m.chat, txt, m);

        } catch (e) {
            console.error(e);
            m.reply(`Aduh, sistem Euphylia Magenta gagal narik jadwal TV: ${e.message}`);
        }
    }
};
