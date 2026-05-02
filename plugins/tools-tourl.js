/**
 * Plugin: ToURL (File Uploader) ☁️
 * Fitur: Mengunggah file/media ke CDN dan memberikan link publik.
 */

const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    command: ['tourl'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        // Pengecekan database user
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        // Validasi input media
        if (!mime) return m.reply('✨ Reply atau kirim file yang ingin diunggah.');

        try {
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

            // Proses download media dari WhatsApp
            let buffer = await q.download();
            if (!buffer) throw 'Gagal mengunduh media.';

            let ext = mime.split('/')[1] || 'bin';
            let filename = `upload_${Date.now()}.${ext}`;

            // Persiapan form data untuk upload
            const form = new FormData();
            form.append('file', buffer, filename);

            // Pengiriman ke server CDN
            const { data } = await axios.post(
                'https://cdn.nekohime.site/upload',
                form,
                { headers: form.getHeaders() }
            );

            // Validasi respon server
            if (!data?.files?.length) throw 'Proses unggah ke server gagal.';

            let url = data.files[0].url || data.files[0];

            // Mengirimkan hasil link ke chat
            await conn.sendMessage(
                m.chat,
                {
                    text: `╭━━〔 ☁️ *𝚄𝙿𝙻𝙾𝙰𝙳 𝚂𝚄𝙲𝙲𝙴𝚂𝚂* 〕━━┓\n┃\n` +
                          `┣ ✨ *URL:* ${url}\n┃\n` +
                          `┗━━━━━━━━━━━━━━━━┛`
                },
                { quoted: m }
            );

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('✨ Terjadi kesalahan saat memproses unggahan.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
