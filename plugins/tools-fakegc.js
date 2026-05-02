/**
 * Plugin: Fake Group Generator 📱⛩️
 * Fitur: Membuat gambar mockup grup WhatsApp palsu.
 */

import axios from 'axios'
import FormData from 'form-data'

/**
 * Fungsi upload ke Uguu.se untuk dapet link gambar permanen
 */
async function uguu(buffer) {
  try {
    const form = new FormData()
    form.append("files[]", buffer, "image.jpg")

    const { data } = await axios.post(
      "https://uguu.se/upload",
      form,
      { headers: form.getHeaders() }
    )

    return data?.files?.[0]?.url || null
  } catch {
    return null
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!text) {
    throw `Contoh penggunaan, Yus:\n\n` +
          `1. Pakai link gambar:\n${usedPrefix + command} https://telegra.ph/xxx.jpg|Nama Grup|+628xx|12:00\n\n` +
          `2. Reply gambar langsung:\n${usedPrefix + command} Nama Grup|No. Telepon|Waktu`
  }

  await m.react('🕒')

  try {
    let url, title, number, time
    let args = text.split('|').map(v => v?.trim())

    // Skenario 1: Input URL Manual
    if (args.length === 4) {
      [url, title, number, time] = args
    } 
    // Skenario 2: Reply Gambar + Deskripsi
    else if (args.length === 3) {
      if (!mime.startsWith('image/')) {
        throw 'Harus reply atau kirim gambar untuk dijadikan foto profil grup!'
      }
      ;[title, number, time] = args
      let media = await q.download()
      url = await uguu(media)
      if (!url) throw 'Waduh, gagal upload gambar ke server penyimpanan.'
    } 
    else {
      throw `Format salah. Ikutin contoh di atas ya, Yus!`
    }

    // Tembak API Maker
    let api = `https://api.zenzxz.my.id/maker/fakegroup?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&number=${encodeURIComponent(number)}&time=${encodeURIComponent(time)}`

    let { data } = await axios.get(api, { responseType: 'arraybuffer' })
    let buffer = Buffer.from(data)

    // Kirim hasil mockupnya
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `✅ *Fake Group Berhasil Dibuat!*\n\n📌 *Grup:* ${title}\n👤 *Dibuat oleh:* ${number}\n⏰ *Jam:* ${time}`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply(typeof e === 'string' ? e : '❌ Gagal membuat mockup grup. Coba cek API atau koneksi kamu!')
  }
}

handler.help = ['fakegroup']
handler.tags = ['tools']
handler.command = /^fakegroup$/i
handler.limit = true // Biar nggak disalahgunakan terus-menerus

export default handler
