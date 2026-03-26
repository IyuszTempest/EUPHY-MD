/**
 * All-in-One Downloader (Instant Mode) 📥
 * Powered by Zanixon API (ZTRdiamond)
 * Format: Unified Plugin System
 * Mode: Kirim Video Saja (Tanpa Info/Caption)
 */

const axios = require('axios');

module.exports = {
    command: ['dl', 'download', 'aio'],
    category: 'downloader',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        if (!text) return m.reply(`Mana link-nya?\n\n*Note*: Support Tiktok, Instagram, YouTube`);

        // Daftar domain yang didukung (TikTok, IG, YouTube)
        const isUrl = text.match(/(https?:\/\/(?:www\.|vm\.|vt\.|v\.|reels\.)?(?:tiktok\.com|instagram\.com|youtube\.com|youtu\.be)\/[^\s]+)/gi);
        if (!isUrl) return m.reply('❌ Link tidak didukung! Pastikan link dari TikTok, IG, atau YouTube.');

        // Beri reaksi 'Proses' (Emoji Jam/Tunggu)
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        try {
            // Nembak API AIO
            const apiUrl = `https://chocomilk.amira.us.kg/v1/download/aio?url=${encodeURIComponent(isUrl[0])}`;
            const { data } = await axios.get(apiUrl);

            if (!data.success || !data.data) {
                return m.reply('❌ Gagal mengambil data. Link tidak valid atau server API sibuk.');
            }

            const res = data.data;
            
            // Logika pencarian media video (Cari kualitas terbaik/HD jika tersedia)
            // Terutama untuk TikTok, kita utamakan yang No-Watermark.
            let videoData = res.medias.find(m => m.quality === 'hd_no_watermark' || m.quality === 'no_watermark') 
                         || res.medias.find(m => m.type === 'video');

            // Jika masih tidak ketemu di list medias, ambil yang pertama saja
            if (!videoData && res.medias.length > 0) videoData = res.medias[0];
            const videoUrl = videoData?.url;

            if (!videoUrl) return m.reply('❌ Konten video tidak ditemukan.');

            // --- INSTANT MODE: KIRIM VIDEO SAJA ---
            // Caption dikosongkan agar respon bersih dan instan.
            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: '' // Tanpa caption info
            }, { quoted: m });

            // Beri reaksi 'Selesai' (Emoji Centang)
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('❌ Gagal mendownload. Pastikan link benar dan server API online.');
        }
    }
};
