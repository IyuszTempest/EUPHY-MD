/**
 * Euphy-Bot - Sticker Tools V2.1
 * Fokus: Kecepatan download & Integrasi Kompresi Video
 */

module.exports = {
    command: ['s', 'stiker', 'sticker'],
    category: 'tools',
    noPrefix: true, // Agar user bisa ketik 's' saja tanpa titik
    call: async (conn, m, { isOwner }) => {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        // Filter hanya untuk Image atau Video
        if (/image|video/.test(mime)) {
            // Berikan reaksi agar user tahu bot sedang memproses
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

            try {
                // Batasi durasi video secara manual untuk mencegah crash FFmpeg
                if (/video/.test(mime)) {
                    let duration = (q.msg || q).seconds
                    if (duration > 10) return m.reply('Durasinya kepanjangan! Maksimal 7-9 detik aja biar filenya enteng. 🗿')
                }

                // Download media menggunakan fungsi dari simple.js
                let media = await q.download()
                if (!media || !Buffer.isBuffer(media)) return m.reply('Gagal mendownload media, coba lagi! ❌')

                // Proses konversi dengan lib/sticker.js yang sudah di-update
                let stiker = await require('../lib/sticker').sticker(media, false, global.packname, global.author)

                // Cek apakah hasil konversi valid (Buffer WebP)
                if (Buffer.isBuffer(stiker)) {
                    return await conn.sendMessage(m.chat, { 
                        sticker: stiker 
                    }, { quoted: m })
                } else {
                    throw new Error("Hasil konversi bukan Buffer valid.")
                }

            } catch (e) {
                console.error(e)
                // Error hanya ditampilkan ke owner agar log tetap bersih
                if (isOwner) m.reply(`❌ *Sticker Error:* ${e.message}`) 
            }
        } else {
            return m.reply(`Kirim atau reply foto/video dengan caption *s* 🌸`)
        }
    }
}
