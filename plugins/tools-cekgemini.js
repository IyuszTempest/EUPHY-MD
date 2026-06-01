/** * Plugin Gemini API Quota Checker 🔑
 * Style: Clean & Minimalist Layout ✨
 * Adopted to Euphylia Magenta Bot Structure
 */

const axios = require('axios');

// API Key Gemini milikmu
const GEMINI_API_KEY = global.gemini; 

module.exports = {
    command: ['limitgemini', 'cekgemini'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix: _p }) => {
        try {
            // Berikan reaksi jam pasir biar interaktif ⏳
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
            
            // Set status mengetik (composing)
            await conn.sendPresenceUpdate('composing', m.chat);
            await m.reply('> ⏳ Mohon tunggu, Aku sedang mengecek kuota Gemini APInya');

            // Daftar model yang akan ditest ping & kuotanya
            const models = [
        { name: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
        { name: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash' },
        { name: 'gemini-2.0-flash',      label: 'Gemini 2.0 Flash' },
              ];

            const results = [];

            for (const model of models) {
                try {
                    const start = Date.now();
                    const res = await axios.post(
                        `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${GEMINI_API_KEY}`,
                        {
                            contents: [{ parts: [{ text: 'hi' }] }],
                            generationConfig: { maxOutputTokens: 5 }
                        },
                        { timeout: 10000 }
                    );

                    const ping = Date.now() - start;
                    results.push(`✅ *${model.label}*\nStatus: OK | Ping: ${ping}ms`);
                } catch (e) {
                    const code = e.response?.status;
                    const msg = e.response?.data?.error?.message || e.message;

                    if (code === 429) {
                        results.push(`⚠️ *${model.label}*\nStatus: QUOTA HABIS (429)`);
                    } else if (code === 400) {
                        results.push(`❌ *${model.label}*\nStatus: Model tidak tersedia`);
                    } else {
                        results.push(`❌ *${model.label}*\nStatus: Error ${code || '?'} — ${msg.slice(0, 50)}`);
                    }
                }
            }

            // Susun output dengan gaya Clean & Minimalist
            let textResult = `🔑 *GEMINI API STATUS* 🔑\n\n`;
            textResult += results.join('\n\n');
            textResult += `\n\n📌 *Key:* ...${GEMINI_API_KEY.slice(-6)}`;

            // Berikan reaksi sukses dan kirim hasilnya
            await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });
            await m.reply(textResult);

        } catch (e) {
            console.error('[CekLimit Error]', e.message);
            m.reply('❌ Gagal mengecek kuota: ' + e.message);
        }
    }
};
