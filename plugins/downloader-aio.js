/**
 * All-in-One Downloader (TikTok, YT, IG) 📥
 * Powered by Zanixon API (ZTRdiamond)
 * Format: Unified Plugin System
 */

const axios = require('axios');

module.exports = {
    command: ['dl', 'aio'],
    category: 'downloader',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Mana link-nya?\n\n*Note: Support Tiktok, Instagram, YouTube`);

        // Daftar domain yang didukung oleh API ini
        const isUrl = text.match(/(https?:\/\/(?:www\.|vm\.|vt\.|v\.|reels\.)?(?:tiktok\.com|instagram\.com|youtube\.com|youtu\.be)\/[^\s]+)/gi);
        if (!isUrl) return m.reply('❌ Link tidak didukung! Pastikan link dari TikTok, IG, atau YouTube.');

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        try {
            const apiUrl = `https://chocomilk.amira.us.kg/v1/download/aio?url=${encodeURIComponent(isUrl[0])}`;
            const { data } = await axios.get(apiUrl);

            if (!data.success || !data.data) {
                return m.reply('❌ Gagal mengambil data. API sedang sibuk atau link tidak valid.');
            }

            const res = data.data;
            const source = res.source.toUpperCase();
            
            // Cari media video dengan kualitas terbaik (HD atau mp4)
            // Khusus TikTok kita cari yang no-watermark jika ada
            let videoData = res.medias.find(m => m.quality === 'hd_no_watermark' || m.quality === 'no_watermark') 
                         || res.medias.find(m => m.type === 'video');

            if (!videoUrl && res.medias.length > 0) videoData = res.medias[0];
            const videoUrl = videoData?.url;

            if (!videoUrl) return m.reply('❌ Konten video tidak ditemukan.');

            // Buat Caption Dinamis berdasarkan Source
            let caption = `📥 *${source} DOWNLOADER* 📥\n\n`;
            caption += `📝 *Title:* ${res.title || 'No Title'}\n`;
            if (res.author) caption += `👤 *Author:* ${res.author}\n`;
            if (res.duration) caption += `⏱️ *Durasi:* ${Math.floor(res.duration / 60)}m ${res.duration % 60}s\n`;
            caption += `🔗 *Source:* ${res.source}\n\n`;
            caption += `_Selesai! File sedang dikirim..._`;

            // Kirim sesuai tipe (Video)
            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: caption 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('❌ Terjadi kesalahan teknis. Pastikan server API online.');
        }
    }
};
