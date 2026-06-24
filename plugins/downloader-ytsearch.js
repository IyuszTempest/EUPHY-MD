/** * Plugin YouTube Search with List Selector 🎥⛩️
 * Style: Euphylia Magenta - "The King of UI" Style 🌸
 * Features: High-accuracy YT Search, Thumbnail Preview, Auto Command Chaining, and Download Shortcuts
 * Adopted from Kuroyami Menu Structure
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const yts = require('yt-search');

// --- [ HELPER: MENGAMBIL ID VIDEO YOUTUBE ] ---
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

module.exports = {
    command: ['ytsearch', 'yts', 'ytinfo'],
    category: 'downloader',
    noPrefix: true, 
    call: async (conn, m, { text, command, usedPrefix: _p }) => {
        try {
            if (!text) {
                return m.reply(`Mau cari lagu atau video apa?\nContoh: *${_p + command} Renai Circulation*`);
            }

            // --- MODE 1: DETAIL VIDEO & AUTOMATIC DOWNLOAD TRIGGER (Diketuk dari List) ---
            const ytId = getYouTubeId(text.trim());
            if (command === 'ytinfo' || ytId) {
                await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

                const targetId = ytId || text.trim();
                const video = await yts({ videoId: targetId });

                if (!video) {
                    return m.reply('> Aduh, gagal mengambil detail videonya. Coba cari judul lain ya!');
                }

                let media;
                // Mempersiapkan thumbnail video YouTube sebagai header image
                try {
                    const thumbnailUrl = video.thumbnail || video.image || global.imgall;
                    media = await prepareWAMessageMedia({ image: { url: thumbnailUrl } }, { upload: conn.waUploadToServer });
                } catch (mediaError) {
                    console.error("Gagal memproses thumbnail YT:", mediaError);
                    media = await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer });
                }

                // Desain Body Teks Detail Video
                let detailContent = `🎥 *${video.title}*\n\n`;
                detailContent += `👤 *Channel:* ${video.author.name}\n`;
                detailContent += `⏱️ *Durasi:* ${video.timestamp}\n`;
                detailContent += `👁️ *Views:* ${video.views.toLocaleString()} kali\n`;
                detailContent += `📅 *Rilis:* ${video.ago || 'N/A'}\n\n`;
                detailContent += `📝 *Deskripsi:*\n${video.description ? video.description.slice(0, 150) + '...' : 'Tidak ada deskripsi.'}`;

                // Membuat Pesan Interaktif Detail Video (CTA Watch on YT)
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
                                        title: 'Youtube Info',
                                        hasMediaAttachment: true,
                                        ...media
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: detailContent
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: global.wm
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        messageVersion: 1,
                                        buttons: [{
                                            name: "cta_url",
                                            buttonParamsJson: JSON.stringify({ 
                                                display_text: "Tonton di YouTube ⛩️", 
                                                url: video.url 
                                            })
                                        }]
                                    }),
                                    contextInfo: { 
                                        mentionedJid: [m.sender],
                                        forwardingScore: 999,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: global.idch,
                                            serverMessageId: 143,
                                            newsletterName: `${global.namech}`
                                        }
                                    }
                                })
                            }
                        }
                    },
                    { userJid: conn.user.id, quoted: m }
                );

                // Kirim pesan detail informasi video
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

                // --- [ PROSES AUTO-DOWNLOAD: LANGSUNG MANFAATKAN COMMAND INTERNAL BOT ] ---
                try {
                    // Beri reaksi unduh/loading
                    await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

                    // Bot otomatis mengetikkan perintah .ytmp3 untuk memicu plugin downloader lokal kamu
                    await conn.sendMessage(m.chat, {
                        text: `${_p}ytmp3 ${video.url}`
                    }, { quoted: m });

                } catch (audioError) {
                    console.error("Gagal memicu perintah ytmp3 otomatis:", audioError);
                }

                return await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });
            }


            // --- MODE 2: PENCARIAN UTAMA (Menampilkan List Select Button) ---
            await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

            const searchResults = await yts(text);
            const videos = searchResults.videos ? searchResults.videos.slice(0, 10) : [];

            if (videos.length === 0) {
                return m.reply('> Aduh, gak nemu video yang cocok. Coba pakai kata kunci lain!');
            }

            // Susun Baris List (Rows)
            let rows = [];
            videos.forEach((video, idx) => {
                rows.push({
                    header: '',
                    title: `${idx + 1}. ${video.title.slice(0, 35)}`,
                    description: `Durasi: ${video.timestamp} | Ch: ${video.author.name}`,
                    id: `${_p}ytinfo ${video.url}` // Menyimpan link video ke ID tombol yang akan memicu Mode 1 ketika ditekan
                });
            });

            let listMessage = {
                title: 'Buka Daftar Video 🎵',
                sections: [{
                    title: 'Hasil Pencarian YouTube',
                    highlight_label: 'Top Results',
                    rows: rows
                }]
            };

            // Format isi body teks daftar pencarian
            let searchContent = `┃ ⛩️ *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝚂𝙴𝙰𝚁𝙲𝙷*\n`;
            searchContent += `┃ ✨ *Query:* ${text}\n`;
            searchContent += `┃ 🏮 *Hasil:* ${videos.length} Video Teratas\n\n`;
            searchContent += `Halo @${m.sender.split`@`[0]}! Berikut adalah hasil pencarian video YouTube. Silakan klik tombol di bawah untuk memilih video, bot akan langsung mengirimkan detail info beserta audionya! 🌸`;

            // Gunakan thumbnail video pertama sebagai preview header list menu agar makin interaktif
            let headerMedia;
            try {
                const topVideoThumb = videos[0].thumbnail || videos[0].image || global.imgall;
                headerMedia = await prepareWAMessageMedia({ image: { url: topVideoThumb } }, { upload: conn.waUploadToServer });
            } catch (_) {
                headerMedia = await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer });
            }

            // Generate List Select Message
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
                                    title: 'Youtube Search',
                                    hasMediaAttachment: true,
                                    ...headerMedia
                                }),
                                body: proto.Message.InteractiveMessage.Body.create({
                                    text: searchContent
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
                                        newsletterName: `${global.namech}`
                                    }
                                }
                            })
                        }
                    }
                },
                { userJid: conn.user.id, quoted: m }
            );

            // Relay Message
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

            await conn.sendMessage(m.chat, { react: { text: "▶️", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`Error YT Search: ${e.message}`);
        }
    }
};
