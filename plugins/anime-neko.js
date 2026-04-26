/**
 * Random Neko Carousel 🐱⛩️
 * Fitur: Mengambil 5 gambar neko random dan menampilkannya dalam slide interaktif.
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');

module.exports = {
    command: ['neko', 'randomneko'],
    category: 'anime',
    noPrefix: true,
    register: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Reaksi Kucing biar lucu ✨
        await conn.sendMessage(m.chat, { react: { text: '🐾', key: m.key } });

        try {
            let cards = [];
            
            // Kita ambil 5 gambar neko sekaligus secara paralel
            const requests = Array.from({ length: 5 }, () => axios.get('https://api.waifu.pics/sfw/neko'));
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
                        text: `🏮 *Neko Collection #${i + 1}*\nNyahh~ Kawaii desu ne! 🐱` 
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "Kucing owner" }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        hasMediaAttachment: true,
                        ...media
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({ 
                                display_text: "Download Original", 
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
                                text: `╭━━〔 ⛩️ *𝚁𝙰𝙽𝙳𝙾𝙼 𝙽𝙴𝙺𝙾* ⛩️ 〕━━┓\n┃ ✨ *Status:* Nyaaa Done\n┃ 🏮 *Total:* 5 Slides\n┗━━━━━━━━━━━━━━━━┛` 
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
            m.reply(`❌ Waduh, gagal manggil neko: ${e.message}`);
        }
    }
};
