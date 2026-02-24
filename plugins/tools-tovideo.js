const { exec } = require('child_process')
const fs = require('fs')

module.exports = {
    command: ['tovideo', 'tomp4'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m) => {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!/webp/.test(mime)) return m.reply('Reply stiker bergerak (GIF) buat dijadiin video! 🎬')
        
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
        let media = await q.download()
        let inp = './tmp/' + Date.now() + '.webp'
        let out = './tmp/' + Date.now() + '.mp4'
        
        fs.writeFileSync(inp, media)
        exec(`ffmpeg -i ${inp} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${out}`, async (err) => {
            fs.unlinkSync(inp)
            if (err) return m.reply('Gagal konversi ke video. Pastikan stiker kamu bergerak! ❌')
            await conn.sendMessage(m.chat, { video: fs.readFileSync(out), caption: 'Berhasil jadi video! 🎥' }, { quoted: m })
            fs.unlinkSync(out)
        })
    }
}
