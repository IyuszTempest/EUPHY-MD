/**
 * Plugin: AI Image Upscaler (HD) 📸
 * Source: Pixelcut API
 */

const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = {
    command: ['hd'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        // Validasi: Harus berupa gambar (jpeg/jpg/png)
        if (!/image\/(jpe?g|png)/i.test(mime)) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Kirim atau *balas gambar* dengan perintah:\n*${usedPrefix + command}*`);
        }

        try {
            // Reaksi awal: Proses
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const media = await quoted.download();
            const ext = mime.split('/')[1] || 'png';
            const filename = `upscaled_${Date.now()}.${ext}`;

            const form = new FormData();
            form.append('image', media, { filename, contentType: mime });
            form.append('scale', '2'); // Kamu bisa ganti ke '4' kalau mau lebih gede (tapi lebih lama)

            const headers = {
                ...form.getHeaders(),
                'accept': 'application/json',
                'x-client-version': 'web',
                'x-locale': 'en'
            };

            const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
                method: 'POST',
                headers,
                body: form
            });

            // Pastikan respon oke
            if (!res.ok) throw new Error(`Server Pixelcut error: ${res.statusText}`);

            const json = await res.json();

            if (!json?.result_url || !json.result_url.startsWith('http')) {
                throw new Error('Gagal mendapatkan URL hasil dari Pixelcut.');
            }

            // Ambil buffer dari URL hasil
            const resultBuffer = await fetch(json.result_url).then(r => r.buffer());

            // Kirim hasil
            await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: `🌸 *H D  D O N E*`
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error("HD Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Upscaling gagal:* ${err.message || "Terjadi kesalahan sistem."}`);
        }
    }
};
