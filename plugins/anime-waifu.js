/**
 * Random Waifu Carousel 🌸⛩️
 * Fitur: Mengambil 5 gambar waifu random dan menampilkannya dalam slide.
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');

module.exports = {
    command: ['waifu', 'randomwaifu'],
    category: 'anime',
    noPrefix: true,
    register: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Reaksi 'Love' biar makin wibu ✨
        await conn.sendMessage(m.chat, { react: { text: '🌸', key: m.key } });

        try {
            let cards = [];
            
            // Kita ambil 5 gambar waifu sekaligus secara paralel biar kencang
            const requests = Array.from({ length: 5 }, () => axios.get('https://api.waifu.pics/sfw/waifu'));
            const responses = await Promise.all(requests);
            const images = responses.map(res => res.data.url);

            for (let i = 0; i < images.length; i++) {
                const imageUrl = images[i];
                
                // Siapkan media untuk tiap card carousel
                const media = await prepareWAMessageMedia(
                    { image: { url: imageUrl } },
                    { upload: conn.waUploadToServer }
                );

                cards.push({
                    body: proto.Message.InteractiveMessage.Body.create({ 
                        text: `✨ *Waifu Collection #${i + 1}*\nini my bini gueh! 🌸` 
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "Wangy Wangy" }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        hasMediaAttachment: true,
                        ...media
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: "Lihat Full HD", 
                                url: imageUrl 
                            })
                        }]
                    })
                });
            }

            // Susun ke dalam Interactive Carousel Message
            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({ 
                                text: `DONE 🥰` 
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: global.wm }),
                            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards })
                        })
                    }
                }
            }, { userJid: conn.user.id, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (e) {
            console.error(e);
            m.reply(`❌ Aduh, gagal ambil waifu: ${e.message}`);
        }
    }
};
