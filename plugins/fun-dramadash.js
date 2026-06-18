/**
 * Plugin: DramaDash Station (Single Select List Style) 🎬⛩️
 * Deskripsi: Menampilkan rekomendasi drama beranda dalam bentuk List Menu atau membedah detail episode via Theresav API.
 * Style: Interactive Single Select List ✨
 */

const fetch = require('node-fetch');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['dramadash', 'listdrama', 'infodrama'],
    category: 'fun',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        try {
          
            if (text && /^\d+$/.test(text.trim())) {
                await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });
                const dramaId = text.trim();

                const res = await fetch(`https://api.theresav.biz.id/drama/dramadash/detail?dramaId=${dramaId}&apikey=${global.thrsavapi}`);
                if (!res.ok) throw new Error(`Server API Error: ${res.status}`);

                const json = await res.json();
                if (!json.status || !json.result) throw new Error('Informasi data drama tidak ditemukan.');

                const data = json.result;
                let caption = `🎬 *DRAMADASH DETAIL ID: #` + dramaId + `* 🎬\n\n`
                            + `📌 *Judul:* ${data.name || '-'}\n`
                            + `📝 *Sinopsis:* ${data.description || 'Tidak ada deskripsi.'}\n\n`
                            + `🍿 *DAFTAR EPISODE TERSEDIA:* \n`;

                const listEpisodes = data.episodes || [];
                const maxEpisodes = listEpisodes.slice(0, 15);

                maxEpisodes.forEach((ep) => {
                    const statusKunci = ep.isLocked ? '🔒 [Locked]' : '🔓 [Free]';
                    caption += `• Eps ${ep.episodeNumber}: ${statusKunci}\n`;
                    if (ep.videoUrl && !ep.isLocked) {
                        caption += `  🔗 Link: ${ep.videoUrl.substring(0, 45)}...\n`;
                    }
                });

                if (listEpisodes.length > 15) {
                    caption += `\n_...dan ${listEpisodes.length - 15} episode lainnya._\n`;
                }

                await conn.sendMessage(m.chat, {
                    image: { url: data.poster || global.imgall },
                    caption: caption.trim(),
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.idch,
                            serverMessageId: 143,
                            newsletterName: `${global.namech} - Detail Station`
                        }
                    }
                }, { quoted: m });

                return await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
            }

            await conn.sendMessage(m.chat, { react: { text: '🍿', key: m.key } });

            const res = await fetch(`https://api.theresav.biz.id/drama/dramadash/home?apikey=${global.thrsavapi}`);
            if (!res.ok) throw new Error(`Server API Error: ${res.status}`);

            const json = await res.json();
            if (!json.status || !json.result || !json.result.banner) {
                throw new Error('Gagal mengambil pembaruan beranda drama.');
            }

            const dataBanner = json.result.banner.slice(0, 15); 
            const rows = dataBanner.map((item) => {
                const genreText = item.genres ? item.genres.slice(0, 2).join(', ') : '-';
                return {
                    title: item.name.length > 50 ? item.name.substring(0, 47) + '...' : item.name,
                    description: `👁️ Views: ${item.viewCount || '0'} | 🎭 Genre: ${genreText}`,
                    id: `${usedPrefix || ''}${command} ${item.id}`
                };
            });

            const listMessage = {
                title: 'Open Drama List! 🎬',
                sections: [{
                    title: 'Rekomendasi Terpopuler',
                    highlight_label: 'Hot Drama 🔥',
                    rows: rows
                }]
            };

            let bodyContent = `〔 ⛩️ *𝙳𝚁𝙰𝙼𝙰𝙳𝙰𝚂𝙷 𝚂𝚃𝙰𝚃𝙸𝙾𝙽* ⛩️ 〕\n 🎉 *Status:* Connection Online\n┃ 👤 *Request by:* ${m.pushName || 'User'}\n\n`;
            bodyContent += `Silakan klik tombol di bawah ini untuk memilih daftar mini-drama terpopuler hari ini dan melihat rincian serta tautan episodenya!`;

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
                                    title: global.namebot || 'DramaDash Station',
                                    hasMediaAttachment: true,
                                    ...(await prepareWAMessageMedia({ image: { url: json.result.banner[0]?.poster || global.imgall } }, { upload: conn.waUploadToServer }))
                                }),
                                body: proto.Message.InteractiveMessage.Body.create({
                                    text: bodyContent
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: global.wm
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    messageVersion: 1,
                                    buttons: [{
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify(listMessage) 
                                    }],
                                }),
                                contextInfo: { 
                                    mentionedJid: [m.sender],
                                    forwardingScore: 999,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: global.idch,
                                        serverMessageId: 143,
                                        newsletterName: `${global.namech} - Drama Station`
                                    }
                                }
                            })
                        }
                    }
                },
                { userJid: conn.user.id, quoted: m }
            );

            await conn.relayMessage(m.chat, msg.message, {
                messageId: msg.key.id,
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [{
                            tag: 'interactive',
                            attrs: { type: 'native_flow', v: '1' },
                            content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
                        }]
                    }
                ]
            });

            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error("DramaDash Engine List Error:", e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Proses gagal:* ${e.message || "Terjadi kesalahan pada sistem."}`);
        }
    }
};
