/** * Euphy-Bot - Image HD / Upscaler
 * Fitur: Mengubah gambar menjadi kualitas tinggi (HD) menggunakan API IyuszTempest
 */

const axios = require('axios');
const { uploadImage } = require('../lib/uploadImage'); // Gunakan lib yang sudah kita perbaiki tadi

module.exports = {
    command: ['hd', 'upscale', 'remini'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        // Deteksi media dari reply atau kirim langsung
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        
        if (!/image/.test(mime)) return m.reply('Reply foto yang mau dibuat HD!');

        try {
            await conn.sendMessage(m.chat, { react: { text: "🪄", key: m.key } });
            
            // 1. Download gambar & upload ke Catbox untuk dapet link
            let media = await q.download();
            let imageUrl = await uploadImage(media);
            
            if (!imageUrl) return m.reply('Gagal mengupload gambar ke server sementara.');

            // 2. Panggil API HD milik Yus
            m.reply('_Sedang memproses kualitas HD..._');
            let hdApi = `https://iyusztempest.my.id/api/tools?feature=hd&query=${encodeURIComponent(imageUrl)}&apikey=$[global.apiyus]`;
            
            // 3. Kirim hasil gambar HD langsung ke user
            await conn.sendMessage(m.chat, { 
                image: { url: hdApi }, 
                caption: `✨ *Success!* Gambar kamu sudah HD sekarang!` 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`Error: ${e.message}. Pastikan API kamu di iyusztempest.my.id aktif!`);
        }
    }
};
