/**
 * Euphy-Bot - Owner Info Plugin
 * Tampilan kece buat info Raja Iblis
 */

module.exports = {
    command: ['owner', 'creator'],
    category: 'main',
    call: async (conn, m) => {
        // Data Owner - Sesuaikan kalau ada nomor baru
        let ownerNumber = '6282255810534' 
        let ownerName = 'Natalius (Yus)'
        
        // Membuat vCard estetik
        const vcard = 'BEGIN:VCARD\n' 
                    + 'VERSION:3.0\n' 
                    + `FN:${ownerName}\n` 
                    + `ORG:Universitas Katolik Santo Agustinus Hippo;\n`
                    + `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` 
                    + 'END:VCARD'

        // Mengirim kontak vCard
        await conn.sendMessage(m.chat, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m })

        // Pesan info tambahan yang kece
        let info = `*───「 OWNER INFO 」───*\n\n`
                 + `👋 Halo! Perkenalkan saya *${ownerName}*.\n`
                 + `🎓 *Status:* Mahasiswa Sistem Informasi '25\n`
                 + `💻 *Role:* Developer of Euphy-Bot\n`
                 + `📍 *Location:* Ngabang, Kalimantan Barat\n`
                 + `🎨 *Interest:* Anime, Coding, & DIY Electronics\n\n`
                 + `_"Koding itu seperti sihir, asalkan logikanya bener, duniamu aman."_`

        // Kirim info tambahan dengan m.reply yang sudah kita fix kemarin
        return m.reply(info)
    }
}