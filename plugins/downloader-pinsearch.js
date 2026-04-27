/**
 * Pinterest Search V3.3 (Official API Endpoint) ⛩️🌸
 * Solusi: Menggunakan subdomain api.siputzx.my.id & parameter type=image
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');

module.exports = {
    command: ['pin', 'pinterest'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Mau cari gambar apa di Pinterest?\nContoh: *${usedPrefix + command} Iroha* 🌸`);

        await conn.sendMessage(m.chat, { react: { text: '🧭', key: m.key } });

        try {
            // Menggunakan endpoint hasil curl: api.siputzx.my.id
            const apiUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}&type=image`;
            
            const { data: res } = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            // Validasi data dari API
            if (!res.status || !res.data || res.data.length === 0) {
                return m.reply('❌ Gomen, datanya kosong. Coba keyword lain!');
            }

            const results = res.data.slice(0, 5); 
            let cards = [];

            for (let i = 0; i < results.length; i++) {
                const item = results[i];
                
                // Siapkan media untuk slide carousel
                const media = await prepareWAMessageMedia(
                    { image: { url: item.image_url } },
                    { upload: conn.waUploadToServer }
                );

                let bodyText = `📌 *Title:* ${item.grid_title || 'No Title'}\n`;
                bodyText += `👤 *Pinner:* ${item.pinner?.full_name || 'Anonymous'}`;

                cards.push({
                    body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "Pinterest Search" }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: `✨ Result #${i + 1}`,
                        hasMediaAttachment: true,
                        ...media
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [
                            {
                                name: "cta_url",
                                buttonParamsJson: JSON.stringify({ 
                                    display_text: "Buka Sumber", 
                                    url: item.pin 
                                })
                            }
                        ]
                    })
                });
            }

            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({ 
                                text: `╭━━〔 ⛩️ *𝙿𝙸𝙽𝚃𝙴𝚁𝙴𝚂𝚃* ⛩️ 〕━━┓\n┃ ✨ *Query:* ${text}\n┃ 👤 *Request by:* ${m.pushName}\n┗━━━━━━━━━━━━━━━┛` 
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: global.wm }),
                            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards })
                        })
                    }
                }
            }, { userJid: conn.user.id, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: '🌸', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Waduh, ada masalah API! Error: ${e.message}`);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
