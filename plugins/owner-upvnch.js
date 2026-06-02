/**
 * Plugin: Upload VN/Audio to Channel (Newsletter) 🎤📢
 * Fitur: Mengonversi audio ke format Opus dan mengirimnya sebagai VN ke Saluran.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

module.exports = {
    command: ['upchvn'],
    category: 'owner',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {

        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!/audio/.test(mime)) return m.reply(`Reply VN atau audio yang ingin dikirim ke saluran.`);

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // Ganti dengan ID Newsletter / Saluran tujuan
        const idSaluran = global.idch;
        
        const tempInput = path.join(os.tmpdir(), `${Date.now()}_input`);
        const tempOutput = path.join(os.tmpdir(), `${Date.now()}_output.ogg`);

        try {
            let media = await q.download();
            if (!media) throw 'Gagal mengunduh media.';

            fs.writeFileSync(tempInput, media);

            // Proses konversi menggunakan FFmpeg
            await new Promise((resolve, reject) => {
                exec(
                    `ffmpeg -y -i "${tempInput}" -map_metadata -1 -vn -ac 1 -ar 48000 -c:a libopus -b:a 128k "${tempOutput}"`,
                    err => err ? reject(err) : resolve()
                );
            });

            const audioData = fs.readFileSync(tempOutput);

            // Mengirim ke Saluran sebagai Voice Note (PTT)
            await conn.sendMessage(idSaluran, {
                audio: audioData,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: idch,
                        newsletterName: namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

            await m.reply('✅ Berhasil dikirim ke saluran.');
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('❌ Gagal memproses atau mengirim audio ke saluran.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        } finally {
            // Pembersihan file temporary
            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
        }
    }
};
