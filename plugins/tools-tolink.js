const uploadFile = require('../lib/uploadFile')
const uploadImage = require('../lib/uploadImage')

module.exports = {
    command: ['tolink', 'tourl'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m) => {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!mime) return m.reply('Reply media yang mau dijadiin link! 🌐')
        
        await conn.sendMessage(m.chat, { react: { text: "☁️", key: m.key } })
        let media = await q.download()
        // Menggunakan uploader dari lib yang kamu punya
        let link = /image/.test(mime) ? await uploadImage(media) : await uploadFile(media)
        
        if (!link) return m.reply('Gagal mengupload media. ❌')
        m.reply(`*── [ MEDIA LINK ] ──*\n\n🔗 *URL:* ${link}`)
    }
}
