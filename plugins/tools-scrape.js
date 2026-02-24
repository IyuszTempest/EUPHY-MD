/**
 * Euphy-Bot - Super Scraper V2.0 (File Output)
 * Fitur: Mengirim hasil JSON/Raw Data dalam bentuk file agar rapi
 */

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    command: ['scrape'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        if (!text) return m.reply('Masukan URL-nya! Contoh: .scrape https://api.github.com/users/IyuszTempest');
        
        try {
            m.reply('_Euphy lagi bedah datanya... 🛠️_');
            
            const res = await axios.get(text, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
                },
                timeout: 10000
            });

            // 1. LOGIKA JIKA DATA ADALAH JSON
            if (typeof res.data === 'object') {
                let jsonResult = JSON.stringify(res.data, null, 2);
                let fileName = `scrape_${Date.now()}.json`;
                
                return conn.sendMessage(m.chat, {
                    document: Buffer.from(jsonResult),
                    mimetype: 'application/json',
                    fileName: fileName,
                    caption: `╭━━〔 📊 *𝙹𝚂𝙾𝙽 𝙳𝚄𝙼𝙿* 〕━━┓\n┃ 🔗 *𝚄𝚁𝙻:* ${text}\n┗━━━━━━━━━━━━━━━━━━━━┛`
                }, { quoted: m });
            }

            // 2. LOGIKA JIKA DATA ADALAH WEBSITE (HTML)
            const $ = cheerio.load(res.data);
            const title = $('title').text() || 'N/A';
            const ogImg = $('meta[property="og:image"]').attr('content') || '';
            
            // Ambil seluruh teks bersih dari body untuk dijadikan file .txt
            let bodyRaw = $('body').text().trim(); 
            let fileNameTxt = `scrape_${Date.now()}.txt`;

            let caption = `╭━━〔 🌐 *𝚆𝙴𝙱 𝚂𝙲𝚁𝙰𝙿𝙴* 〕━━┓\n`;
            caption += `┃ 📌 *𝚃𝚒𝚝𝚕𝚎:* ${title.trim()}\n`;
            caption += `┃ 🔗 *𝚄𝚁𝙻:* ${text}\n`;
            caption += `┣━━━━━━━━━━━━━━━━━━━━┛\n`;
            caption += `┃ 📄 _Data lengkap dikirim sebagai file._\n`;
            caption += `┗━━━━━━━━━━━━━━━━━━━━┛`;

            if (ogImg) {
                // Kirim gambar metadata + File Teks
                await conn.sendMessage(m.chat, { image: { url: ogImg }, caption: caption }, { quoted: m });
                return conn.sendMessage(m.chat, {
                    document: Buffer.from(bodyRaw),
                    mimetype: 'text/plain',
                    fileName: fileNameTxt
                }, { quoted: m });
            } else {
                return conn.sendMessage(m.chat, {
                    document: Buffer.from(bodyRaw),
                    mimetype: 'text/plain',
                    fileName: fileNameTxt,
                    caption: caption
                }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            return m.reply(`Gagal bedah data! ❌\n\n*Error:* ${e.message}`);
        }
    }
};
