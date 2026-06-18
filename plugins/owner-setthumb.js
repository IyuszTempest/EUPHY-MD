/**
 * Plugin: Set Bot Thumbnail 🖼️
 * Fitur: Mengganti thumbnail bot secara permanen ke config.js
 */

const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function uploadToCDN(buffer) {
    try {
        const form = new FormData();
        form.append('file', buffer, 'thumbnail.jpg');
        const { data } = await axios.post('https://cdn.nekohime.site/upload', form, {
            headers: form.getHeaders()
        });
        return data?.files?.[0]?.url || data?.files?.[0] || null;
    } catch {
        return null;
    }
}

module.exports = {
    command: ['setthumb'],
    category: 'owner',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        // Validasi input gambar
        if (!mime.startsWith('image/')) {
            return m.reply(`Reply atau kirim gambar untuk dijadikan thumbnail bot.`);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        try {
            let img = await q.download();
            if (!img) throw 'Gagal mengunduh gambar.';

            // 1. Simpan file fisik sebagai cadangan
            fs.writeFileSync('./thumbnail.jpg', img);

            // 2. Upload ke CDN untuk mendapatkan URL untuk global.imgall
            let url = await uploadToCDN(img);
            if (!url) throw 'Gagal mendapatkan URL gambar dari CDN.';

            // 3. Update config.js secara otomatis
            let configPath = './config.js';
            if (fs.existsSync(configPath)) {
                let configContent = fs.readFileSync(configPath, 'utf-8');
                
                // Mencari dan mengganti nilai global.imgall
                const regex = /global\.imgall\s*=\s*['"][^'"]*['"]/g;
                if (regex.test(configContent)) {
                    const newConfig = configContent.replace(regex, `global.imgall = '${url}'`);
                    fs.writeFileSync(configPath, newConfig);
                } else {
                    // Jika tidak ditemukan, tambahkan di baris baru
                    fs.appendFileSync(configPath, `\nglobal.imgall = '${url}'`);
                }
            }

            await conn.sendMessage(m.chat, {
                image: img,
                caption: `✅ *Thumbnail Berhasil Diperbarui*\n\n🖼️ *URL Baru:* ${url}\n\n_Catatan: Jika belum berubah, silakan restart bot di panel._`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ Terjadi kesalahan: ${e}`);
        }
    }
};
