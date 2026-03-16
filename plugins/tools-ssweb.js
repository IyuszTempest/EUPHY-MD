/**
 * Euphy-Bot - Screenshot Web Tools ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['ssweb'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        if (!args[0]) return m.reply(`*Contoh:* ${usedPrefix + command} https://google.com`);

        // Validasi URL
        let url = args[0].startsWith('http') ? args[0] : 'https://' + args[0];

        try {
            await conn.sendMessage(m.chat, { react: { text: "📸", key: m.key } });

            // --- Fungsi Scraper Internal ---
            const baseUrl = 'https://www.screenshotmachine.com';
            
            // 1. Get Cookie
            const resKuki = await fetch(baseUrl);
            const cookie = resKuki.headers.get('set-cookie')?.split(',').map(v => v.split(';')[0]).join('; ') || '';
            
            // 2. Request Capture
            const resCap = await fetch(baseUrl + '/capture.php', {
                method: "POST",
                headers: { 
                    cookie, 
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8" 
                },
                body: "url=" + encodeURIComponent(url) + "&device=desktop&cacheLimit=0"
            });
            const reqObj = await resCap.json();
            if (reqObj.status !== "success") throw Error("Gagal memproses URL");

            // 3. Get Image Buffer
            const resImg = await fetch(baseUrl + '/' + reqObj.link, { headers: { cookie } });
            const ab = await resImg.arrayBuffer();
            const buff = Buffer.from(ab);

            // 4. Send Result
            await conn.sendMessage(m.chat, { 
                image: buff, 
                caption: `📸 *SS WEB SUCCESS*\n🔗 *URL:* ${url}` 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Error:* ${e.message}`);
        }
    }
};
