/**
 * Euphy-Bot - Simple.js (Final UI & Scope Fix)
 * Fitur: Auto Fkontak & AdReply Response
 */

const {
    default: makeWASocket,
    proto, 
    downloadContentFromMessage,
    jidDecode,
    areJidsSameUser,
} = require('@whiskeysockets/baileys')

// ... (require lainnya tetap sama)

exports.makeWASocket = (connectionOptions) => {
    let conn = makeWASocket(connectionOptions)

    // 1. Definisikan downloadM (Fungsi Inti Media)
    conn.downloadM = async (m, type, saveToFile) => {
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
        const stream = await downloadContentFromMessage(m, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        if (saveToFile) {
            const FileType = require('file-type')
            let typeFile = await FileType.fromBuffer(buffer) || { ext: '.bin' }
            let filename = require('path').join(__dirname, '../tmp/' + new Date * 1 + '.' + typeFile.ext)
            require('fs').writeFileSync(filename, buffer)
            return filename
        }
        return buffer
    }

    // 2. Pasang fungsi decodeJid (Handle @lid & @s.whatsapp.net)
    conn.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    if (conn.user && conn.user.id) conn.user.jid = conn.decodeJid(conn.user.id)
    
    // 3. Update Fungsi Reply (Auto Fkontak UI)
    conn.reply = (jid, text = '', quoted, options) => {
        return conn.sendMessage(jid, { 
            text, 
            mentions: [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net'),
            contextInfo: {
                // Style Balon Chat / AdReply
                externalAdReply: {
                    title: global.adReply.title,
                    body: global.adReply.body,
                    thumbnailUrl: global.adReply.img,
                    sourceUrl: global.adReply.source,
                    mediaType: 1,
                    renderLargerThumbnail: true
                },
                // Style Forward / Newsletter
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.idch,
                    serverMessageId: 143,
                    newsletterName: global.namech
                }
            },
            ...options 
        }, { quoted: global.fkontak, ...options }) // Reply otomatis nempel ke Fkontak
    }

    return conn
}

exports.smsg = (conn, m) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    m = M.fromObject(m)
    
    const decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    if (m.key) {
        m.id = m.key.id
        m.chat = decodeJid(m.key.remoteJid || '')
        m.sender = decodeJid(m.key.fromMe ? (conn.user.id || conn.user.lid) : (m.participant || m.key.participant || m.chat || ''))
        m.fromMe = m.key.fromMe || areJidsSameUser(m.sender, conn.user.id)
    }

    if (m.message) {
        let mtype = Object.keys(m.message)
        m.mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype[0]) && mtype[0]) || (mtype.length >= 3 && mtype[1] !== 'messageContextInfo' && mtype[1]) || mtype[mtype.length - 1]
        m.msg = m.message[m.mtype]
        m.text = m.msg.text || m.msg.caption || m.msg.contentText || m.msg || ''
        
        m.download = () => conn.downloadM(m.msg, m.mtype.replace(/Message/i, ''))
        m.reply = (text, chatId, options) => conn.reply(chatId ? chatId : m.chat, text, m, options)

        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage ? m.msg.contextInfo.quotedMessage : null
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
            m.quoted = m.quoted[type]
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.download = () => conn.downloadM(m.quoted, m.quoted.mtype.replace(/Message/i, ''))
        }
    }
    
    if (!m.reply) m.reply = (text, chatId, options) => conn.reply(chatId ? chatId : m.chat, text, m, options)

    return m
}
