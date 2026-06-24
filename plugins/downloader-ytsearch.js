/** * Plugin YouTube Search with List Selector 🎥⛩️
 * Style: Euphylia Magenta - "The King of UI" Style 🌸
 * Features: High-accuracy YT Search, Thumbnail Preview, Info Card, and Direct Audio Sender
 * Adopted from Kuroyami Menu Structure
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const yts = require('yt-search');
const axios = require('axios');

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
                return m.reply(`Mau cari apa?\nContoh: *${_p + command} Renai Circulation*`);
            }

            // --- MODE 1: DETAIL VIDEO + AUDIO SENDER (Diketuk dari List Selector) ---
            const ytId = getYouTubeId(text.trim());
            if (command === 'ytinfo' || ytId) {
                await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

                const targetId = ytId || text.trim();
                const videoUrl = ytId ? `https://www.youtube.com/watch?v=${targetId}` : targetId;
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
                detailContent += `✨ _Aku sedang memproses pengiriman audionya, mohon tunggu..._`;

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
                                        title: 'Youtube Info & Player',
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

                // --- [ PROSES DIRECT AUDIO SENDER ] ---
                await conn.sendMessage(m.chat, { react: { text: '🎶', key: m.key } });

                try {
                    const res = await axios.get(
                        `https://neotex.my.id/download/ytplay?q=${encodeURIComponent(videoUrl)}`,
                        { timeout: 30000 }
                    );

                    if (!res.data?.status || !res.data?.result) throw new Error("Gagal mengambil data dari API.");

                    const data = res.data.result;
                    const audioUrl = data.download?.audio;

                    if (!audioUrl) throw new Error("Audio tidak ditemukan.");

                    // Mengirimkan audio langsung di bawah teks detail info
                    await conn.sendMessage(m.chat, {
                        audio: { url: audioUrl },
                        mimetype: "audio/mp4",
                        fileName: `${video.title}.mp3`
                    }, { quoted: m });

                    return await conn.sendMessage(m.chat, { react: { text: '👍🏻', key: m.key } });

                } catch (audioErr) {
                    console.error("Gagal mengirim audio otomatis:", audioErr);
                    await conn.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
                    return m.reply(`> Gagal mengirim audio otomatis. Server Neotex sedang sibuk atau link bermasalah.`);
                }
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
                    id: `${_p}ytinfo ${video.url}`
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

            let headerMedia;
            try {
                const topVideoThumb = videos[0].thumbnail || videos[0].image || global.imgall;
                headerMedia = await prepareWAMessageMedia({ image: { url: topVideoThumb } }, { upload: conn.waUploadToServer });
            } catch (_) {
                headerMedia = await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer });
            }

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
