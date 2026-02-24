/**
 * Euphy-Bot - AFK Starter (V2.0 Final Fix)
 * Ganti Regex ke Array agar terdeteksi oleh handler.js
 */

module.exports = {
    // Kita ganti ke array string biar terbaca oleh includes di handler
    command: ['afk'], 
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        let user = global.db.data.users[m.sender]
        user.afk = +new Date()
        user.afkReason = text.trim() || 'Nggak ada alasan, lagi ke isekai ntar.'
        let senderName = m.pushName || m.sender.split('@')[0]

        let caption = `
┏━━━━━━━⬣  *A F K  M O D E*
┃
┃ ⚡ *Status:* Active
┃ 👤 *Sensei:* ${senderName}
┃ 🕒 *Time:* ${new Date().toLocaleString('id-ID')} WIB
┃ 📝 *Reason:* ${user.afkReason}
┃
┗━━━━━━━━━━━━━━━━━━⬣

> *“Euphy akan memantau semua pesan masuk. Silakan istirahat dengan tenang! ✨”*
        `.trim()

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "EUPHY SYSTEM: AFK ACTIVATED",
                    body: `${senderName} sedang istirahat`,
                    thumbnailUrl: global.imgall,
                    sourceUrl: "https://github.com/IyuszTempest",
                    mediaType: 1,
                    renderLargerThumbnail: true
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.idch,
                    serverMessageId: 143,
                    newsletterName: global.namech
                }
            }
        }, { quoted: m })
    }
}
