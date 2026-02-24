const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports = {
    command: ['toimg', 'toimage'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { isOwner }) => {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!/webp/.test(mime)) return m.reply('Silakan reply stiker yang mau diubah jadi gambar! 🌸')
        
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
        let media = await q.download()
        let out = path.join(__dirname, '../tmp/' + Date.now() + '.png')
        let inp = path.join(__dirname, '../tmp/' + Date.now() + '.webp')
        
        fs.writeFileSync(inp, media)
        exec(`ffmpeg -i ${inp} ${out}`, async (err) => {
            fs.unlinkSync(inp)
            if (err) return m.reply('Gagal mengonversi stiker. Pastikan ffmpeg terinstal di host. ❌')
            await conn.sendMessage(m.chat, { image: fs.readFileSync(out), caption: 'Nih gambarnya! ✨' }, { quoted: m })
            fs.unlinkSync(out)
        })
    }
}
