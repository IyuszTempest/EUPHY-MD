/** * Plugin Image to Anime Filter 🎨⛩️
 * Style: Euphylia Magenta - "The King of UI" Style 🌸
 * Features: High-quality Anime Transformation, Structured API Wrapper, Auto Media Detector, Custom Processing Reaction
 * Adopted from Kuroyami Menu Structure
 */

const { prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');

// --- [ HELPER: DOWNLOAD MEDIA BAILEYS DENGAN AMAN ] ---
async function downloadMediaMessage(m, conn) {
    let quoted = m.quoted ? m.quoted : m;
    let mime = (quoted.msg || quoted).mimetype || '';
    
    if (!mime) throw new Error('Media tidak ditemukan. Pastikan kamu mengirim atau membalas sebuah foto!');
    
    // Mencoba download menggunakan helper internal bawaan bot jika tersedia (.download)
    if (typeof quoted.download === 'function') {
        return await quoted.download();
    }
    
    // Jika tidak ada helper, gunakan downloader bawaan dari koneksi Baileys
    if (conn.downloadMediaMessage) {
        return await conn.downloadMediaMessage(quoted);
    }
    
    throw new Error('Sistem gagal mendownload gambar. Hubungi Owner bot!');
}

// --- [ STRUCTURED API WRAPPER: NEXAKU ANIME LABS ] ---
const nexakuAnime = {
    api: {
        base: 'https://api-nexaku.my.id',
        endpoint: '/transform/anime'
    },
    transform: async (mediaBuffer) => {
        const form = new FormData();
        form.append('file', mediaBuffer, {
            filename: 'anime_input.jpg',
            contentType: 'image/jpeg'
        });

        // Kirim request ke API Nexaku dengan tipe data arraybuffer agar fleksibel
        const response = await axios.post(nexakuAnime.api.base + nexakuAnime.api.endpoint, form, {
            headers: {
                ...form.getHeaders()
            },
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'] || '';

        if (contentType.includes('application/json')) {
            // Jika respon berupa JSON, konversi arraybuffer ke string lalu parse
            const jsonString = Buffer.from(response.data).toString('utf-8');
            const result = JSON.parse(jsonString);
            
            if (result.status && result.result) {
                return { type: 'url', data: result.result };
            } else if (result.url) {
                return { type: 'url', data: result.url };
            } else {
                throw new Error('Format JSON dari API tidak dikenali atau gagal memproses.');
            }
        } else if (contentType.includes('image')) {
            // Jika respon langsung berupa binary image, kembalikan buffernya
            return { type: 'buffer', data: Buffer.from(response.data) };
        } else {
            throw new Error('Respon dari server tidak valid (Bukan Gambar/JSON).');
        }
    }
};

module.exports = {
    command: ['toanime', 'jadianime'],
    category: 'ai',
    noPrefix: true, 
    call: async (conn, m, { text, command, usedPrefix: _p }) => {
        try {
            let quoted = m.quoted ? m.quoted : m;
            let mime = (quoted.msg || quoted).mimetype || '';
            
            if (!/image/.test(mime)) {
                return m.reply(`Kirim gambar atau balas foto yang ingin diubah menjadi anime dengan caption *${_p + command}* 🌸`);
            }

            // Beri reaksi proses (Sedang melukis / transforming)
            await conn.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });

            // Download media gambar menjadi buffer
            const mediaBuffer = await downloadMediaMessage(m, conn);
            
            // Eksekusi transformasi gambar lewat API Wrapper Nexaku
            const result = await nexakuAnime.transform(mediaBuffer);
            
            // Tentukan format image untuk dikirim balik (URL atau Buffer)
            const finalImage = result.type === 'url' ? { url: result.data } : result.data;

            // Kirim balik gambar anime dengan layout caption Euphylia Magenta Style 🌸 (Tanpa External Ad Reply)
            let successMessage = `> Done`;

            await conn.sendMessage(m.chat, {
                image: finalImage,
                caption: successMessage,
                contextInfo: {
                    mentionedJid: [m.sender]
                }
            }, { quoted: m });

            // Beri reaksi sukses
            return await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });

        } catch (e) {
            console.error(e);
            // Beri reaksi gagal jika terjadi error
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`> ⚠️ *Gagal mengubah gambar:* ${e.message || 'Terjadi kesalahan pada server API.'}`);
        }
    }
};
