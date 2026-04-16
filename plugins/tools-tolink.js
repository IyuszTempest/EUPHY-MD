/**
 * Plugin: Kabox Uploader 🚀
 */
const fetch = require('node-fetch');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

module.exports = {
    command: ['tolink', 'tourl'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        
        if (!mime) return m.reply(`Kirim atau reply media (gambar/video/stiker) dengan perintah *${usedPrefix + command}*`);

        await m.reply('Sedang mengunggah ke Kabox... ⏳');

        try {
            let media = await q.download();
            let { ext } = await fromBuffer(media);
            
            // Persiapkan Form Data untuk API kabox
            let form = new FormData();
            form.append('file', media, {
                filename: `upload-${Date.now()}.${ext}`,
                contentType: mime
            });

            // Eksekusi POST ke API
            let res = await fetch('https://api.kabox.my.id/api/upload', {
                method: 'POST',
                headers: {
                    'x-expire': '1d', // Expire dalam 1 hari sesuai curl kamu
                    ...form.getHeaders()
                },
                body: form
            });

            let json = await res.json();

            if (json.success) {
                let teks = `✅ *UPLOAD BERHASIL*\n\n`;
                teks += `┣ 📄 *NAMA:* ${json.metadata.original_name}\n`;
                teks += `┣ ⚖️ *SIZE:* ${json.metadata.size_formatted}\n`;
                teks += `┣ 🔗 *URL:* ${json.url}\n\n`;
                teks += `*Note:* File akan kadaluarsa dalam 1 hari.`;
                
                return m.reply(teks);
            } else {
                throw new Error('Upload gagal');
            }

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat mengunggah file. Pastikan server API sedang aktif!');
        }
    }
};
