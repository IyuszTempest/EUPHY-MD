/**
 * Plugin: Pixiv Artwork Search (Carousel Style) 🎨⛩️
 * Deskripsi: Mencari gambar ilustrasi anime dari Pixiv dengan tampilan Carousel interaktif via Theresav API.
 * Style: Interactive Carousel Cards ✨
 */

const fetch = require('node-fetch');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['pixiv', 'pixivsearch'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Masukkan kata kunci gambar ilustrasi yang ingin dicari!\nContoh: *${command} mornye*`);
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

            // ✅ Perbaikan: Menggunakan parameter "?query=" sesuai spesifikasi API Theresav
            const res = await fetch(`https://api.theresav.biz.id/search/pixiv?query=${encodeURIComponent(text)}&apikey=${global.thrsavapi}`);
            
            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);
            
            const json = await res.json();

            if (!json.status || !json.result || json.result.length === 0) {
                throw new Error(`Hasil ilustrasi untuk "${text}" tidak ditemukan.`);
            }

            const dataHasil = json.result.slice(0, 5);
            const cards = [];

            for (let i = 0; i < dataHasil.length; i++) {
                const item = dataHasil[i];

                // Menggunakan reverse proxy pixiv.cat agar stream gambar tidak 403 Forbidden
                const imageUrl = item.id ? `https://pixiv.cat/${item.id}.jpg` : global.imgall;

                const media = await prepareWAMessageMedia(
                    { image: { url: imageUrl } },
                    { upload: conn.waUploadToServer }
                ).catch(() => null); 

                let bodyText = `📌 *Title:* ${item.title || 'No Title'}\n`
                             + `👤 *Kreator:* ${item.author || 'Unknown'}\n`
                             + `📐 *Size:* ${item.width}x${item.height} px\n`
                             + `🏷️ *Tags:* ${item.tags ? item.tags.slice(0, 3).join(', ') : '-'}`;

                cards.push({
                    body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "Pixiv Artwork Search" }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: `✨ Result #${i + 1}`,
                        hasMediaAttachment: true,
                        ...(media || {})
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [
                            {
                                name: "cta_url",
                                buttonParamsJson: JSON.stringify({ 
                                    display_text: "Buka Sumber 🌐", 
                                    url: item.url 
                                })
                            }
                        ]
                    })
                });
            }

            const msg = generateWAMessageFromContent(
                m.chat, 
                {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                body: proto.Message.InteractiveMessage.Body.create({ 
                                    text: `╭━━〔 ⛩️ *𝙿𝙸𝚇𝙸𝚅 𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n┃ ✨ *Query:* ${text}\n┃ 👤 *Request by:* ${m.pushName || 'User'}\n┗━━━━━━━━━━━━━━━┛` 
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({ text: global.namech || 'Pixiv Engine' }),
                                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards }),
                                contextInfo: {
                                    mentionedJid: [m.sender],
                                    forwardingScore: 999,
                                    isForwarded: true
                                }
                            })
                        }
                    }
                }, 
                { userJid: conn.user.id, quoted: m }
            );

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`⚠️ Waduh, ada masalah! Error: ${e.message}`);
        }
    }
};
