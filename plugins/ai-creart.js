/**
 * Plugin Creart AI - Image Generator
 * Menggunakan API AI/Creart
 */

const axios = require('axios');

module.exports = {
    command: ['creart'],
    category: 'ai',
    premium: true,
    noPrefix: true, 
    call: async (conn, m, { text, command }) => {
        if (!text) return m.reply(`Mau buat gambar anime apa? Contoh: *${command} anime girl in the rain*`);

        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

        try {
            // Memanggil API menggunakan variabel global
            const response = await axios.get(`${global.apiyus}/api/ai?feature=creart&query=${encodeURIComponent(text)}&apikey=${global.apikey}`);
            
            if (response.data.status !== "success") {
                return m.reply('Maaf, AI gagal memproses gambar tersebut. Coba prompt lain ya.');
            }

            const imageUrl = response.data.result;

            // Kirim hasil gambar AI
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `*CREART AI - GENERATOR*\n\nPrompt: "${text}"\n✨ Berhasil dibuat!`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server Creart AI.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
