const fetch = require('node-fetch');

module.exports = {
    command: ['tt', 'tiktok'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://vt.tiktok.com/xxxx/`);

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            const apikey = global.apiyus;
            const url = `https://iyusztempest.my.id/api/download?feature=tiktok&url=${args[0]}&apikey=${apikey}`;
            
            const response = await fetch(url);
            const res = await response.json();

            if (res.status !== "success") throw "Gagal mengambil data dari server.";

            const { title, author, video, music } = res.result;

            // 1. Kirim Video (Tetap Cepat)
            if (video) {
                await conn.sendMessage(m.chat, { 
                    video: { url: video }, 
                    caption: `*─── [ TIKTOK VIDEO ] ───*\n\n📝 *Title:* ${title || 'No Title'}\n👤 *Author:* ${author || 'Unknown'}` 
                }, { quoted: m });
            }

            // 2. Kirim Audio High-Speed (Metode URL Stream)
            if (music) {
                await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });

                // Kita pakai URL langsung ke Baileys agar server Lunes Host gak capek nulis file
                await conn.sendMessage(m.chat, { 
                    audio: { url: music }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${title || 'tiktok'}.mp3`,
                    ptt: false, // Set true kalau mau jadi Voice Note
                    contextInfo: {
                        externalAdReply: {
                            title: 'TikTok Audio Success 🎶',
                            body: author || 'Euphy System',
                            thumbnailUrl: global.imgall,
                            sourceUrl: args[0],
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
            }

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`❌ *Error:* ${e.message || e}`);
        }
    }
};
