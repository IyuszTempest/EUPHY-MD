/** * Plugin Google Drive Downloader 📂⛩️
 * Style: Euphylia Magenta - "The King of UI" Style 🌸
 * Features: High-speed GDrive Downloader, Smart File Type Detector, Structured API Wrapper
 * Adopted from Kuroyami Menu Structure
 */

const axios = require('axios');

function isGDriveLink(url) {
    return /drive\.google\.com\/(file\/d\/|open\?id=)([a-zA-Z0-9-_]+)/i.test(url);
}

const siputzxGDrive = {
    api: {
        base: 'https://api.siputzx.my.id',
        endpoint: '/api/d/gdrive' 
    },
    download: async (gdriveUrl) => {
        const response = await axios.get(`${siputzxGDrive.api.base}${siputzxGDrive.api.endpoint}?url=${encodeURIComponent(gdriveUrl)}`);
        
        if (response.data && response.data.status && response.data.data) {
            return response.data.data;
        } else {
            throw new Error('Gagal mendapatkan respon valid dari server API.');
        }
    }
};

module.exports = {
    command: ['gdrive', 'gdrivedl'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { text, command, usedPrefix: _p }) => {
        try {
            if (!text) {
                return m.reply(`Mana link Google Drive-nya? 🌸\nContoh: *${_p + command} https://drive.google.com/file/d/...*`);
            }

            const targetUrl = text.trim();
            if (!isGDriveLink(targetUrl)) {
                return m.reply('> ❌ Format link Google Drive tidak valid! Pastikan linknya benar ya.');
            }

            // Beri reaksi proses download sedang berlangsung
            await conn.sendMessage(m.chat, { react: { text: "⚙️", key: m.key } });

            // Panggil API Wrapper terbaru untuk mendapatkan data file
            const fileData = await siputzxGDrive.download(targetUrl);
            const downloadUrl = fileData.download;
            const fileName = fileData.name || 'GDrive_File';

            // Mengirim info proses pengiriman file dengan layout premium
            let infoMessage = `┃ ⛩ *𝙶𝙳𝚁𝙸𝚅𝙴 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n`;
            infoMessage += `┃ 📦 *Nama:* ${fileName}\n`;
            infoMessage += `┃ ✨ *Request by:* @${m.sender.split`@`[0]}\n\n`;

            await conn.sendMessage(m.chat, {
                text: infoMessage,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

            const isVideo = /\.(mp4|mkv|mov|avi|3gp)/i.test(fileName) || /VID/i.test(fileName);

            if (isVideo) {
                // Jika terdeteksi video, kirim sebagai video
                await conn.sendMessage(m.chat, {
                    video: { url: downloadUrl },
                    caption: `> ✅ *Success Download:* ${fileName}`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, {
                    document: { url: downloadUrl },
                    fileName: fileName,
                    mimetype: 'application/octet-stream',
                    caption: `> ✅ *Success Download:* ${fileName}`
                }, { quoted: m });
            }

            // Beri reaksi sukses penuh
            return await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });

        } catch (e) {
            console.error(e);
            // Reaksi jika error terjadi
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            m.reply(`> ⚠️ *Gagal mendownload file:* ${e.message || 'Terjadi kesalahan pada server API.'}`);
        }
    }
};
