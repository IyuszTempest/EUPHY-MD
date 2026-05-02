/**
 * Plugin: Fake Group Generator 📱⛩️
 * Fitur: Membuat gambar mockup grup WhatsApp palsu.
 */

const axios = require('axios');
const FormData = require('form-data');

/**
 * Fungsi upload ke Uguu.se untuk dapet link gambar permanen
 */
async function uguu(buffer) {
  try {
    const form = new FormData();
    form.append("files[]", buffer, "image.jpg");

    const { data } = await axios.post(
      "https://uguu.se/upload",
      form,
      { headers: form.getHeaders() }
    );

    return data?.files?.[0]?.url || null;
  } catch {
    return null;
  }
}

module.exports = {
    command: ['fakegroup'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        if (!text) {
            return m.reply(`Contoh penggunaan:\n\n` +
                  `1. Pakai link gambar:\n${usedPrefix + command} https://telegra.ph/xxx.jpg|Nama Grup|+628xx|12:00\n\n` +
                  `2. Reply gambar langsung:\n${usedPrefix + command} Nama Grup|No. Telepon|Waktu`);
        }

        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

        try {
            let url, title, number, time;
            let args = text.split('|').map(v => v?.trim());

            // Skenario 1: Input URL Manual
            if (args.length === 4) {
                [url, title, number, time] = args;
            } 
            // Skenario 2: Reply Gambar + Deskripsi
            else if (args.length === 3) {
                if (!mime.startsWith('image/')) {
                    return m.reply('Harus reply atau kirim gambar untuk dijadikan foto profil grup!');
                }
                ;[title, number, time] = args;
                let media = await q.download();
                url = await uguu(media);
                if (!url) throw 'Gagal upload gambar ke server penyimpanan.';
            } 
            else {
                return m.reply(`Format salah. Ikutin contoh yang tersedia.`);
            }

            // Tembak API Maker
            let api = `https://api.zenzxz.my.id/maker/fakegroup?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&number=${encodeURIComponent(number)}&time=${encodeURIComponent(time)}`;

            let { data } = await axios.get(api, { responseType: 'arraybuffer' });
            let buffer = Buffer.from(data);

            // Kirim hasil mockupnya
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `✅ *Fake Group Berhasil Dibuat!*\n\n📌 *Grup:* ${title}\n👤 *Dibuat oleh:* ${number}\n⏰ *Jam:* ${time}`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('❌ Gagal membuat mockup grup. Coba cek API atau koneksi internet.');
        }
    }
};
