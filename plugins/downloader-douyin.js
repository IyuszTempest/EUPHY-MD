/**
 * Plugin: Douyin Downloader 📥
 * API: https://api-faa.my.id
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['douyin'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { args, usedPrefix, command }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        if (!args[0]) {
            return m.reply(`Masukkan link Douyin!\n\nContoh:\n${usedPrefix + command} https://v.douyin.com/xxxxx`);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        try {
            let url = encodeURIComponent(args[0]);
            let api = `https://api-faa.my.id/faa/douyin-down?url=${url}`;

            let res = await fetch(api);
            let json = await res.json();

            if (!json.status || !json.result) {
                throw 'Gagal mengambil data Douyin';
            }

            let data = json.result;
            let title = data.title || '-';
            let thumbnail = data.thumbnail;
            let medias = data.medias || [];

            let video = medias.find(v => v.type === 'video');

            if (!video?.url) {
                return m.reply('Video tidak ditemukan');
            }

            let caption = `╭━━〔 📥 *𝙳𝙾𝚄𝚈𝙸𝙽 𝙳𝙻* 〕━━┓\n┃\n` +
                          `┣ ✨ *Judul:* ${title}\n┃\n` +
                          `┗━━━━━━━━━━━━┛`;

            let thumbBuffer = null;
            if (thumbnail) {
                try {
                    let t = await fetch(thumbnail);
                    thumbBuffer = await t.buffer();
                } catch (e) {
                    console.log('Gagal mengambil thumbnail');
                }
            }

            await conn.sendMessage(m.chat, {
                video: { url: video.url },
                caption,
                jpegThumbnail: thumbBuffer
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat mengambil video. Pastikan link valid.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
