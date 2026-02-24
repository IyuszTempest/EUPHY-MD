/** * Updated Menu Euphylia Magenta - "The King of UI" Style
 * Kategori Lengkap & Gabungan Fkontak + Newsletter
 */

process.env.TZ = 'Asia/Jakarta'
const fs = require('fs')

// Daftar kategori lengkap sesuai request
const allTags = {
    'main': '🍱 `‹ MENU MBG ›`',
    'anime': '🌸 `‹ MENU WIBU ›`', // New
    'ai': '🤖 `‹ MENU AI ›`',
    'downloader': '📥 `‹ MENU DOWNLOADER›`',
    'fun': '🎮 `‹ MENU FUN ›`',
    'group': '👥 `‹ MENU GC ›`',   
    'nsfw': '🔞 `‹ MENU NSFW ›`',    // New
    'owner': '👑 `‹ MENU OWNER ›`'
    'tools': '🛠️ `‹ MENU TOOLS ›`',
};

module.exports = {
    command: ['menu', 'help', '?'],
    category: 'main',
    noPrefix: true, 
    call: async (conn, m, { usedPrefix: _p }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "🏮", key: m.key } });

            let user = global.db.data.users[m.sender]
            if (!user) return m.reply('Sistem sedang memuat data...')
            
            let name = `@${m.sender.split`@`[0]}`
            const imageMenu = global.imgall;
            let uptime = clockString(process.uptime() * 1000)

            let menuList = `╭━━〔 ⛩️ *𝙴𝚄𝙿𝙷𝚈𝙻𝙸𝙰 𝙼𝙰𝙶𝙴𝙽𝚃𝙰* ⛩️ 〕━━┓\n`
            menuList += `┃ 👤 *𝚄𝚜𝚎𝚛:* ${name}\n`
            menuList += `┃ 🕒 *𝚄𝚙𝚝𝚒𝚖𝚎:* ${uptime}\n`
            menuList += `┃ 📚 *𝙻𝚒𝚋𝚛𝚊𝚛𝚢:* Baileys v6.7.0\n`
            menuList += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`
            
            for (let tag in allTags) {
                let categoryCommands = Object.values(global.plugins)
                    .filter(p => p && p.category === tag)
                    .map(p => {
                        let cmd = Array.isArray(p.command) ? p.command[0] : p.command;
                        return `  ◦ ⁠✿ ${_p + cmd}`;
                    }).join('\n');
                
                if (categoryCommands) {
                    menuList += `${allTags[tag]}\n${categoryCommands}\n\n`
                }
            }
            
            menuList += `_Total: ${Object.keys(global.plugins).length} Fitur_\n${global.wm}`

            // --- [ Fkontak + Newsletter Style ] ---
            // Kita bungkus pengiriman gambarnya dengan contextInfo yang sangat lengkap
            return await conn.sendMessage(m.chat, {
                image: { url: imageMenu },
                caption: menuList,
                contextInfo: { 
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    // Newsletter ID
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        serverMessageId: 143,
                        newsletterName: `System Online - ${global.namech}`
                    },
                    // Fkontak Style (Kartu Kontak)
                    externalAdReply: {
                        title: `Halo, ${name}!`,
                        body: `Running on Node.js ${process.version}`,
                        thumbnailUrl: global.imgall,
                        sourceUrl: global.idch,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply(`Error Menu: ${e.message}`)
        }
    }
};

// --- [ PERBAIKAN FUNGSI CLOCKSTRING ] ---

function clockString(ms) {
    if (isNaN(ms)) ms = 0;
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    // Memastikan setiap variabel diubah ke String dengan aman

    return [h, m, s].map(v => (v || 0).toString().padStart(2, '0')).join(':');

}
