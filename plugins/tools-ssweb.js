/**
 * Plugin: Screenshot Website (SSWEB) 📸
 * Mode: Desktop, Mobile, & Tablet
 * Source: Screenshotmachine API
 */

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validasi input
    if (!text) throw `Contoh penggunaan:\n${usedPrefix + command} https://google.com\n${usedPrefix + command} hp https://google.com\n${usedPrefix + command} tablet https://google.com`

    // Masukkan API Key kamu di sini
    let key = '9f51ff' 
    
    let args = text.split(' ')
    let device = 'desktop'
    let url = text
    let dimension = '1366xfull' // Default untuk PC

    // Logika pemilihan device
    if (/^(hp|mobile)$/i.test(args[0])) {
        device = 'm' // Kode API untuk mobile
        dimension = '480xfull'
        url = args.slice(1).join(' ')
    } else if (/^tablet$/i.test(args[0])) {
        device = 't' // Kode API untuk tablet
        dimension = '1024xfull'
        url = args.slice(1).join(' ')
    } else if (/^(pc|desktop)$/i.test(args[0])) {
        device = 'desktop'
        dimension = '1366xfull'
        url = args.slice(1).join(' ')
    }

    // Cek apakah URL ada setelah dipotong mode device
    if (!url) throw 'Mana URL-nya? Masukkan link yang valid ya!'
    if (!url.startsWith('http')) url = 'https://' + url

    await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } })
    await m.reply('✨ _Tunggu sebentar, lagi fotoin webnya..._')

    try {
        let api = `https://api.screenshotmachine.com?key=${key}&url=${encodeURIComponent(url)}&dimension=${dimension}&device=${device}`
        
        await conn.sendMessage(m.chat, {
            image: { url: api },
            caption: `✅ *Screenshot Berhasil!*\n\n🌐 *URL:* ${url}\n📱 *Device:* ${device === 'm' ? 'Mobile' : device === 't' ? 'Tablet' : 'Desktop'}`
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
        console.error(e)
        m.reply('❌ Waduh, gagal ambil screenshot. Cek API Key atau URL kamu!')
    }
}

handler.help = ['ssweb', 'ssweb hp', 'ssweb tablet']
handler.tags = ['tools']
handler.command = /^ssweb$/i
handler.limit = true

export default handler
