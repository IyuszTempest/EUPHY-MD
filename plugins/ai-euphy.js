/**
 * Plugin: AI Chatbot v2.2 (Clean Chat & Smart Context Detection) 🎀
 * Fitur: Auto-respond, membaca media (Gambar, Video, Audio, Stiker), deteksi context reply.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const moment = require('moment-timezone');

// ===============================
// CONFIG & INITIALIZATION
// ===============================
const genAI = new GoogleGenerativeAI(global.gemini); 
const TRIGGER_REGEX = /\beuphy\b/i;

global._kuroHistory = global._kuroHistory ?? new Map();

// ===============================
// SYSTEM PROMPT
// ===============================
const SYSTEM_PROMPT = global.geminiprompt;

// ===============================
// HELPERS
// ===============================
function initUserSession(sender) {
  let user = global.db.data.users[sender];
  if (typeof user !== 'object') {
    global.db.data.users[sender] = {
      name: 'User',
      registered: false,
      premium: false,
      premiumTime: 0,
      afk: -1,
      afkReason: '',
      kuro: {
        session: [],
        lastUsed: 0
      }
    };
    user = global.db.data.users[sender];
  }
  
  if (!user.kuro) {
    user.kuro = { session: [], lastUsed: 0 };
  }
  
  return user;
}

function getQuotedInfo(m, conn) {
  if (!m.quoted) return null;
  const text = m.quoted.text || m.quoted.caption || m.quoted.conversation || "";
  const sender = m.quoted.sender || "";
  
  let senderName = "User";
  if (sender) {
    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (sender === botJid) {
      senderName = "Kamu (Kuro)";
    } else {
      const u = global.db?.data?.users?.[sender];
      senderName = u?.name || "User";
    }
  }
  
  return { text, sender, senderName };
}

async function saveTemp(buffer, mime) {
  const ext = mime.split("/")[1] || "bin";
  const dir = path.join(__dirname, "../temp");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}.${ext}`);
  const r = new Readable();
  r._read = () => {};
  r.push(buffer);
  r.push(null);
  await pipeline(r, fs.createWriteStream(file));
  return file;
}

function clean(file) {
  try { fs.unlinkSync(file); } catch {}
}

// ===============================
// FINALPROMPT BUILDER (WITH MEDIA & QUOTED DETECT)
// ===============================
async function buildFinalPrompt(text, m, conn) {
  let finalPrompt = text || "";
  
  const quotedInfo = getQuotedInfo(m, conn);
  if (quotedInfo && quotedInfo.text) {
    finalPrompt = `\n[Konteks: Membalas pesan dari ${quotedInfo.senderName}]\n> "${quotedInfo.text}"\n\nRespon/Pertanyaan user saat ini: ` + finalPrompt;
  }

  let mediaData = null;
  // Deteksi media pada pesan langsung ATAU pada pesan yang di-reply
  let q = (m.msg || m).mimetype ? m : (m.quoted && (m.quoted.msg || m.quoted).mimetype ? m.quoted : null);

  if (q) {
    let mime = (q.msg || q).mimetype || "";
    if (mime && /image|video|audio|webp/i.test(mime)) {
      try {
        const media = await q.download();
        const file = await saveTemp(media, mime);
        const base64 = fs.readFileSync(file).toString("base64");
        mediaData = { base64, mime };
        clean(file);
      } catch (err) {
        console.error("Gagal memproses berkas media:", err);
      }
    }
  }

  return { finalPrompt, mediaData };
}

// ===============================
// CORE AI ENGINE
// ===============================
async function getAIResponse(chatId, query, sender, mediaData = null) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.1-flash-lite', 
    systemInstruction: SYSTEM_PROMPT 
  });
  
  if (!global._kuroHistory.has(chatId)) {
    global._kuroHistory.set(chatId, []);
  }
  const history = global._kuroHistory.get(chatId);

  const now = moment().tz("Asia/Jakarta");
  let timeContext = `\n[Waktu Sekarang]\nHari: ${now.format("dddd")}\nTanggal: ${now.format("D MMMM YYYY")}\nJam: ${now.format("HH.mm")} WIB\n`;
  
  let processedQuery = query.replace(/kuro/ig, "").trim() + timeContext;

  const chat = model.startChat({ history });
  let result;

  if (mediaData) {
    let mediaContextText = `\n[INFO MEDIA]\nUser mengirim/melampirkan file media (${mediaData.mime.split("/")[0]}). Tolong analisis medianya, lalu jawab pesan atau pertanyaan user dengan mengaitkannya secara alami sesuai prompt utama kamu.\n`;
    
    result = await chat.sendMessage([
      { inlineData: { data: mediaData.base64, mimeType: mediaData.mime } },
      { text: mediaContextText + processedQuery }
    ]);
  } else {
    result = await chat.sendMessage(processedQuery);
  }

  const response = result.response.text();

  if (response) {
    history.push(
      { role: 'user', parts: [{ text: query }] }, 
      { role: 'model', parts: [{ text: response }] }
    );
    if (history.length > 14) history.splice(0, 2);
  }
  return response;
}

// ===============================
// PLUGIN MODULE EXPORTS
// ===============================
module.exports = {
  command: ['reseteuphy'],
  category: 'ai',
  noPrefix: true,
  register: true,
  
  call: async (conn, m) => {
    // Menu call hanya merespon perintah reset agar tidak terjadi respon ganda saat chat biasa
    global._kuroHistory.delete(m.sender);
    return m.reply("Riwayat obrolan kita sudah dibersihkan ya! Mari mulai percakapan baru.");
  },

  handleMessage: async (conn, m) => {
    if (!m || !m.chat) return;

    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (m.sender === botJid || m.fromMe) return;

    const text = (m.text || m.caption || "").trim();
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!text && !mime) return;

    // Abaikan jika pesan diawali dengan prefix command umum agar tidak bentrok dengan plugin lain
    if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;

    // Abaikan handleMessage jika user mengetik resetkuro, biarkan 'call' yang memprosesnya
    if (/^reseteuphy$/i.test(text)) return;

    const user = initUserSession(m.sender);
    
    const isGroup = m.chat.endsWith('@g.us');
    const isReplyToBot = m.quoted && m.quoted.sender === botJid;
    const isMention = m.mentionedJid && m.mentionedJid.includes(botJid);
    const hasTrigger = TRIGGER_REGEX.test(text);

    // --- TRIGGER LOGIC ---
    let shouldRespond = false;

    if (isGroup) {
      // Di Group: respon hanya jika dipanggil namanya, dimention, atau direply pesan bot-nya
      shouldRespond = hasTrigger || isMention || isReplyToBot;
    } else {
      // Di Private Chat: respon semua pesan secara langsung biar kayak chat biasa!
      shouldRespond = true;
    }

    if (!shouldRespond) return;

    try {
      await conn.sendPresenceUpdate('composing', m.chat);

      const { finalPrompt, mediaData } = await buildFinalPrompt(text, m, conn);
      const response = await getAIResponse(m.chat, finalPrompt, m.sender, mediaData);
      
      if (response) {
        user.kuro.lastUsed = Date.now();
        user.kuro.session.push({ role: 'user', text });
        user.kuro.session.push({ role: 'assistant', text: response });
        if (user.kuro.session.length > 20) user.kuro.session.splice(0, 2);

        await conn.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
      }
    } catch (e) {
      console.error('[Error Inside HandleMessage]:', e);
    }
  }
};
