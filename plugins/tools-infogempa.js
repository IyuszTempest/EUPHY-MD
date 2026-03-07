/**
 * Euphy-Bot - Info Gempa Terkini BMKG ✨
 * API: ZiaUlhaq
 */

const axios = require('axios');

module.exports = {
    command: ['gempa'],
    category: 'info',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "🆘", key: m.key } });

            // Request ke API Info Gempa [cite: 2026-03-07]
            const apiUrl = `https://api.ziaul.my.id/api/info/gempa`;
            const response = await axios.get(apiUrl, {
                headers: { 'accept': '*/*' }
            });

            const res = response.data;
            if (!res.success || !res.result) throw "Gagal mengambil data gempa.";

            const { waktu, wilayah, magnitude, kedalaman, koordinat, dirasakan, potensi_tsunami, shakemap } = res.result;

            let capt = `╭━━〔 ⛩️ *𝙸𝙽𝙵𝙾 𝙶𝙴𝙼𝙿𝙰 𝚃𝙴𝚁𝙺𝙸𝙽𝙸* ⛩️ 〕━━┓\n`;
            capt += `┃ 📅 *Waktu:* ${waktu}\n`;
            capt += `┃ 📏 *Magnitude:* ${magnitude} SR\n`;
            capt += `┃ 📉 *Kedalaman:* ${kedalaman}\n`;
            capt += `┃ 📍 *Lokasi:* ${wilayah}\n`;
            capt += `┃ 🗺️ *Koordinat:* ${koordinat.lintang}, ${koordinat.bujur}\n`;
            capt += `┃ 📢 *Dirasakan:* ${dirasakan}\n`;
            capt += `┃ 🌊 *Tsunami:* ${potensi_tsunami}\n`;
            capt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            capt += `*Euphylia Magenta* - Tetap waspada dan hati-hati ya! ✨`;

            // Kirim pesan beserta Shakemap (peta guncangan) dari BMKG
            await conn.sendMessage(m.chat, { 
                image: { url: shakemap }, 
                caption: capt,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙱𝙼𝙺𝙶 𝙶𝙴𝙼𝙿𝙰 𝚁𝙴𝙿𝙾𝚁𝚃',
                        body: `Wilayah: ${wilayah}`,
                        thumbnailUrl: global.imgall,
                        sourceUrl: shakemap,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Euphy Error:* ${e.message || e}`);
        }
    }
};
