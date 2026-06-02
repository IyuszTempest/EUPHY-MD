/**
 * Plugin: Spotify Downloader (4 API Fallback) 🎧
 * Author: @alfat.syah
 * Fitur: Auto-switch API jika salah satu gagal.
 */

const axios = require('axios');

async function getSpotifyData(url) {
    const apis = [
        {
            name: 'Siputzx-v1',
            url: `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`,
            parse: r => ({
                title: r.title,
                artist: r.artist,
                cover: r.thumbnail,
                mp3: r.download_url
            })
        },
        {
            name: 'Siputzx-v2',
            url: `https://api.siputzx.my.id/api/d/spotifyv2?url=${encodeURIComponent(url)}`,
            parse: r => ({
                title: r.title,
                artist: r.artist,
                cover: r.coverImage,
                mp3: r.mp3DownloadLink
            })
        },
        
    for (let api of apis) {
        try {
            const res = await axios.get(api.url, { headers: { accept: '*/*' }, timeout: 10000 });
            const data = res.data?.data || res.data?.[api.resultKey] || res.data?.result; // Tambah fallback key [cite: 2026-04-28]
            
            if (!data) continue;

            const parsed = api.parse(data);
            if (parsed?.mp3) {
                return {
                    status: true,
                    source: api.name,
                    data: parsed
                };
            }
        } catch (e) {
            console.log(`[SPOTIFY-DL] ${api.name} Skip:`, e.message);
        }
    }

    return { status: false };
}

module.exports = {
    command: ['spotifydl'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`🚩 Mana link Spotify-nya?\nContoh: *${usedPrefix + command} https://open.spotify.com/track/...*`);

        // Fake contact biar keren [cite: 2026-04-28]
        const fkontak = {
            key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Spotify' },
            message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Spotify Downloader\nEND:VCARD` } }
        };

        await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });

        try {
            const result = await getSpotifyData(text);
            if (!result.status) return m.reply('❌ Waduh, semua jalur API Spotify lagi mogok. Coba lagi nanti ya!');

            const { title, artist, cover, mp3 } = result.data;

            const caption = `╭━━〔 🎧 *𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙳𝙻* 〕━━┓\n┃\n` +
                            `┣ 🎵 *Judul:* ${title}\n` +
                            `┣ 👤 *Artis:* ${artist}\n` +
                            `┣ 📦 *Source:* ${result.source}\n┃\n` +
                            `┗━━━━━━━━━━━━┛\n\n` +
                            `⏳ _Wait..._`;

            // Kirim Cover
            await conn.sendMessage(m.chat, { 
                image: { url: cover }, 
                caption, 
                quoted: fkontak 
            });

            // Kirim Audio
            await conn.sendMessage(m.chat, {
                audio: { url: mp3 },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Terjadi kesalahan: ${e.message}`);
        }
    }
};
