/**
 * Plugin: Anime Character Birthdays Tracker 🎂📅
 * Deskripsi: Menampilkan daftar ulang tahun karakter anime berdasarkan bulan via Theresav API.
 * Style: Clean, Aesthetic & Informative ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['ultahanime'],
    category: 'anime',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        const monthsMap = {
            januari: 'January', january: 'January', jan: 'January',
            februari: 'February', february: 'February', feb: 'February',
            maret: 'March', march: 'March', mar: 'March',
            april: 'April', apr: 'April',
            mei: 'May', may: 'May',
            juni: 'June', june: 'June', jun: 'June',
            juli: 'July', july: 'July', jul: 'July',
            agustus: 'August', august: 'August', ags: 'August', aug: 'August',
            september: 'September', sep: 'September',
            oktober: 'October', october: 'October', okt: 'October', oct: 'October',
            november: 'November', nov: 'November',
            desember: 'December', december: 'December', des: 'December', dec: 'December'
        };

        const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
        let targetMonth = currentMonthName;

        if (text) {
            const inputMonth = text.trim().toLowerCase();
            if (monthsMap[inputMonth]) {
                targetMonth = monthsMap[inputMonth];
            } else {
                await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
                return m.reply(`❌ Bulan *"${text}"* tidak valid!\nContoh: \`${usedPrefix + command} June\` atau \`${usedPrefix + command} Juni\``);
            }
        }

        await conn.sendMessage(m.chat, { react: { text: '🎂', key: m.key } });

        try {
            const res = await fetch(`https://api.theresav.biz.id/anime/acdb/birthdays?month=${targetMonth}&apikey=${global.thrsavapi}`);
            
            if (!res.ok) throw new Error(`Server API Error: ${res.status} ${res.statusText}`);
            
            const json = await res.json();

            if (!json.status || !json.data || !json.data.birthdays || json.data.birthdays.length === 0) {
                throw new Error(`Gagal memuat data ulang tahun untuk bulan ${targetMonth}.`);
            }

            const data = json.data;
            
            let responseText = `📅 *ANIME CHARACTER BIRTHDAYS - ${data.month.toUpperCase()}* 📅\n`;
            responseText += `✨ Total Karakter: ${data.total}\n\n`;

            data.birthdays.forEach(char => {
                responseText += `▪️ *Tanggal ${char.day}* | *${char.name}*\n`;
                responseText += `   └ 🎬 Anime: _${char.anime}_\n\n`;
            });

            responseText += `🌸 _Jangan lupa ucapkan selamat ulang tahun ke husbu/waifu-mu ya!_`;

            await conn.sendMessage(m.chat, {
                text: responseText.trim(),
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: global.namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '🎉', key: m.key } });

        } catch (e) {
            console.error("Anime Birthdays API Error:", e);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Proses gagal:* ${e.message || "Terjadi kesalahan pada sistem database ulang tahun anime."}`);
        }
    }
};
