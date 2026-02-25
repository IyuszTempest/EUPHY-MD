/** * Euphy-Bot - YouTube Search
 * Fitur: Mencari lagu/video YouTube menggunakan API IyuszTempest
 */

const axios = require('axios');

module.exports = {
    command: ['ytsearch'],
    category: 'download',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        if (!text) return m.reply('Mau cari lagu apa? Contoh: .yts onnanoko ni naritai [cite: 2025-05-24]');

        try {
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
            
            // Memanggil API milik Yus
            const apiResp = await axios.get(`https://iyusztempest.my.id/api/download?feature=ytsearch&query=${encodeURIComponent(text)}&apikey=$[global.apiyus]`);
            const results = apiResp.data.result;

            if (!results || results.length === 0) return m.reply('Aduh, lagunya nggak ketemu. Coba judul lain!');

            let teks = `╭━━〔 ⛩️ *𝚈𝚃-𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n┃ ✨ Hasil pencarian untuk: *${text}*\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;

            // Mengambil 5 hasil teratas agar tidak kepanjangan (Limit RAM 512MB)
            for (let i = 0; i < 5; i++) {
                let v = results[i];
                if (!v) break;
                teks += `*${i + 1}. ${v.title}*\n`
                      + `🏮 *Durasi:* ${v.duration}\n`
                      + `👁️ *Views:* ${v.views.toLocaleString()}\n`
                      + `🔗 *Link:* ${v.url}\n\n`;
            }

            // Mengirim pesan dengan gambar dari hasil pertama
            await conn.sendMessage(m.chat, { 
                image: { url: results[0].thumbnail }, 
                caption: teks 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`Error nih: ${e.message}. Pastikan API kamu aktif ya!`);
        }
    }
};
