const axios = require('axios');

module.exports = {
    command: ['play'],
    category: 'downloader',
    noPrefix: true,

    call: async (conn, m, { text, command }) => {
        if (!text) return m.reply('Lagu apa yg ingin dicari? Contoh: *Play Ave Mujica*');

        try {
            await conn.sendMessage(m.chat, { react: { text: '🎶', key: m.key } });

            const res = await axios.get(
                `https://neotex.my.id/download/ytplay?q=${encodeURIComponent(text)}`,
                { timeout: 30000 }
            );

            if (!res.data?.status || !res.data?.result) throw new Error("> Gagal mengambil data dari API.");

            const data = res.data.result;
            const { title, duration, url } = data;
            const audioUrl = data.download?.audio;

            if (!audioUrl) throw new Error("> Link download audio tidak ditemukan.");

            await conn.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mp4",
                fileName: `${title}.mp3`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '👍🏻', key: m.key } });

        } catch (e) {
            console.error("> Error pada plugin downloader/play.js:", e);
            await conn.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
            return m.reply('> Gagal mengambil lagu, coba kata kunci lain atau API sedang maintenance.');
        }
    }
};
