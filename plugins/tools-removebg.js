/**
 * Remove Background Plugin 🖼️
 * Auto-convert to Unified Plugin Format
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

module.exports = {
    command: ['removebg'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        try {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';
            
            if (!/image/.test(mime)) return m.reply(`Mana gambarnya? Kirim/reply foto dengan caption \`${usedPrefix + command}\``);

            m.reply('_Sedang memproses... Tunggu bentar ya!_ ⏳');

            // Setup folder temporary
            let tmp = './tmp';
            if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
            
            let filePath = path.join(tmp, `${Date.now()}.jpg`);
            let buffer = await q.download();
            fs.writeFileSync(filePath, buffer);

            // Siapkan Form Data buat dikirim ke API Abella
            let form = new FormData();
            form.append('image', fs.createReadStream(filePath));

            let { data } = await axios.post('https://www.abella.icu/removal-bg', form, { 
                headers: {
                    ...form.getHeaders()
                }
            });

            let url = data?.data?.previewUrl;

            if (url) {
                // Kirim hasil sebagai gambar
                await conn.sendMessage(m.chat, { 
                    image: { url }, 
                    caption: '✅ Background berhasil dihapus!' 
                }, { quoted: m });
            } else {
                m.reply('❌ Gagal memproses gambar. API mungkin sedang down.');
            }

            // Hapus file sampah di lokal setelah selesai
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Error:* ${e.message}`);
        }
    }
};
