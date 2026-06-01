const axios = require('axios');

module.exports = {
    command: ['ytmp3'],
    category: 'downloader',
    noPrefix: true,

    call: async (conn, m, { text, command }) => {
        if (!text) return m.reply('> Mana linkny?');

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

            if (!audioUrl) throw new Error("> audio tidak ditemukan.");

            await conn.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mp4",
                fileName: `${title}.mp3`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '👍🏻', key: m.key } });

        } catch (e) {
            console.error("> Error pada plugin downloader-ytmp3:", e);
            await conn.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
            return m.reply('> Gagal mengambil lagu, coba link lain atau API sedang maintenance.');
        }
    }
};
