/**
 * Euphy-Bot - TikTok DL (Scraper TMate Edition) ✨
 * Support: Video No WM, Audio, & Photo Slides
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getRandom } = require('../lib/myfunc'); 

const handleTikTok = async (tiktokUrl) => {
    try {
        const initialRes = await axios.get('https://tmate.cc/id', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const cookie = initialRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
        const tokenMatch = initialRes.data.match(/<input[^>]+name="token"[^>]+value="([^"]+)"/i);
        const token = tokenMatch?.[1];

        if (!token) throw new Error('Gagal ambil token TMate');

        const params = new URLSearchParams();
        params.append('url', tiktokUrl);
        params.append('token', token);

        const res = await axios.post('https://tmate.cc/action', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://tmate.cc/id',
                'Cookie': cookie
            }
        });

        const html = res.data?.data;
        if (!html) throw new Error('Data TikTok tidak ditemukan');

        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Tanpa Judul';

        const matches = [...html.matchAll(/<a[^>]+href="(https:\/\/[^"]+)"[^>]*>\s*<span>\s*<span>([^<]*)<\/span><\/span><\/a>/gi)];
        const links = matches.map(([_, href, label]) => ({ href, label: label.trim() }));

        const video = links.find(v => /download without watermark/i.test(v.label))?.href;
        const audio = links.find(v => /download mp3 audio/i.test(v.label))?.href;
        
        const imageMatches = [...html.matchAll(/<img[^>]+src="(https:\/\/tikcdn\.app\/a\/images\/[^"]+)"/gi)];
        const images = [...new Set(imageMatches.map(m => m[1]))];

        return {
            status: "success",
            result: {
                type: images.length > 0 ? 'image' : 'video',
                title,
                video: video || null,
                audio: audio || null,
                images: images.length > 0 ? images : null
            }
        };
    } catch (error) {
        throw new Error(`Scraper Error: ${error.message}`);
    }
};

module.exports = {
    command: ['tt', 'tiktok'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args }) => {
        if (!args[0] || !args[0].match(/tiktok.com/gi)) return m.reply("Mana link TikTok-nya?");

        try {
            await conn.sendMessage(m.chat, { react: { text: "🙎🏻", key: m.key } });

            const data = await handleTikTok(args[0]);
            const { type, title, video, audio, images } = data.result;

            // --- 1. LOGIKA JIKA TIKTOK SLIDE (FOTO) ---
            if (type === 'image' && images) {
                for (let img of images) {
                    await conn.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
                }
                await m.reply(`> Berhasil kirim *${images.length}* foto slide.`);
            } 
            
            // --- 2. LOGIKA JIKA VIDEO ---
            else if (video) {
                await conn.sendMessage(m.chat, {
                    video: { url: video },
                    caption: `> ${title}`,
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: idch,
                            newsletterName: namech,
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            } // <-- SEBELUMNYA KURANG TUTUP KURUNG KURAWAL DI SINI!

            // --- 3. KIRIM AUDIO (DARI SCRAPE LANGSUNG) ---
            if (audio) {
                await conn.sendMessage(m.chat, { 
                    audio: { url: audio }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`,
                }, { quoted: m });
            }

            await conn.sendMessage(m.chat, { react: { text: "😁", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`> Gagal: ${e.message}`);
        }
    }
};
