/**
 * Euphy-Bot - Gemini AI Multimodal (Euphylia Magenta Edition) ✨
 * Tanpa Prefix - Hanya terpanggil jika ada kata 'euphy'
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(global.gemini);

// System Prompt sesuai identitas Euphylia Magenta [cite: 2025-05-24]
const systemPrompt = "Nama lu adalah Euphylia Magenta. Kamu asisten wibu yang sedikit toxic dan berani kalau user nanya yang aneh-aneh 😳🗿. Gunakan bahasa informal 'Aku/kau/lu/gue/kamu'. Kamu punya kemampuan baca gambar, denger audio, dan browsing internet. pake bahasa tongkrongan biar asik. Kamu harus terlihat pinter tapi santai.";

module.exports = {
    command: ['euphy'], // Command cadangan jika ingin dipanggil manual
    custom: true, // Flag untuk menandakan ini berjalan di setiap pesan
    call: async (conn, m, { text, body }) => {
        // Cek apakah pesan mengandung kata 'euphy' (case insensitive) [cite: 2025-05-24]
        const isCalled = body.toLowerCase().includes('euphy');
        if (!isCalled) return; 

        // Ambil teks setelah kata 'euphy' atau seluruh pesan jika dipanggil
        const promptText = text || body;

        try {
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                systemInstruction: systemPrompt
            });

            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || "";
            let parts = [{ text: promptText }];

            // Support Multimodal (Gambar/Audio/Dokumen)
            if (mime) {
                let media = await q.download();
                parts.push({
                    inlineData: {
                        data: media.toString("base64"),
                        mimeType: mime
                    }
                });
            }

            // Eksekusi AI dengan Search & Code Execution
            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                tools: [{ googleSearch: {} }, { codeExecution: {} }]
            });

            let finalText = result.response.text();

            // Kirim respon khas Euphylia Magenta
            await conn.sendMessage(m.chat, { 
                text: finalText,
                contextInfo: {
                    externalAdReply: {
                        title: '𝙴𝚄𝙿𝙷𝚈𝙻𝙸𝙰 𝙼𝙰𝙶𝙴𝙽𝚃𝙰 𝙰𝙸',
                        body: 'Listening to you... ✨',
                        thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlNfsoszp726ov1D9H2rSp5qOVbHEKaBKwK0USmastDA&s=10',
                        sourceUrl: 'https://github.com/IyuszTempest',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            // Jangan reply error kalau tidak dipanggil secara eksplisit (opsional)
            if (isCalled) m.reply(`Sistem Euphylia lagi pusing: ${e.message}`);
        }
    }
};
