/**
 * Plugin DeepImage AI - Realistic Image Generator
 * Menggunakan API AI/DeepImg
 */

const axios = require('axios');

module.exports = {
    command: ['deepimg'],
    category: 'ai',
    noPrefix: true, 
    premium: true,
    call: async (conn, m, { text, command }) => {
        if (!text) return m.reply(`Mau buat gambar realistik apa? Contoh: *${command} futuristic car in forest*`);

        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } });

        try {
            // Memanggil API menggunakan variabel global
            const response = await axios.get(`${global.apiyus}/api/ai?feature=deepimg&query=${encodeURIComponent(text)}&animestyle=realistic&apikey=${global.apikey}`);
            
            if (response.data.status !== "success") {
                return m.reply('Maaf, AI gagal memproses gambar realistik tersebut. Coba prompt lain ya.');
            }

            const imageUrl = response.data.result.url;

            // Kirim hasil gambar AI
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `*DEEPIMAGE AI - REALISTIC*\n\nPrompt: "${text}"\nStyle: Realistic\n✨ Berhasil dibuat!`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server DeepImage AI.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
