/**
 * Euphy-Bot - TikTok DL (Fixed Path & Hybrid Audio) ✨
 */

const fetch = require('node-fetch');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// FIX PATH: Mundur satu folder buat nyari folder 'lib' di root
const { getRandom } = require('../lib/myfunc'); 

module.exports = {
    command: ['tt', 'tiktok'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        const isUrl = args[0] && args[0].match(/tiktok.com/gi);
        if (!isUrl) return;

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            const apikey = global.apiyus;
            const url = `https://iyusztempest.my.id/api/download?feature=tiktok&url=${args[0]}&apikey=${apikey}`;
            
            const response = await fetch(url);
            const res = await response.json();
            if (res.status !== "success") throw "Gagal ambil data API.";

            const { title, author, video, music } = res.result;

            // 1. KIRIM VIDEO
            if (video) {
                await conn.sendMessage(m.chat, { 
                    video: { url: video }, 
                    caption: `╭━━〔 ⛩️ *𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙻* ⛩️ 〕━━┓\n┃ 📝 *Title:* ${title || 'No Title'}\n┗━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: m });
            }

            // 2. LOGIKA AUDIO (HYBRID)
            if (music || video) {
                await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });
                
                let audioBuffer;
                
                if (music) {
                    audioBuffer = { url: music };
                } else {
                    // Pakai folder 'tmp' yang udah dibuat otomatis di index.js
                    const tmpFileIn = path.join(__dirname, `../tmp/${getRandom('.mp4')}`);
                    const tmpFileOut = path.join(__dirname, `../tmp/${getRandom('.mp3')}`);
                    
                    const videoRes = await fetch(video);
                    const buffer = await videoRes.buffer();
                    fs.writeFileSync(tmpFileIn, buffer);

                    // Extract Audio via FFMPEG (Size Kecil)
                    await new Promise((resolve, reject) => {
                        exec(`ffmpeg -i ${tmpFileIn} -vn -ab 128k -ar 44100 -y ${tmpFileOut}`, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });

                    audioBuffer = fs.readFileSync(tmpFileOut);
                    
                    // Cleanup
                    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
                    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut);
                }

                await conn.sendMessage(m.chat, { 
                    audio: audioBuffer, 
                    mimetype: 'audio/mpeg',
                    fileName: `${title || 'tiktok'}.mp3`,
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: music ? '𝚃𝙸𝙺𝚃𝙾𝙺 𝙼𝚄𝚂𝙸𝙲 🎶' : '𝚃𝙸𝙺𝚃𝙾𝙺 𝙰𝚄𝙳𝙸𝙾 (𝙴𝚇𝚃𝚁𝙰𝙲𝚃) 🎙️',
                            body: `By: ${author || 'Euphy System'}`,
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
            m.reply(`❌ *Error:* ${e.message}`);
        }
    }
};
                    
