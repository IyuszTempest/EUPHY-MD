/**
 * Euphy-Bot - Fitur Info Cuaca
 * Mengambil data real-time dari API Siputzx (BMKG Data)
 */

const axios = require('axios');

module.exports = {
    command: ['cuaca'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`Masukan nama kota!\nContoh: *${usedPrefix + command} Pontianak*`);

        try {
            // Memanggil API dengan parameter 'q' sesuai hasil tes curl kamu
            const response = await axios.get(`https://api.siputzx.my.id/api/info/cuaca?q=${encodeURIComponent(text)}`);
            const res = response.data;

            if (!res.status) return m.reply(`Kota *${text}* gak ketemu di database BMKG. 🥲`);

            const data = res.data.weather[0];
            const lokasi = data.lokasi;
            const infoSekarang = data.cuaca[0][0]; // Mengambil ramalan jam terdekat

            let caption = `╭━━〔 ⛩️ *𝙸𝙽𝙵𝙾 𝙲𝚄𝙰𝙲𝙰* ⛩️ 〕━━┓\n`;
            caption += `┃ 🏮 *Wilayah:* ${lokasi.desa}, ${lokasi.kecamatan}\n`;
            caption += `┃ 📍 *Kota/Kab:* ${lokasi.kotkab}\n`;
            caption += `┃ 🗺️ *Provinsi:* ${lokasi.provinsi}\n`;
            caption += `┣━━━━━━━━━━━━━━━━━━━━┛\n`;
            caption += `┃ 🌡️ *Suhu:* ${infoSekarang.t}°C\n`;
            caption += `┃ ☁️ *Kondisi:* ${infoSekarang.weather_desc}\n`;
            caption += `┃ 💧 *Kelembapan:* ${infoSekarang.hu}%\n`;
            caption += `┃ 💨 *Angin:* ${infoSekarang.ws} km/jam (${infoSekarang.wd})\n`;
            caption += `┃ 🕒 *Waktu Lokal:* ${infoSekarang.local_datetime}\n`;
            caption += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            caption += `_Data real-time BMKG_`;

            // Kirim pesan beserta icon cuaca dari API jika ada
            await conn.sendMessage(m.chat, { 
                image: { url: infoSekarang.image }, 
                caption: caption 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`Aduh, ada error pas ngambil data cuaca: ${e.message}`);
        }
    }
};
