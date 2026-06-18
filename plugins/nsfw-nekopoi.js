/**
 * Plugin: Nekopoi All-in-One Engine (Latest, Search & Detail) 🐱⛩️
 * Deskripsi: Mengambil update terbaru, mencari judul, atau membedah link unduhan Nekopoi via Theresav API.
 * Style: Clean, Minimalist & Interactive List ✨
 */

const fetch = require('node-fetch');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['nekopoi', 'poilatest', 'latestpoi', 'poisearch', 'poidetail'],
    category: 'nsfw',
    noPrefix: true,
    premium: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        try {
            if (text && text.includes('nekopoi.care/')) {
                await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });
                
                const res = await fetch(`https://api.theresav.biz.id/anime/nekopoi/detail?url=${encodeURIComponent(text.trim())}&apikey=${global.thrsavapi}`);
                if (!res.ok) throw new Error(`Server API Error: ${res.status}`);
                
                const json = await res.json();
                if (!json.status || !json.result) throw new Error('Data detail tidak ditemukan.');

                const data = json.result;
                let caption = `⛩️ *NEKOPOI DOWNLOAD DETAIL* ⛩️\n\n` +
                              `📌 *Judul:* ${data.title}\n` +
                              `🎭 *Genre:* ${data.info?.genre || '-'}\n` +
                              `🏢 *Produser:* ${data.info?.producers || '-'}\n` +
                              `⏱️ *Durasi:* ${data.info?.duration || '-'}\n` +
                              `📦 *Ukuran:* ${data.info?.size || '-'}\n\n` +
                              `_*Link Download ketersediaan kualitas file ada di bawah ini:*_\n\n`;

                data.downloads.forEach((dl) => {
                    const qualityName = dl.quality.match(/\[\d+p\]/i) ? dl.quality.match(/\[\d+p\]/i)[0] : 'Download';
                    caption += `📺 *Kualitas ${qualityName}:*\n`;
                    dl.links.forEach((linkObj) => {
                        caption += `• ${linkObj.provider}: ${linkObj.link}\n`;
                    });
                    caption += `\n`;
                });

                await conn.sendMessage(m.chat, {
                    text: caption.trim(),
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
                }, { quoted: m });

                return await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
            }

            if (text && !text.includes('nekopoi.care/')) {
                await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

                const res = await fetch(`https://api.theresav.biz.id/anime/nekopoi/search?q=${encodeURIComponent(text)}&apikey=${global.thrsavapi}`);
                if (!res.ok) throw new Error(`Server API Error: ${res.status}`);

                const json = await res.json();
                if (!json.status || !json.result || json.result.length === 0) {
                    throw new Error(`Hasil pencarian untuk "${text}" tidak ditemukan.`);
                }

                let desc = `Berikut adalah hasil pencarian judul dari kata kunci *"${text}"*.\n\n` +
                           `_Silakan pilih salah satu daftar di bawah untuk melihat rincian detail spesifikasi file & tautan unduhan._`;

                const rows = json.result.slice(0, 10).map((item) => ({
                    title: item.title.length > 50 ? item.title.substring(0, 47) + '...' : item.title,
                    description: `Lihat Detail Link Download`,
                    id: `${usedPrefix || ''}nekopoi ${item.link}`
                }));

                const listMessage = {
                    title: 'Daftar Hasil Pencarian 🔎',
                    sections: [{
                        title: 'Judul Ditemukan',
                        highlight_label: 'Hasil Teratas ⚡',
                        rows: rows
                    }]
                };

                const msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2
                                },
                                interactiveMessage: proto.Message.InteractiveMessage.create({
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        title: '🐱 NEKOPOI SEARCH RESULT 🐱',
                                        hasMediaAttachment: true,
                                        ...(await prepareWAMessageMedia({ image: { url: json.result[0].thumb || global.imgall } }, { upload: conn.waUploadToServer }))
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.create({ text: desc }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({ text: global.namech || 'Nekopoi Engine' }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        messageVersion: 1,
                                        buttons: [{
                                            name: "single_select",
                                            buttonParamsJson: JSON.stringify(listMessage)
                                        }]
                                    }),
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
                return await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
            }

            // 3. SUB-FITUR UTAMA: LATEST UPDATE (Jika memanggil command polosan tanpa teks tambahan)
            await conn.sendMessage(m.chat, { react: { text: '🐱', key: m.key } });

            const res = await fetch(`https://api.theresav.biz.id/anime/nekopoi/latest?apikey=${global.thrsavapi}`);
            if (!res.ok) throw new Error(`Server API Error: ${res.status}`);

            const json = await res.json();
            if (!json.status || !json.result || json.result.length === 0) {
                throw new Error('Gagal mendapatkan daftar update terbaru.');
            }

            let desc = `Halo! Berikut adalah daftar rilisan video pembaruan terbaru hari ini.\n\n` +
                       `_Silakan ketuk tombol di bawah untuk memilih judul dan mengekstrak tautan download._`;

            const rows = json.result.slice(0, 10).map((item) => ({
                title: item.title.length > 50 ? item.title.substring(0, 47) + '...' : item.title,
                description: `Rilis: ${item.date}`,
                id: `${usedPrefix || ''}nekopoi ${item.link}`
            }));

            const listMessage = {
                title: 'Update Rilisan Terbaru 📱',
                sections: [{
                    title: 'Pembaruan Terkini',
                    highlight_label: 'Rilis Baru ⚡',
                    rows: rows
                }]
            };

            const msg = generateWAMessageFromContent(
                m.chat,
                {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                header: proto.Message.InteractiveMessage.Header.create({
                                    title: '🐱 NEKOPOI LATEST UPDATE 🐱',
                                    hasMediaAttachment: true,
                                    ...(await prepareWAMessageMedia({ image: { url: json.result[0].thumb || global.imgall } }, { upload: conn.waUploadToServer }))
                                }),
                                body: proto.Message.InteractiveMessage.Body.create({ text: desc }),
                                footer: proto.Message.InteractiveMessage.Footer.create({ text: global.namech || 'Nekopoi Engine' }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    messageVersion: 1,
                                    buttons: [{
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify(listMessage)
                                    }]
                                }),
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

        } catch (err) {
            console.error("Nekopoi Engine Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Proses gagal:* ${err.message || "Terjadi kesalahan pada sistem API."}`);
        }
    }
};
