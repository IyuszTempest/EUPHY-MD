/** * Euphy-Bot - Premium Checker
 * Fitur: Khusus Cek Status Member Diri Sendiri
 */

module.exports = {
    command: ['cekprem', 'membership'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m) => {
        let user = global.db.data.users[m.sender];
        
        // Pengecekan Owner lewat global.owner & global.lidowner
        const isOwner = [...global.owner.map(v => v[0]), ...(global.lidowner || [])].some(number => {
            return m.sender.includes(number.replace(/[^0-9]/g, ''));
        });

        let isPremium = isOwner || (user && (user.premium || (user.premiumTime && user.premiumTime > Date.now())));
        
        // Menghitung Masa Aktif
        let expired = 'Bukan Member Premium';
        if (isPremium) {
            if (isOwner || (user && user.premiumTime >= 999999999999)) {
                expired = 'PERMANENT ✨';
            } else if (user && user.premiumTime) {
                expired = new Date(user.premiumTime).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
            } else {
                expired = 'Masa Aktif Aktif'; // Backup jika data time tidak ada tapi status true
            }
        }

        let statusText = isPremium ? '💎 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 𝙼𝙴𝙼𝙱𝙴𝚁' : '👤 𝙵𝚁𝙴𝙴 𝚄𝚂𝙴𝚁';

        let cap = `╭━━〔 ⛩️ *𝙼𝙴𝙼𝙱𝙴𝚁𝚂𝙷𝙸𝙿 𝙲𝙷𝙴𝙲𝙺* ⛩️ 〕━━┓\n`
                + `┃ 👤 *𝚄𝚜𝚎𝚛:* ${m.pushName || 'Owner'}\n`
                + `┃ 💎 *𝚂𝚝𝚊𝚝𝚞𝚜:* ${statusText}\n`
                + `┃ ⏳ *𝙴𝚡𝚙𝚒𝚛𝚎𝚍:* ${expired}\n`
                + `┣━━━━━━━━━━━━━━━━━━━━┛\n`
                + `┃ 🏮 *𝙻𝙸𝙳 𝚂𝚝𝚊𝚝𝚞𝚜:* ${m.sender.endsWith('@lid') ? 'Verified ✅' : 'Standard 📱'}\n`
                + `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`
                + `_Nikmati fitur tanpa limit hanya di Euphy-Bot!_ [cite: 2025-05-24]`;

        return await conn.sendMessage(m.chat, {
            text: cap,
            contextInfo: {
                externalAdReply: {
                    title: `Premium Status: ${isPremium ? 'Active' : 'Inactive'}`,
                    body: `Check your subscription details here`,
                    thumbnailUrl: global.imgall,
                    sourceUrl: global.idch,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};
