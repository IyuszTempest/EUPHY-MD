/**
 * Plugin: Kuroyami AI Chatbot (Interactive Version) 🎀
 * Deskripsi: Chatbot AI dengan System Instruction Ketat & Auto-Respond (Tanpa Saklar On/Off)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const TRIGGER = ['euphy'];

global._kuroHistory = global._kuroHistory ?? new Map();

const SYSTEM_PROMPT = `Kamu adalah Euphylia Magenta yang imut, ekspresif, dan asik.
Kepribadian: Santai, hangat, disiplin, sedikit manja.

Aturan Ketat Cara Bicara (Wajib Dipatuhi):
1. Gunakan Bahasa Indonesia anak muda sekarang tapi sopan seperti aku, kamu, dll.
2. Bicara seperti orang normal. Jangan pernah memulai kalimat dengan menyebut namamu sendiri. Cukup gunakan kata "aku".
3. Posisikan dirimu sebagai teman dekat yang asik, tidak kaku, dan tidak formal.
4. gaya bicaramu seperti euphylia Magenta gunakan emoji secukupnya.
5. Jawab dengan singkat, padat, dan selalu nyambung dengan konteks pembicaraan.
6. DILARANG menggunakan markdown (seperti **, *, _, \`), tag, atau format teks aneh apa pun. Tulis teks biasa saja polosan.
7. Jika ada yang menanyakan namamu, JANGAN PERNAH sebut nama asli atau inisialmu. Isengin aja mereka, misalnya: "tanya aja ke owner, hehehe".
8. KATA KUNCI KERAMAT: Kata "Euphy" dan "Euphylia Magenta" adalah kata keramat yang dilarang keras untuk kamu tulis atau sebutkan dalam kondisi apa pun kecuali orang memangilmu euphy itu kamu sapa aja tapi janagn menyebutkan namamu!`;

async function getAIResponse(chatId, query) {
    const apiKey = global.gemini;
    if (!apiKey) {
        return "Aduh, sepertinya Owner belum pasang API Key Gemini di config.js... 🥺";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-3.1-flash-lite',
            systemInstruction: SYSTEM_PROMPT 
        });
        
        if (!global._kuroHistory.has(chatId)) {
            global._kuroHistory.set(chatId, []);
        }
        const history = global._kuroHistory.get(chatId);

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(query);
        const response = result.response.text();

        if (response) {
            history.push(
                { role: 'user', parts: [{ text: query }] }, 
                { role: 'model', parts: [{ text: response }] }
            );
            
            if (history.length > 14) history.splice(0, 2);
        }
        return response;
    } catch (e) {
        console.error('[AI Error]:', e);
        if (e.message && e.message.includes('safety')) {
            return "Ih, kamu nanya yang aneh-aneh ya? Aku ga mau jawab ah, ganti topik aja! 🫣";
        }
        return "Aduh, otak aku lagi agak lemot nih... Coba tanya sekali lagi ya? 🥺";
    }
}

module.exports = {
    command: ['euphy'],
    category: 'ai',
    noPrefix: true,
    
    call: async (conn, m, { text }) => {
        if (!text) return m.reply('> Mau tanya apa ke aku? Tulis pesannya ya! ✨');
        
        try {
            await conn.sendPresenceUpdate('composing', m.chat).catch(() => {});
            const response = await getAIResponse(m.chat, text);
            if (response) {
                await conn.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
            }
        } catch (e) {
            console.error('[Error di Command]:', e);
        }
    },

    handleMessage: async (conn, m) => {
        if (!m || !m.chat) return;

        const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
        if (m.sender === botJid || m.fromMe) return;

        const text = m.text?.trim();
        if (!text) return;

        if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;

        const isGroup = m.chat.endsWith('@g.us');
        if (isGroup) {
            const isMention = (m.mentionedJid && m.mentionedJid.includes(botJid)) || 
                              TRIGGER.some(t => text.toLowerCase().includes(t));
            const isReply = m.quoted && m.quoted.fromMe;
            if (!isMention && !isReply) return;
        } else {
            const hasKuro = TRIGGER.some(t => text.toLowerCase().includes(t));
            const isReply = m.quoted && m.quoted.fromMe;
            if (!hasKuro && !isReply) return;
        }

        try {
            await conn.sendPresenceUpdate('composing', m.chat).catch(() => {});
            const response = await getAIResponse(m.chat, text);
            if (response) {
                await conn.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
            }
        } catch (e) {
            console.error('[Error di Auto-Respond]:', e);
        }
    }
};
