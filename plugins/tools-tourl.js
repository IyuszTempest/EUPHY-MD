/** * Plugin: Media to URL Uploader 📤⛩️
 * Deskripsi: Mengunggah media (gambar, video, atau audio) ke AliceeCDN.
 * Style: Clean & Minimalist ✨
 * Adopted to Euphylia Magenta Bot Structure
 */

const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    command: ['tourl', 'upload'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix: _p, command }) => {
        try {
            // 1. Deteksi Media (Quoted atau Media Baru)
            const targetMsg = m.quoted ? m.quoted : m;
            const mime = (targetMsg.msg || targetMsg).mimetype || '';

            if (!mime || !/image|video|audio/.test(mime)) {
                return m.reply(`> Kirim atau reply media (gambar/video/audio) dengan caption *${_p + command}*`);
            }

            // Berikan reaksi upload biar interaktif 📤
            await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } });
            await m.reply("> Sedang mengunduh dan mengunggah berkas ke CDN, mohon tunggu sebentar ya...");

            // 2. Download Buffer (Menggunakan metode download internal bot kamu)
            let mediaBuffer;
            try {
                mediaBuffer = await targetMsg.download();
            } catch (downloadError) {
                console.error("Gagal mendownload media:", downloadError);
                return m.reply("> Gagal mendownload media dari server WhatsApp!");
            }

            if (!mediaBuffer) {
                return m.reply("> Gagal memproses berkas media!");
            }

            // 3. Cek ukuran (Limit 10MB)
            const MAX_SIZE = 10 * 1024 * 1024;
            if (mediaBuffer.length > MAX_SIZE) {
                return m.reply("> File terlalu besar! Maksimal ukuran file adalah 10MB ya.");
            }

            // 4. Upload ke CDN Alicee
            const form = new FormData();
            const extension = mime.split('/')[1] || 'bin';
            const fileName = `${Date.now()}.${extension}`;
            
            form.append('cdnFile', mediaBuffer, {
                filename: fileName,
                contentType: mime,
            });

            const res = await axios.post('https://aliceecdn.vercel.app/upload', form, {
                headers: { 
                    ...form.getHeaders() 
                }
            });

            // 5. Kirim Hasil
            if (res.data && res.data.url) {
                let txt = `🌸 *UPLOAD SUCCESS* 🌸\n\n`;
                txt += `🔗 *URL:* ${res.data.url}\n`;
                txt += `📄 *File:* ${fileName}\n`;
                txt += `📏 *Size:* ${(mediaBuffer.length / 1024 / 1024).toFixed(2)} MB\n\n`;
                txt += `_Gunakan tautan di atas dengan bijak ya!_`;

                await m.reply(txt);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } else {
                throw new Error("Respon server CDN tidak valid.");
            }

        } catch (err) {
            console.error("Error in ToURL:", err);
            m.reply(`⚠️ Gagal mengunggah berkas: ${err.message}`);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
