/** * Plugin Image to Chibi Filter 🎨⛩️
 * Style: Euphylia Magenta - "The King of UI" Style 🌸
 * Features: Transform Image to Chibi, Auto Media Uploader, Structured API Wrapper
 * Adopted from Kuroyami Menu Structure
 */

const axios = require('axios');
const FormData = require('form-data');

// --- [ HELPER: DOWNLOAD MEDIA BAILEYS ] ---
async function downloadMediaMessage(m, conn) {
    let quoted = m.quoted ? m.quoted : m;
    let mime = (quoted.msg || quoted).mimetype || '';
    
    if (!mime) throw new Error('Media tidak ditemukan. Pastikan kamu mengirim atau membalas sebuah foto!');
    
    if (typeof quoted.download === 'function') {
        return await quoted.download();
    }
    
    if (conn.downloadMediaMessage) {
        return await conn.downloadMediaMessage(quoted);
    }
    
    throw new Error('Sistem gagal mendownload gambar.');
}

// --- [ HELPER: UPLOAD FILE KE CATBOX ] ---
async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, {
        filename: 'chibi_input.jpg',
        contentType: 'image/jpeg'
    });

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders()
    });
    
    return res.data.trim(); // Mengembalikan direct URL gambar
}

// --- [ STRUCTURED API WRAPPER: NEXRAY CHIBI ] ---
const nexrayChibi = {
    api: {
        base: 'https://api.nexray.eu.cc',
        endpoint: '/ephoto/chibi'
    },
    transform: async (imageUrl) => {
        const response = await axios.get(`${nexrayChibi.api.base}${nexrayChibi.api.endpoint}?url=${encodeURIComponent(imageUrl)}`, {
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'] || '';

        if (contentType.includes('application/json')) {
            const jsonString = Buffer.from(response.data).toString('utf-8');
            const result = JSON.parse(jsonString);
            
            if (result.status && result.result) {
                return { type: 'url', data: result.result };
            } else if (result.url) {
                return { type: 'url', data: result.url };
            } else {
                throw new Error('Format respon API tidak dikenali.');
            }
        } else if (contentType.includes('image')) {
            return { type: 'buffer', data: Buffer.from(response.data) };
        } else {
            throw new Error('Respon dari server tidak valid (Bukan Gambar/JSON).');
        }
    }
};

module.exports = {
    command: ['tochibi'],
    category: 'ai',
    noPrefix: true,
    call: async (conn, m, { text, command, usedPrefix: _p }) => {
        try {
            let quoted = m.quoted ? m.quoted : m;
            let mime = (quoted.msg || quoted).mimetype || '';

            if (!/image/.test(mime)) {
                return m.reply(`Kirim gambar atau balas foto yang ingin diubah menjadi chibi dengan caption *${_p + command}* 🌸`);
            }

            // Beri reaksi proses berlangsung
            await conn.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });

            // 1. Download gambar dari chat
            const mediaBuffer = await downloadMediaMessage(m, conn);

            // 2. Upload gambar ke Catbox untuk mendapatkan URL publik
            const uploadedUrl = await uploadToCatbox(mediaBuffer);

            // 3. Kirim URL ke API Nexray
            const result = await nexrayChibi.transform(uploadedUrl);
            const finalImage = result.type === 'url' ? { url: result.data } : result.data;

            // Layout caption premium & minimalis
            let successMessage = `> Done`;

            // Kirim gambar kembali ke user tanpa ad-reply tambahan
            await conn.sendMessage(m.chat, {
                image: finalImage,
                caption: successMessage,
                contextInfo: {
                    mentionedJid: [m.sender]
                }
            }, { quoted: m });

            return await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`> ⚠️ *Gagal mengubah gambar:* ${e.message || 'Terjadi kesalahan pada server API.'}`);
        }
    }
};
