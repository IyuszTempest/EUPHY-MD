/**
 * Euphy-Bot - List Premium (Nama & Nomor Detect)
 * Menampilkan nama user atau nomor jika LID digunakan
 */

module.exports = {
    command: ['listprem', 'premiumlist'],
    category: 'info',
    noPrefix: true,
    call: async (conn, m, { usedPrefix }) => {
        let users = global.db?.data?.users || {}
        
        let premiumUsers = Object.entries(users).filter(([id, user]) => {
            return user?.premium === true; 
        })

        if (premiumUsers.length === 0) {
            return m.reply(`Belum ada user premium yang terdaftar. 🥲`)
        }

        // Urutkan: Permanen di atas
        premiumUsers.sort((a, b) => {
            if (a[1].premiumTime <= 0) return -1;
            if (b[1].premiumTime <= 0) return 1;
            return a[1].premiumTime - b[1].premiumTime;
        })

        let txt = `╭━━〔 ⛩️ *𝙿𝚁𝙴𝙼𝙸𝚄𝙼 𝚄𝚂𝙴𝚁𝚂* ⛩️ 〕━━┓\n`
        txt += `┃ ✨ Total: *${premiumUsers.length}* User aktif\n`
        txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`

        premiumUsers.forEach(([id, user], i) => {
            let pTime = user.premiumTime;
            let status = pTime <= 0 ? "Permanen" : "";
            
            if (pTime > 0) {
                let sisaWaktu = pTime - Date.now();
                let hari = Math.floor(sisaWaktu / 86400000);
                let jam = Math.floor((sisaWaktu % 86400000) / 3600000);
                if (hari > 0) status += `${hari}h `;
                status += `${jam}j`;
            }

            // --- [ LOGIKA DETEKSI IDENTITAS ] ---
            let name = user.name || 'User';
            let identity = "";

            if (id.endsWith('@lid')) {
                // Jika LID, tampilkan Nama + LID (biar tahu ini siapa)
                identity = `👤 *${name}*\n   🆔 LID: ${id.split('@')[0]}`;
            } else {
                // Jika JID biasa, tampilkan Nama + Tag Nomor
                identity = `👤 *${name}* (@${id.split('@')[0]})`;
            }
            
            txt += `${i + 1}. ${identity}\n`;
            txt += `   ⏳ Sisa: *${status}*\n`;
            txt += `   📅 Exp: _${pTime <= 0 ? 'Infinity' : new Date(pTime).toLocaleDateString('id-ID')}_\n${i === premiumUsers.length - 1 ? '' : '────────────────────'}\n`;
        });

        txt += `\n_IyuszTempest • Node ${process.version}_`

        conn.sendMessage(m.chat, { 
            text: txt,
            contextInfo: {
                // Tag nomor jika bukan LID agar muncul link profilnya
                mentionedJid: premiumUsers.map(([id]) => id).filter(v => !v.endsWith('@lid')),
                externalAdReply: {
                    title: "𝙴𝚄𝙿𝙷𝚈 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 𝚂𝚈𝚂𝚃𝙴𝙼",
                    body: `Verified Premium Users`,
                    thumbnailUrl: global.imgall,
                    sourceUrl: global.idch,
                    mediaType: 1
                }
            }
        }, { quoted: m })
    }
}
