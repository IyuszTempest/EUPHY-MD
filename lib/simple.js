/**
 * Euphy-Bot - Simple.js (Final Edition)
 * Fix: Media Download, LID Support, & Global Reply System
 */

const {
    default: makeWASocket,
    proto, 
    downloadContentFromMessage,
    jidDecode,
    areJidsSameUser,
    generateForwardMessageContent,
    generateWAMessageFromContent
} = require('@whiskeysockets/baileys')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

exports.makeWASocket = (connectionOptions) => {
    let conn = makeWASocket(connectionOptions)

    // --- [ 1. DECODE JID (Handle JID & LID) ] ---
    conn.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    if (conn.user && conn.user.id) conn.user.jid = conn.decodeJid(conn.user.id)

    // --- [ 2. DOWNLOAD MEDIA FUNCTION ] ---
    conn.downloadM = async (m, type, saveToFile) => {
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
        try {
            const stream = await downloadContentFromMessage(m, type)
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            if (saveToFile) {
                const FileType = require('file-type')
                let typeFile = await FileType.fromBuffer(buffer) || { ext: '.bin' }
                let filename = path.join(__dirname, '../tmp/' + Date.now() + '.' + typeFile.ext)
                fs.writeFileSync(filename, buffer)
                return filename
            }
            return buffer
        } catch (e) {
            console.error(chalk.red(`[ERROR] Download Media: ${e.message}`))
            return Buffer.alloc(0)
        }
    }

    // --- [ 3. SMART REPLY SYSTEM (Euphy Style) ] ---
    conn.reply = (jid, text = '', quoted, options) => {
        return conn.sendMessage(jid, { 
            text, 
            mentions: conn.parseMention(text),
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title: global.adReply?.title || "Euphylia Magenta",
                    body: global.adReply?.body || "System Online",
                    thumbnailUrl: global.adReply?.img || global.imgall,
                    sourceUrl: global.adReply?.source || global.idch,
                    mediaType: 1,
                    renderLargerThumbnail: true
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.idch,
                    serverMessageId: 143,
                    newsletterName: global.namech
                }
            },
            ...options 
        }, { quoted: quoted || global.fkontak })
    }

    conn.parseMention = (text = '') => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }

    return conn
}

// --- [ 4. SMSG (Message Object Parser) ] ---
exports.smsg = (conn, m) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    m = M.fromObject(m)
    
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = conn.decodeJid(m.key.remoteJid || '')
        m.fromMe = m.key.fromMe || areJidsSameUser(m.sender, conn.user.id)
        // Fix LID: Mengambil sender dari participant jika di Group/Status
        m.sender = conn.decodeJid(m.fromMe ? (conn.user.id || conn.user.lid) : (m.key.participant || m.participant || m.chat || ''))
    }

    if (m.message) {
        let mtype = Object.keys(m.message)
        m.mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype[0]) && mtype[0]) || (mtype.length >= 3 && mtype[1] !== 'messageContextInfo' && mtype[1]) || mtype[mtype.length - 1]
        m.msg = m.message[m.mtype]
        
        // Parsing Text dengan aman
        m.text = m.msg?.text || m.msg?.caption || m.msg?.contentText || (typeof m.msg === 'string' ? m.msg : '') || ''
        
        // Fungsi Download Media
        m.download = () => conn.downloadM(m.msg, m.mtype.replace(/Message/gi, ''))
        
        // Shortcut Reply
        m.reply = (text, chatId, options) => conn.reply(chatId || m.chat, text, m, options)

        // Parsing Quoted Message (Pesan yang di-reply)
        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage || null
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
            m.quoted = m.quoted[type]
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = conn.decodeJid(m.msg.contextInfo.remoteJid || m.chat)
            m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = areJidsSameUser(m.quoted.sender, conn.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.contentText || ''
            // Kunci sukses setppgc: Download dari quoted media
            m.quoted.download = () => conn.downloadM(m.quoted, m.quoted.mtype.replace(/Message/gi, ''))
        }
    }
    
    // Fallback reply
    if (!m.reply) m.reply = (text, chatId, options) => conn.reply(chatId || m.chat, text, m, options)

    return m
}
