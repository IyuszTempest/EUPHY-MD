/**
 * Plugin: Kuroyami AI Chatbot (Interactive Version) 🎀
 * Deskripsi: Chatbot AI dengan System Instruction Ketat & Auto-Respond
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inisialisasi Google AI dengan API Key global kamu
const genAI = new GoogleGenerativeAI(global.gemini);
const TRIGGER = ['euphy'];

// Penampung status saklar & history chat biar ga hilang setelah restart
global._kuroStatus = global._kuroStatus ?? true;
global._kuroHistory = global._kuroHistory ?? new Map();

// --- [ SYSTEM PROMPT SAKTI SI "AKU" ] ---
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
8. KATA KUNCI KERAMAT: Kata "Euphy" dan "Euphylia Magenta" adalah kata keramat yang dilarang keras untuk kamu tulis atau sebutkan dalam kondisi apa pun kecuali orang memangilmu kuro itu kamu sapa aja tapi janagn menyebutkan namamu!`;

module.exports = {
    command: ['euphy'],
    category: 'ai',
    noPrefix: true,

    call: async (conn, m, { text }) => {
        let cmd = text?.toLowerCase().trim();
        if (cmd === 'on') {
            global._kuroStatus = true;
            return m.reply('> Aku udh aktif nih, Siap nemenin kamu!');
        }
        if (cmd === 'off') {
            global._kuroStatus = false;
            return m.reply('> Bye');
        }
        m.reply(`Status: ${global._kuroStatus ? 'AKTIF ✅' : 'NONAKTIF 🔴'}\nGunakan *.euphy on* atau *.euphy off*`);
    },

    handleMessage: async (conn, m) => {
        if (!m || !m.chat) return;

        const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
        if (m.sender === botJid || m.fromMe) return;

        if (!global._kuroStatus) return;

        const text = m.text?.trim();
        if (!text) return;

        const isGroup = m.chat.endsWith('@g.us');
        if (isGroup) {
            const isMention = (m.mentionedJid && m.mentionedJid.includes(botJid)) || 
                              TRIGGER.some(t => text.toLowerCase().includes(t));
            const isReply = m.quoted && m.quoted.fromMe;
            if (!isMention && !isReply) return;
        }

        if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;

        try {
            await conn.sendPresenceUpdate('composing', m.chat);

            const model = genAI.getGenerativeModel({ 
                model: 'gemini-3.1-flash-lite',
                systemInstruction: SYSTEM_PROMPT 
            });
            
            if (!global._kuroHistory.has(m.chat)) {
                global._kuroHistory.set(m.chat, []);
            }
            const history = global._kuroHistory.get(m.chat);

            const chat = model.startChat({ history });
            const result = await chat.sendMessage(text);
            const response = result.response.text();

            if (response) {
                await conn.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
                
                history.push(
                    { role: 'user', parts: [{ text }] }, 
                    { role: 'model', parts: [{ text: response }] }
                );
                
                if (history.length > 14) history.splice(0, 2);
            }
        } catch (e) {
            console.error('[Error]:', e);
        }
    }
};
