module.exports = {
    command: ['swgc'],
    category: 'owner',
    noPrefix: true, 
    owner: true,
    call: async (conn, m, { text, isAdmin, isOwner }) => {
        if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa dipakai di grup.')
        if (!isAdmin && !isOwner) return m.reply('❌ Fitur khusus admin grup atau owner bot.')

        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ""
        
        const captionQuoted = quoted.msg?.caption || quoted.caption || ""
        const caption = text || captionQuoted
        const jid = m.chat

        try {
            if (/image/.test(mime)) {
                const buffer = await quoted.download()
                await conn.sendMessage(jid, {
                    groupStatusMessage: {
                        image: buffer,
                        caption: caption
                    }
                })
            } 
            else if (/video/.test(mime)) {
                const buffer = await quoted.download()
                await conn.sendMessage(jid, {
                    groupStatusMessage: {
                        video: buffer,
                        caption: caption
                    }
                })
            } 
            else if (/audio/.test(mime)) {
                const buffer = await quoted.download()
                await conn.sendMessage(jid, {
                    groupStatusMessage: {
                        audio: buffer
                    }
                })
            } 
            else if (caption) {
                await conn.sendMessage(jid, {
                    groupStatusMessage: {
                        text: caption
                    }
                })
            } 
            else {
                return m.reply(`- example: .swgroup (reply media)`)
            }
            
            // Mengirim konfirmasi sukses ke grup tanpa embel-embel eksternal info
            await conn.sendMessage(jid, { text: "✔️ Status grup berhasil terkirim!" })

        } catch (e) {
            m.reply(String(e))
        }
    }
}
