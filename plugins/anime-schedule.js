/**
 * Anime Schedule Plugin 📅
 * Powered by Jikan API (MyAnimeList)
 */

const axios = require('axios');

module.exports = {
    command: ['jadwalanime', 'animeschedule'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        m.reply('_Sedang mengambil jadwal tayang hari ini..._ ⏳');

        try {
            // Mengambil hari ini dalam bahasa Inggris untuk API
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const today = days[new Date().getDay()];

            const res = await axios.get(`https://api.jikan.moe/v4/schedules?filter=${today}`);
            const data = res.data.data;

            if (!data || data.length === 0) return m.reply(`Tidak ada jadwal anime untuk hari ini (${today}).`);

            let teks = `*📅 JADWAL ANIME HARI INI (${today.toUpperCase()}) 📅*\n`;
            teks += `_Waktu rilis mungkin berbeda tergantung zona waktu (JST)._\n\n`;

            data.forEach((anime, i) => {
                const title = anime.title_english || anime.title;
                const time = anime.broadcast.time || '--:--';
                const score = anime.score ? `⭐ ${anime.score}` : '??';
                
                teks += `*${i + 1}. ${title}*\n`;
                teks += `⌚ *Jam:* ${time} JST\n`;
                teks += `🌟 *Score:* ${score}\n`;
                teks += `🔗 *Link:* ${anime.url}\n`;
                teks += `--------------------------\n`;
            });

            teks += `\n*Tips:* Gunakan \`${usedPrefix}anime judul\` untuk detail lebih lengkap!`;

            // Kirim pesan dengan thumbnail anime pertama biar keren
            await conn.sendMessage(m.chat, { 
                image: { url: data[0].images.jpg.large_image_url }, 
                caption: teks 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply('❌ Gagal mengambil jadwal. API sedang sibuk atau limit, coba lagi nanti ya!');
        }
    }
};
