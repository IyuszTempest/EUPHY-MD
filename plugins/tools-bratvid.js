/**
 * Euphy-Bot - Brat Video Generator ✨
 * Trigger: .bratvid <teks>
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getRandom } = require('../lib/myfunc'); // Pake fungsi getRandom yang udah kita benerin tadi [cite: 2026-03-01]

module.exports = {
    command: ['bratvid', 'bratvideo'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        // Cek input teks [cite: 2025-05-24]
        if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} Halo, lagi apa?`);

        try {
            await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

            // Path temporary buat simpen video sebelum dikirim
            const tmpFile = path.join(__dirname, `../tmp/${getRandom('.mp4')}`);
            
            // Request ke API ZiaUlhaq
            const apiUrl = `https://api.ziaul.my.id/api/generator/bratvid?text=${encodeURIComponent(text)}`;
            
            const response = await axios({
                method: 'get',
                url: apiUrl,
                responseType: 'arraybuffer',
                headers: { 'accept': '*/*' }
            });

            // Tulis buffer ke file fisik di folder tmp
            fs.writeFileSync(tmpFile, response.data);

            // Kirim sebagai video estetik khas Euphylia Magenta
            await conn.sendMessage(m.chat, { 
                video: fs.readFileSync(tmpFile),
                caption: `🏮 *BRAT VIDEO GENERATED* 🏮\n\n_"${text}"_\n\nSpecial for: *Yus* ✨`,
                mimetype: 'video/mp4',
                gifPlayback: false // Set true kalau mau jadi GIF otomatis
            }, { quoted: m });

            // Hapus sampah biar Lunes Host gak penuh
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`Aduh, sistem Brat Euphy lagi error: ${e.message}`);
        }
    }
};
