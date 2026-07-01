
const axios = require('axios');

const defaultIdch = typeof global.idch !== 'undefined' ? global.idch : '-';
const defaultNamech = typeof global.namech !== 'undefined' ? global.namech : 'WhatsApp';

const handleTikTok = async (tiktokUrl) => {
    try {
        const res = await axios.get(`https://www.api-junzz.web.id/download/tiktok?url=${encodeURIComponent(tiktokUrl)}`);
        const data = res.data;

        if (!data || data.status !== true) {
            throw new Error(data.message || 'Gagal mengambil data dari API');
        }

        return data.result;
    } catch (error) {
        throw new Error(`API Error: ${error.message}`);
    }
};

module.exports = {
    command: ['tt', 'tiktok'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args }) => {
        if (!args[0] || !args[0].match(/tiktok.com/gi)) return m.reply("Mana link TikTok-nya, Yus?");

        try {
            await conn.sendMessage(m.chat, { react: { text: "🙎🏻", key: m.key } });

            const result = await handleTikTok(args[0]);
            const title = result.title || 'Tanpa Judul';
            const video = result.video_hd || result.video_sd;
            const audio = result.mp3;
            const images = result.images;

            if (result.type === 'image' && images && Array.isArray(images)) {
                for (let img of images) {
                    await conn.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
                }
                await m.reply(`> Berhasil mengirim *${images.length}* foto slide.`);
            } 
            else if (video) {
                await conn.sendMessage(m.chat, {
                    video: { url: video },
                    caption: `> ${title}`,
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: typeof idch !== 'undefined' ? idch : defaultIdch,
                            newsletterName: typeof namech !== 'undefined' ? namech : defaultNamech,
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            }

            if (audio) {
                await conn.sendMessage(m.chat, { 
                    audio: { url: audio }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`,
                }, { quoted: m });
            }

            await conn.sendMessage(m.chat, { react: { text: "💚", key: m.key } });

        } catch (e) {
            console.error('[TIKTOK-ERROR]', e);
            m.reply(`> Gagal nih: ${e.message}`);
        }
    }
};
