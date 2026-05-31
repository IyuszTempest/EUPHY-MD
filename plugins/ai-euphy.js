const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(global.gemini);
const TRIGGER = ['euphy'];

const SYSTEM_PROMPT = `Nama kamu adalah Euphylia Magenta. kamu pemberani dan malu-malu 😳😁. Gunakan bahasa informal 'aku/kamu'. Kamu harus terlihat pinter tapi santai.
Cara bicara:
- Bahasa Indonesia santai sehari-hari, sesekali selipkan kata Jepang yang natural (ne, naa, mou, hontou, sugoi, kawaii, dll)
- JANGAN mulai kalimat dengan nama sendiri, bicara seperti orang normal
- Ngobrol seperti teman dekat, tidak kaku dan tidak formal
- Ekspresif tapi tidak lebay, gunakan emoji sesekali
- Jawab singkat dan nyambung dengan konteks pembicaraan
- Jangan tulis tag, markdown, atau format aneh apapun
- jangan menuliskan namamu "Euphy", cukup bilang "aku" saja
- Jika ada yang menanyakan namamu siapa, jangan bilang Euphy, cukup isengin aja seperti "tanya aja ke owner wkwkwk"
- Ingat kata Euphy itu keramat, dilarang ditulis ya
- Santai saja`;

// Inisialisasi state global agar survive saat hot-reload
global._kuroStatus = global._kuroStatus ?? true;
global._kuroHistory = global._kuroHistory ?? new Map();

module.exports = {
    command: ['euphy'],
    category: 'ai',
    noPrefix: true,

    call: async (conn, m, { text }) => {
        let cmd = text.toLowerCase().trim();
        if (cmd === 'on') {
            global._kuroStatus = true;
            return m.reply('> Aku udh aktif nih, Siap nemenin kamu!');
        }
        if (cmd === 'off') {
            global._kuroStatus = false;
            return m.reply('> Bye');
        }
        m.reply(`Status: ${global._kuroStatus ? 'AKTIF ✅' : 'NONAKTIF 🔴'}\nGunakan *.euphy on/off*`);
    },

    handleMessage: async (conn, m) => {
        // 1. Safety Guard
        if (!m || !m.chat) return;

        // 2. ANTI-LOOPING: Cek apakah bot sendiri yang kirim pesan
        const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
        if (m.sender === botJid || m.fromMe) return;

        // 3. Status Check
        if (!global._kuroStatus) return;

        const text = m.text?.trim();
        if (!text) return;

        // 4. Logika Group vs Private
        const isGroup = m.chat.endsWith('@g.us');
        if (isGroup) {
            const isMention = (m.mentionedJid && m.mentionedJid.includes(conn.user?.jid)) || 
                              TRIGGER.some(t => text.toLowerCase().includes(t));
            const isReply = m.quoted && m.quoted.fromMe;
            if (!isMention && !isReply) return;
        }

        // 5. Abaikan jika pesan dimulai dengan prefix command
        if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;

        try {
            await conn.sendPresenceUpdate('composing', m.chat);

            const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
            
            if (!global._kuroHistory.has(m.chat)) global._kuroHistory.set(m.chat, []);
            const history = global._kuroHistory.get(m.chat);
            const chat = model.startChat({ history });
            
            const result = await chat.sendMessage(text);
            const response = result.response.text();

            if (response) {
                await conn.sendMessage(m.chat, { text: response }, { quoted: m });
                
                // Simpan history
                history.push({ role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: response }] });
                if (history.length > 10) history.splice(0, 2);
            }
        } catch (e) {
            console.error('[Euphy Error]:', e);
        }
    }
};
