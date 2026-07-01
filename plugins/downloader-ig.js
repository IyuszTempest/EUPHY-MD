const axios = require('axios');

const defaultIdch = typeof global.idch !== 'undefined' ? global.idch : '-';
const defaultNamech = typeof global.namech !== 'undefined' ? global.namech : 'WhatsApp';

const handleInstagram = async (instagramUrl) => {
    try {
        const res = await axios.get(`https://www.api-junzz.web.id/download/instagram?url=${encodeURIComponent(instagramUrl)}`);
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
    command: ['ig', 'igdl', 'instagram'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args }) => {
        if (!args[0] || !args[0].match(/instagram.com/gi)) return m.reply("Mana link Instagram-nya?");

        try {
            await conn.sendMessage(m.chat, { react: { text: "🙎🏻", key: m.key } });

            const result = await handleInstagram(args[0]);

            if (!result || !Array.isArray(result) || result.length === 0) {
                throw new Error("Media tidak ditemukan atau link tidak valid.");
            }

            for (let i = 0; i < result.length; i++) {
                const item = result[i];
                const mediaUrl = item.url_download;
                const isVideo = mediaUrl.includes('.mp4') || (item.quality && /video/i.test(item.quality));
                
                const caption = i === 0 ? `> Berhasil mengunduh *${result.length}* media dari Instagram.` : '';

                if (isVideo) {
                    await conn.sendMessage(m.chat, {
                        video: { url: mediaUrl },
                        caption: caption,
                        contextInfo: {
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: typeof idch !== 'undefined' ? idch : defaultIdch,
                                newsletterName: typeof namech !== 'undefined' ? namech : defaultNamech,
                                serverMessageId: 143
                            }
                        }
                    }, { quoted: m });
                } else {
                    await conn.sendMessage(m.chat, {
                        image: { url: mediaUrl },
                        caption: caption,
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
            }

            await conn.sendMessage(m.chat, { react: { text: "💚", key: m.key } });

        } catch (e) {
            console.error('[INSTAGRAM-ERROR]', e);
            m.reply(`> Gagal nih: ${e.message}`);
        }
    }
};
