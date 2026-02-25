/** * Euphy-Bot - Media to URL (Catbox Version)
 * Fitur: Mengubah Gambar/Video menjadi link URL permanen
 */

// Menggunakan destructuring { } karena lib kamu mengekspor sebagai objek
const { uploadImage } = require('../lib/uploadImage') 

module.exports = {
    command: ['tolink', 'tourl'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { text }) => {
        // Deteksi apakah user melakukan reply media atau mengirim media langsung
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        
        // Validasi input: Harus berupa media
        if (!mime) return m.reply('Reply foto atau video yang mau dijadiin link! 🏮')
        
        // Kirim reaksi agar user tahu bot sedang memproses
        await conn.sendMessage(m.chat, { react: { text: "☁️", key: m.key } })

        try {
            // Proses download media dari server WhatsApp
            let media = await q.download()
            
            // Proses upload ke Catbox via lib
            let link = await uploadImage(media)
            
            if (!link) throw new Error('Server uploader tidak merespon')

            let caption = `╭━━〔 ⛩️ *𝙼𝙴𝙳𝙸𝙰 𝚄𝚁𝙻* ⛩️ 〕━━┓\n`
                        + `┃ ✨ *Status:* Success\n`
                        + `┃ 🔗 *Link:* ${link}\n`
                        + `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`
                        + `Ini link-nya ya!`

            m.reply(caption)
            
        } catch (e) {
            console.error(e)
            // Pesan error jika gagal, agar tidak bingung
            m.reply(`⚠️ Gagal konversi ke link: ${e.message}\nPastikan file lib/uploadImage.js sudah benar.`)
        }
    }
}
