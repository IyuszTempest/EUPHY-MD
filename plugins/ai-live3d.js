/**
 * Plugin Live3D AI - Anime Style Generator
 * Menggunakan API AI/Live3D
 */

const axios = require('axios');

module.exports = {
    command: ['live3d'],
    category: 'ai',
    noPrefix: true, 
    call: async (conn, m, { text, command }) => {
        if (!text) return m.reply(`Mau buat gambar anime 3D apa? Contoh: *${command} loli cute*`);

        // Memberikan reaksi loading (React)
        await conn.sendMessage(m.chat, { react: { text: '🌀', key: m.key } });

        try {
            // Memanggil API menggunakan variabel global
            const response = await axios.get(`${global.apiyus}/api/ai?feature=live3d&query=${encodeURIComponent(text)}&style=Anime&apikey=${global.apikey}`);
            
            if (response.data.status !== "success") {
                return m.reply('Maaf, AI gagal memproses gambar 3D tersebut. Coba prompt lain ya.');
            }

            const imageUrl = response.data.result;

            // Kirim hasil gambar AI
            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `*LIVE3D AI - GENERATOR*\n\nPrompt: "${text}"\nStyle: Anime\n✨ Berhasil dibuat!`,
                mentions: [m.sender]
            }, { quoted: m });

            // Reaksi sukses
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply('Terjadi kesalahan saat menghubungi server Live3D AI.');
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }
    }
};
