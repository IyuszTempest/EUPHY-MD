/**
 * Euphy-Bot - TikTok DL (Hybrid Audio Extraction) ✨
 * Fitur: Auto-Convert MP4 to MP3 if Music URL is Missing
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['tt', 'tiktok'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        const isUrl = args[0] && args[0].match(/tiktok.com/gi);
        if (!isUrl) return; // Silent return biar gak ganggu chat biasa

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            const apikey = global.apiyus;
            const url = `https://iyusztempest.my.id/api/download?feature=tiktok&url=${args[0]}&apikey=${apikey}`;
            
            const response = await fetch(url);
            const res = await response.json();

            if (res.status !== "success") throw "Gagal ambil data dari API";

            const { title, author, video, music } = res.result;

            // 1. KIRIM VIDEO (Tetap kirim duluan)
            if (video) {
                await conn.sendMessage(m.chat, { 
                    video: { url: video }, 
                    caption: `╭━━〔 ⛩️ *𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙻* ⛩️ 〕━━┓\n┃ 📝 *Title:* ${title || 'No Title'}\n┃ 👤 *Author:* ${author || 'Unknown'}\n┗━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: m });
            }

            // 2. LOGIKA AUDIO (HYBRID SYSTEM)
            let audioSource = music || video; // Pakai musik kalau ada, kalau gak ada hajar videonya

            if (audioSource) {
                await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });

                await conn.sendMessage(m.chat, { 
                    audio: { url: audioSource }, 
                    mimetype: 'audio/mp4', // Baileys otomatis convert ke ogg/mp3 lewat ffmpeg internal
                    fileName: `${title || 'tiktok_audio'}.mp3`,
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: music ? '𝚃𝙸𝙺𝚃𝙾𝙺 𝙼𝚄𝚂𝙸𝙲 🎶' : '𝚃𝙸𝙺𝚃𝙾𝙺 𝙰𝚄𝙳𝙸𝙾 (𝙴𝚇𝚃𝚁𝙰𝙲𝚃) 🎙️',
                            body: `Milik: ${author || 'Euphy System'}`,
                            thumbnailUrl: global.imgall,
                            sourceUrl: args[0],
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
            }

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Sistem Euphy Error:* ${e.message || e}`);
        }
    }
};
