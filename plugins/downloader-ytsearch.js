/**
 * Plugin YouTube Search
 * Menggunakan API Download/YT Search
 */

const axios = require('axios');

module.exports = {
    command: ['ytsearch', 'yts'],
    category: 'download',
    noPrefix: true, // Fitur tanpa prefix
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Mau cari video apa? Contoh: *${command} kawaikute gomen*`);

        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            // Memanggil API milikmu
            const response = await axios.get(`https://iyusztempest.my.id/api/download?feature=ytsearch&query=${encodeURIComponent(text)}&apikey=yusz123`);
            
            if (!response.data.status) {
                return m.reply('Maaf, pencarian tidak ditemukan atau API sedang bermasalah.');
            }

            const results = response.data.result;
            let caption = `*─── [ YOUTUBE SEARCH ] ───*\n\n`;

            results.slice(0, 10).forEach((v, i) => {
                caption += `*${i + 1}. ${v.title}*\n`;
                caption += `🔗 *Link:* ${v.url}\n`;
                caption += `⏳ *Durasi:* ${v.duration}\n`;
                caption += `👁️ *Views:* ${v.views.toLocaleString()}\n\n`;
            });

            caption += `Pilih salah satu judul di atas untuk didownload! ✨`;

            // Kirim hasil pencarian
            await conn.reply(m.chat, caption, m);
            
            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat mengambil data dari server.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
