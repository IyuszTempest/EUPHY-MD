/**
 * Plugin AI Image Generator (AILabs)
 * Menggunakan API AI/AILabs
 */

const axios = require('axios');

module.exports = {
    command: ['ailabs', 'aiimg'],
    category: 'ai',
    premium: true,
    noPrefix: true,
    call: async (conn, m, { text, command }) => {
        if (!text) return m.reply(`Mau buat gambar apa? Contoh: *${command} cyber-city background*`);

        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

        try {
            // Memanggil API menggunakan variabel global
            const response = await axios.get(`${global.apiyus}/api/ai?feature=ailabs&query=${encodeURIComponent(text)}&type=image&apikey=${global.apikey}`);
            
            if (response.data.code !== 0) {
                return m.reply('Maaf, gagal membuat gambar. Silakan coba prompt lain.');
            }

            const imageUrl = response.data.url;

            // Kirim hasil gambar AI
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `*AI IMAGE GENERATOR*\n\nPrompt: "${text}"\n✨ Berhasil dibuat!`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server AI.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
