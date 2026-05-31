/**
 * AI Labs - Text to Image/Video 🤖✨
 * Feature: Cipher Decryption & Hybrid Generation
 */

const axios = require('axios');
const FormData = require('form-data');

const aiLabs = {
    api: {
        base: 'https://text2video.aritek.app',
        endpoints: { text2img: '/text2img', generate: '/txt2videov3', video: '/video' }
    },
    setup: {
        cipher: 'hbMcgZLlzvghRlLbPcTbCpfcQKM0PcU0zhPcTlOFMxBZ1oLmruzlVp9remPgi0QWP0QW',
        dec(text, shift) {
            return [...text].map(c =>
                /[a-z]/.test(c) ? String.fromCharCode((c.charCodeAt(0) - 97 - shift + 26) % 26 + 97) :
                /[A-Z]/.test(c) ? String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65) : c
            ).join('');
        }
    },
    generate: async (prompt, type = 'image') => {
        const token = aiLabs.setup.dec(aiLabs.setup.cipher, 3);
        if (type === 'image') {
            const form = new FormData();
            form.append('prompt', prompt);
            form.append('token', token);
            const res = await axios.post(aiLabs.api.base + aiLabs.api.endpoints.text2img, form, {
                headers: { ...form.getHeaders(), 'user-agent': 'NB Android/1.0.0' }
            });
            return res.data;
        } else {
            const payload = { deviceID: "euphy" + Math.random(), isPremium: 1, prompt, used: [], versionCode: 59 };
            const res = await axios.post(aiLabs.api.base + aiLabs.api.endpoints.generate, payload, {
                headers: { authorization: token, 'user-agent': 'NB Android/1.0.0' }
            });
            return res.data;
        }
    }
};

module.exports = {
    command: ['ailabs'],
    category: 'ai',
    noPrefix: true,
    call: async (conn, m, { text, command }) => {
        if (!text) return m.reply(`Mau buat apa hari ini? ✨\nContoh: *.ailabs girl in kimono, cyber city background*`);

        await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });

        try {
            // Default ke image jika command t2i, atau video jika t2v
            let type = command === 't2v' ? 'video' : 'image';

            const result = await aiLabs.generate(text, type);

            if (type === 'image') {
                if (!result.url) throw new Error("Gagal mendapatkan URL gambar.");
                await conn.sendMessage(m.chat, { 
                    image: { url: result.url }, 
                    caption: `> AI Labs Image` 
                }, { quoted: m });
            } else {
                // Untuk video, biasanya API Aritek mengembalikan ID/Key untuk dicek berkala
                // Jika langsung memberikan URL, kita kirim videonya
                if (result.url || result.video_url) {
                    await conn.sendMessage(m.chat, { 
                        video: { url: result.url || result.video_url }, 
                        caption: `╭━━〔 ⛩️ *𝙰𝙸 𝙻𝙰𝙱𝚂 𝚅𝙸𝙳𝙴𝙾* ⛩️ 〕━━┓\n┃ 📝 *Prompt:* ${text}\n┗━━━━━━━━━━━━━┛` 
                    }, { quoted: m });
                } else {
                    m.reply(`✅ Request video terkirim!\n*Key:* ${result.key || 'Cek manual'}\n_Gunakan command khusus buat cek status video jika perlu._`);
                }
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`❌ *Error:* ${e.message}`);
        }
    }
};
