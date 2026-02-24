/**
 * Plugin Preset Alight Motion
 * Menggunakan API Tools/Preset AM
 */

const axios = require('axios');

module.exports = {
    command: ['presetam'],
    category: 'tools',
    noPrefix: true, 
    call: async (conn, m, { usedPrefix, command }) => {
        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

        try {
            // Memanggil API milikmu
            const response = await axios.get(`https://iyusztempest.my.id/api/tools?feature=presetam&apikey=${global.apiyus}`);
            
            if (response.data.status !== "success") {
                return m.reply('Maaf, gagal mengambil preset. Coba beberapa saat lagi.');
            }

            const { result } = response.data;
            
            let caption = `*─── [ PRESET ALIGHT MOTION ] ───*\n\n`;
            caption += `📝 *Pesan:* ${response.data.message}\n\n`;
            caption += `📥 *Link XML:* ${result.UrlXml}\n`;
            caption += `📱 *Link MB:* ${result.UrlMb}\n`;
            caption += `🎵 *Sound:* ${result.Sound}\n\n`;
            caption += `Silakan salin link di atas untuk mengunduh presetnya! ✨`;

            // Kirim hasil
            await conn.reply(m.chat, caption, m);
            
            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server API.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
