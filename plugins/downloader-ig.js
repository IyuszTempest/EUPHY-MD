/**
 * Plugin: Instagram Downloader (All-in-One) 📸🎥
 * Deskripsi: Mengunduh foto, carousel, atau video Reels/Post dari Instagram via Theresav API.
 * Style: Clean & Minimalist ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['ig', 'instagram', 'igdl', 'reels'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Mana link Instagram-nya?\nContoh: *${command} https://www.instagram.com/p/xxxx*`);
        }
        if (!/instagram\.com\/(reel|reels|p|stories)/i.test(text)) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply('Tautan tidak valid! Pastikan link berasal dari Instagram Post, Reels, atau Stories.');
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

            const res = await fetch(`https://api.theresav.biz.id/download/aio?url=${encodeURIComponent(text.trim())}&apikey=${global.thrsavapi}`);
            
            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);
            
            const json = await res.json();

            if (!json.status || !json.result || !json.result.medias || json.result.medias.length === 0) {
                throw new Error('Gagal mengekstrak media dari tautan tersebut. Pastikan akun tidak diprivat.');
            }

            const data = json.result;
            const captionText = data.title && data.title !== 'instagram' ? data.title.trim() : '*Instagram Downloader Done*';

            const validMedias = data.medias.filter(media => media.url);

            for (let i = 0; i < validMedias.length; i++) {
                const media = validMedias[i];
                const isFirst = i === 0;
                
                const sendOptions = {
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.idch,
                            newsletterName: global.namech,
                            serverMessageId: 143
                        }
                    }
                };

                if (isFirst) {
                    sendOptions.caption = captionText;
                }

                if (media.type === 'video' || media.ext === 'mp4') {
                    await conn.sendMessage(m.chat, { video: { url: media.url }, ...sendOptions }, { quoted: m });
                } else if (media.type === 'image' || ['jpg', 'jpeg', 'png', 'webp'].includes(media.ext)) {
                    await conn.sendMessage(m.chat, { image: { url: media.url }, ...sendOptions }, { quoted: m });
                }
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error("Theresav IGDL Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Unduhan gagal:* ${err.message || "Terjadi masalah pada API Downloader."}`);
        }
    }
};
