/**
 * Lahelu Meme Random ✨
 * Fitur: Mengambil meme acak (Video/Gambar) dari rekomendasi Lahelu.
 */

const axios = require('axios');

const handleLahelu = async () => {
    try {
        const randomCursor = Math.floor(Math.random() * 50) + 1;
        const laheluApiUrl = `https://lahelu.com/api/post/get-recommendations?field=5&cursor=${randomCursor}`;
        
        // Pakai axios biar konsisten sama plugin lain ya Yus
        const { data } = await axios.get(laheluApiUrl);

        const postsWithMedia = data.postInfos.filter(post =>
            post.content && post.content.some(item => item.type === 1 || item.type === 4)
        );

        if (postsWithMedia.length === 0) throw new Error("Tidak ada media ditemukan");

        const randomPost = postsWithMedia[Math.floor(Math.random() * postsWithMedia.length)];
        const mediaItem = randomPost.content.find(item => item.type === 1 || item.type === 4);
        
        return {
            status: "success",
            title: randomPost.title,
            author: "IyuszTempest",
            media: {
                // Type 1 biasanya Image, Type 4 biasanya Video
                type: mediaItem.type === 4 ? "video" : "image",
                url: mediaItem.value.startsWith('http') ? mediaItem.value : `https://lahelu.com/media/${mediaItem.value}`
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    command: ['lahelu'],
    category: 'fun',
    noPrefix: true,
    call: async (conn, m) => {
        await conn.sendMessage(m.chat, { react: { text: '🤣', key: m.key } });

        try {
            const res = await handleLahelu();
            const { type, url } = res.media;

            let caption = `╭━━〔 ⛩️ *𝙻𝙰𝙷𝙴𝙻𝚄 𝙼𝙴𝙼𝙴* ⛩️ 〕━━┓\n`;
            caption += `┃ 📝 *Title:* ${res.title}\n`;
            caption += `┃ 🏮 *Source:* Lahelu.com\n`;
            caption += `┗━━━━━━━━━━━━━━┛\n`;
            caption += `_Lucu gak? Mwehehe..._`;

            await conn.sendMessage(m.chat, { 
                [type]: { url: url }, 
                caption: caption 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`❌ Gagal mengambil meme: ${e.message}`);
        }
    }
};
