/** * Euphy-Bot - Image HD / Upscaler
 * Fitur: Mengubah gambar menjadi kualitas tinggi (HD) via API IyuszTempest
 */

const axios = require('axios');
const { uploadImage } = require('../lib/uploadImage');

module.exports = {
    command: ['hd', 'upscale'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        
        if (!/image/.test(mime)) return m.reply('Reply foto yang mau dibuat HD! 🏮');

        try {
            await conn.sendMessage(m.chat, { react: { text: "🪄", key: m.key } });
            
            // 1. Ubah gambar jadi URL dulu lewat Catbox
            let media = await q.download();
            let imageUrl = await uploadImage(media);
            
            if (!imageUrl) return m.reply('Gagal mengupload gambar ke server uploader.');

            m.reply('_Sedang memproses kualitas HD..._');

            // 2. Panggil API kamu. Kita set responseType 'arraybuffer' supaya dapet datanya langsung
            const response = await axios.get(`https://iyusztempest.my.id/api/tools?feature=hd&query=${encodeURIComponent(imageUrl)}&apikey=${global.apiyus}`, {
                responseType: 'arraybuffer'
            });

            // 3. Kirim hasilnya langsung sebagai gambar
            await conn.sendMessage(m.chat, { 
                image: response.data, 
                caption: `✨ *Success!* Gambar sudah di-upscale x4! [cite: 2025-05-24]` 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            // Menampilkan error 403 atau error lainnya secara spesifik
            m.reply(`⚠️ Error: ${e.message}\nKemungkinan API sedang limit atau proteksi server aktif.`);
        }
    }
};
