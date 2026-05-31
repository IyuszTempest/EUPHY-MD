const axios = require('axios');
const cheerio = require('cheerio');
const { fromBuffer } = require('file-type');

module.exports = {
    command: ['dl', 'download', 'aio'],
    category: 'downloader',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
    if (!text) return reply('Masukkan link sosmednya!');

    await conn.sendMessage(m.chat, { react: { text: '🥀', key: m.key } });

    try {
      // 1. Ambil Token (Fetch Initial)
      const initialRes = await axios.get('https://on4t.com/online-video-downloader', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(initialRes.data);
      const csrfToken = $('meta[name="csrf-token"]').attr('content');
      const cookies = initialRes.headers['set-cookie']?.join('; ') || '';

      // 2. Request Download
      const postData = new URLSearchParams();
      postData.append('_token', csrfToken);
      postData.append('link[]', text);

      const res = await axios.post('https://on4t.com/all-video-download', postData.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Cookie': cookies,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const results = res.data?.result;
      if (!results || results.length === 0) return reply('> Gagal ambil data, link mungkin tidak didukung.');

      // 3. Proses Pengiriman
      for (let item of results) {
        let fileUrl = item.video_file_url || item.videoimg_file_url;
        let mediaRes = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        let buff = Buffer.from(mediaRes.data);
        let fileInfo = await fromBuffer(buff) || { mime: 'video/mp4', ext: 'mp4' };

        await conn.sendMessage(m.chat, {
          [fileInfo.mime.split('/')[0]]: buff,
          caption: `> ${item.title || 'Download'}`,
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: idch,
              newsletterName: namech,
              serverMessageId: 143
            }
          }
        }, { quoted: m });
      }

      await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });
    } catch (err) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply(`Error: ${err.message}`);
    }
  }
};
