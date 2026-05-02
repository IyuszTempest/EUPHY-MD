/**
 * Plugin: YouTube Audio to Channel (PTT Mode) 🎵📢
 * Fitur: Mencari/mendownload lagu dari YT dan mengirimnya ke Saluran sebagai VN.
 */

const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

function isYoutubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

module.exports = {
    command: ['playch'],
    category: 'owner',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        // Hanya untuk owner karena mengirim ke channel/newsletter
        if (!m.isOwner) return m.reply("Fitur ini khusus Owner!");

        if (!text) return m.reply(`Contoh penggunaan:\n${usedPrefix + command} swim chase atlantic`);

        // Ganti dengan ID Newsletter / Saluran kamu
        const idSaluran = '120363403952337689@newsletter';

        let tempInput, tempOutput;

        try {
            await m.reply('✨ _Sedang memproses audio, tunggu sebentar..._');

            let v;
            if (isYoutubeUrl(text)) {
                const videoId = text.split('v=')[1] || text.split('/').pop();
                v = await yts({ videoId });
            } else {
                const search = await yts(text);
                v = search.videos[0];
            }

            if (!v) throw 'Lagu tidak ditemukan.';

            // Download via API
            const api = `https://api.nexray.web.id/downloader/ytmp3?url=${encodeURIComponent(v.url)}`;
            const { data } = await axios.get(api);

            if (!data.status) throw 'Audio tidak ditemukan di server downloader.';

            const audioUrl = data.result.url;
            const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' });

            // Setup temporary files
            tempInput = path.join(os.tmpdir(), `${Date.now()}_input.mp3`);
            tempOutput = path.join(os.tmpdir(), `${Date.now()}_output.opus`);

            fs.writeFileSync(tempInput, Buffer.from(audioRes.data));

            // Proses konversi ke Opus menggunakan FFmpeg
            await new Promise((resolve, reject) => {
                const ffmpeg = spawn('ffmpeg', [
                    '-i', tempInput,
                    '-map_metadata', '-1',
                    '-vn',
                    '-ac', '1',
                    '-ar', '48000',
                    '-c:a', 'libopus',
                    '-b:a', '128k',
                    '-y',
                    tempOutput
                ]);

                let stderr = '';
                ffmpeg.stderr.on('data', d => stderr += d.toString());
                ffmpeg.on('close', code => {
                    if (code === 0) resolve();
                    else reject(new Error(stderr));
                });
            });

            const opusBuffer = fs.readFileSync(tempOutput);

            const newsletterInfo = {
                newsletterJid: idSaluran,
                serverMessageId: 100
            };

            // Kirim ke Saluran
            await conn.sendMessage(idSaluran, {
                audio: opusBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: false,
                    forwardedNewsletterMessageInfo: newsletterInfo,
                    externalAdReply: {
                        title: v.title,
                        body: v.author.name,
                        thumbnailUrl: v.thumbnail,
                        sourceUrl: v.url,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        showAdAttribution: false
                    }
                }
            }, { quoted: null });

            await m.reply(`✅ *Berhasil!* Audio telah dikirim ke saluran.\n\n📌 *Judul:* ${v.title}`);

        } catch (e) {
            console.error(e);
            m.reply('❌ Gagal memproses audio. Pastikan FFmpeg terinstal dan API aktif.');
        } finally {
            // Bersih-bersih file temp
            if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            if (tempOutput && fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
        }
    }
};
