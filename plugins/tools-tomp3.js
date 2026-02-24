const { exec } = require('child_process')
const fs = require('fs')

module.exports = {
    command: ['tomp3', 'toaudio'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m) => {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!/video|audio/.test(mime)) return m.reply('Reply video atau voice note yang mau dijadiin MP3! 🎶')
        
        await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } })
        let media = await q.download()
        let inp = './tmp/' + Date.now()
        let out = inp + '.mp3'
        
        fs.writeFileSync(inp, media)
        exec(`ffmpeg -i ${inp} -vn -acodec libmp3lame -q:a 2 ${out}`, async (err) => {
            fs.unlinkSync(inp)
            if (err) return m.reply('Gagal konversi ke audio. ❌')
            await conn.sendMessage(m.chat, { audio: fs.readFileSync(out), mimetype: 'audio/mpeg' }, { quoted: m })
            fs.unlinkSync(out)
        })
    }
}
