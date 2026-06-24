/**
 * Plugin: AI Chatbot v3.3 (Dynamic Agent Command Executor - Strictly Owner Only via LID) 🎀
 * Fitur: Auto-respond khusus Owner (Iyus) menggunakan global.lidowner, session history,
 * membaca media secara multimodal, dan otomatis mengeksekusi modul plugin bot secara dinamis.
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
const TRIGGER_REGEX = /\beuphy\b/i;
global._euphyHistory = global._euphyHistory ?? new Map();
global._euphyExecutedMessages = global._euphyExecutedMessages ?? new Set();

const genAI = new GoogleGenerativeAI(global.gemini);

// ===============================
// DYNAMIC PLUGIN READER HELPER
// ===============================
function getActiveCommands() {
  const activeCmds = new Set();

  if (global.plugins && typeof global.plugins === 'object') {
    for (let filename in global.plugins) {
      const plugin = global.plugins[filename];
      if (!plugin || plugin.disabled) continue;
      
      if (plugin.command) {
        if (Array.isArray(plugin.command)) {
          plugin.command.forEach(cmd => {
            if (typeof cmd === 'string') activeCmds.add(cmd);
          });
        } else if (typeof plugin.command === 'string') {
          activeCmds.add(plugin.command);
        }
      }
    }
  }

  if (global.commands && Array.isArray(global.commands)) {
    global.commands.forEach(cmd => {
      if (typeof cmd === 'string') activeCmds.add(cmd);
    });
  } else if (global.commands && typeof global.commands === 'object') {
    Object.keys(global.commands).forEach(cmd => activeCmds.add(cmd));
  }

  if (activeCmds.size === 0) {
    return ['play', 'video', 'tiktok', 'ig', 'ytmp4', 'ytmp3', 'pinterest', 'lirik', 'google', 'menu', 'sticker', 'nulis', 'fbdl'];
  }

  return Array.from(activeCmds);
}

// ===============================
// OTHER HELPERS
// ===============================
function isOwner(sender) {
  if (!sender) return false;
  
  const lid = global.lidowner;
  if (!lid) return false;

  const cleanSender = sender.split(':')[0].split('@')[0].replace(/[^0-9a-zA-Z]/g, '');
  const cleanLid = lid.split(':')[0].split('@')[0].replace(/[^0-9a-zA-Z]/g, '');

  return cleanSender === cleanLid || sender === lid;
}

function initUserSession(sender) {
  let user = global.db?.data?.users?.[sender];
  if (!user) {
    if (global.db?.data?.users) {
      global.db.data.users[sender] = {
        name: 'User',
        registered: false,
        premium: false,
        premiumTime: 0,
        afk: -1,
        afkReason: '',
        euphy: {
          session: [],
          lastUsed: 0
        }
      };
      user = global.db.data.users[sender];
    } else {
      user = { euphy: { session: [], lastUsed: 0 } };
    }
  }
  
  if (!user.euphy) {
    user.euphy = { session: [], lastUsed: 0 };
  }
  
  return user;
}

function getQuotedInfo(m, conn) {
  if (!m.quoted) return null;
  const text = m.quoted.text || m.quoted.caption || m.quoted.conversation || "";
  const sender = m.quoted.sender || "";
  const mime = (m.quoted.msg || m.quoted).mimetype || "";
  
  let senderName = "User";
  if (sender) {
    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (sender === botJid) {
      senderName = "Kamu (euphy)";
    } else {
      senderName = isOwner(sender) ? "Iyus" : "User";
    }
  }
  
  return { text, sender, senderName, mime };
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

function cleanFile(file) {
  try { fs.unlinkSync(file); } catch {}
}

// ===============================
// CORE AI ENGINE (GEMINI)
// ===============================
async function getAIResponse(chatId, query, sender, conn, m, mediaData = null) {
  const now = moment().tz("Asia/Jakarta");
  const timeContext = `Hari: ${now.format("dddd")}, Tanggal: ${now.format("D MMMM YYYY")}, Jam: ${now.format("HH.mm")} WIB`;
  
  const registeredCommands = getActiveCommands();

  const systemPrompt = `Kamu adalah Euphylia Magenta yang angun dan malu malu.
Kepribadian: Santai, hangat, disiplin, sedikit manja juga. Kamu seorang teman dekat sekaligus asisten AI. [WAKTU SEKARANG]: ${timeContext}

${userRoleContext}

[ATURAN KETAT CARA BICARA - WAJIB DIPATUHI]:
1. Gunakan Bahasa Indonesia santai anak muda sekarang tapi sopan (seperti aku, kamu, dll). Jangan gunakan bahasa baku/formal.
2. Bicara seperti orang normal. Jangan pernah memulai kalimat dengan menyebut namamu sendiri. Cukup gunakan kata "aku".
3. Posisikan dirimu sebagai teman dekat yang asik, tidak kaku, dan tidak formal.
4. Gunakan emoji secukupnya untuk mempermanis ekspresi obrolanmu.
5. Jawab dengan singkat, padat, dan selalu nyambung dengan konteks pembicaraan saat ini.
6. DILARANG KERAS menggunakan markdown (seperti **, *, _, \`), tag, atau format teks tebal/miring/kode apa pun. Tulis teks biasa saja polosan.
7. Jika ada yang menanyakan namamu, JANGAN PERNAH sebut nama asli atau inisialmu secara langsung. Isengin saja mereka.
8. KATA KERAMAT: Kata "Euphy" adalah kata keramat yang dilarang keras untuk kamu tulis atau sebutkan dalam kondisi apa pun kecuali orang memangilmu, kamu boleh menyapa mereka tetapi JANGAN menyebutkan atau menulis kata "Euphy"!
9. Jika ada yang nanya siapa yang membuat kamu atau owner kamu, bilangkan saja ${global.nameowner}.

[PANDUAN EKSEKUSI PERINTAH BOT DINAMIS - HARUS TEPAT]:
Kamu memiliki kemampuan luar biasa untuk menjalankan fitur/perintah bot WhatsApp demi membantu user.
Berikut adalah daftar perintah bot asli yang saat ini terpasang dan aktif di sistem kami:
[ ${registeredCommands.map(c => `.${c}`).join(', ')} ]

Jika user meminta bantuan, mencari informasi, mengunduh file, atau melakukan tindakan fungsional, analisis keinginan mereka dengan seksama:
1. Cocokkan keinginan user dengan daftar perintah aktif di atas yang memiliki kemiripan fungsi paling mendekati.
2. Jika ada perintah yang cocok, berikan respons percakapan yang manis dan ramah terlebih dahulu untuk mengonfirmasi tindakanmu.
3. Di baris PALING AKHIR respons kamu, kamu WAJIB menuliskan format eksekusi persis: ||EXECUTE: .[nama_perintah_terpilih] [argumen/parameter]||
   * Contoh: Jika user meminta "cariin gambar pemandangan", dan di list ada ".pinterest", tulis di akhir: ||EXECUTE: .pinterest pemandangan||
   * Contoh: Jika user meminta "euphy setel lagu kawaikute gomen", dan di list ada ".play", tulis di akhir: ||EXECUTE: .play kawaikute gomen||
   * Contoh: Jika user mengirim gambar/video/stiker (atau membalas salah satunya) dan bilang "buat stiker ya" atau "jadikan stiker", dan di list ada ".sticker", tulis di akhir: ||EXECUTE: .sticker||
4. Jika keinginan user tidak dapat dicocokkan dengan perintah aktif di atas, atau jika user hanya mengobrol/curhat biasa, JANGAN gunakan format eksekusi tersebut.`;

  if (!global._euphyHistory.has(chatId)) {
    global._euphyHistory.set(chatId, []);
  }
  const history = global._euphyHistory.get(chatId);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.1-flash-lite',
    systemInstruction: systemPrompt
  });

  const chat = model.startChat({ history });
  let promptPayload = "";
  const quotedInfo = getQuotedInfo(m, conn);
  if (quotedInfo) {
    if (quotedInfo.text) {
      promptPayload += `\n[Konteks Reply ke ${quotedInfo.senderName}]: "${quotedInfo.text}"\n`;
    } else if (quotedInfo.mime) {
      promptPayload += `\n[Konteks Reply ke ${quotedInfo.senderName}]: (Mencoba membalas berkas media berjenis ${quotedInfo.mime})\n`;
    }
  }

  promptPayload += `User: ${query.replace(/euphy/ig, "").trim()}`;
  let result;
  if (mediaData) {
    const mediaContextText = `\n[INFO MEDIA]\nUser melampirkan file media (${mediaData.mime}). Silakan baca, dengar, atau analisis isinya lalu jawab pesan user dengan mengaitkannya secara alami.\n`;
    
    result = await chat.sendMessage([
      { inlineData: { data: mediaData.base64, mimeType: mediaData.mime } },
      { text: mediaContextText + promptPayload }
    ]);
  } else {
    result = await chat.sendMessage(promptPayload);
  }

  let responseText = result.response.text();

  if (responseText) {
    responseText = responseText.replace(/[\*_`~]/g, '');
    
    history.push(
      { role: 'user', parts: [{ text: query }] },
      { role: 'model', parts: [{ text: responseText }] }
    );
    if (history.length > 14) history.splice(0, 2); 
  }

  return responseText;
}

// ===============================
// PLUGIN MODULE EXPORTS
// ===============================
module.exports = {
  command: ['reseteuphy'],
  category: 'ai',
  owner: true, 
  noPrefix: true,

  call: async (conn, m) => {
    global._euphyHistory.delete(m.sender);
    return m.reply("Memori obrolan kita berdua sudah direset ya! Yuk mari mulai chat baru lagi.");
  },

  handleMessage: async (conn, m) => {
    if (!m || !m.chat) return;

    const sender = m.sender || m.key?.participant || m.key?.remoteJid || "";

    if (!isOwner(sender)) return;

    const msgId = m.key?.id || "";
    if (msgId.startsWith('euphy_EXEC_') || global._euphyExecutedMessages.has(msgId)) {
      return;
    }

    const botJid = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
    if (sender === botJid || m.fromMe) return;

    const text = (m.text || m.caption || "").trim();
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!text && !mime) return;

    if (/^[°•π÷×¶∆£¢€¥®™✓_=|~!?@#$%^&.\-+*\/]/.test(text)) return;
    if (/^reseteuphy$/i.test(text)) return;

    const user = initUserSession(sender);

    const isGroup = m.chat.endsWith('@g.us');
    const isReplyToBot = m.quoted && m.quoted.sender === botJid;
    const isMention = m.mentionedJid && m.mentionedJid.includes(botJid);
    const hasTrigger = TRIGGER_REGEX.test(text);

    // --- TRIGGER LOGIC ---
    let shouldRespond = false;
    if (isGroup) {
      shouldRespond = hasTrigger || isMention || isReplyToBot;
    } else {
      shouldRespond = true;
    }

    if (!shouldRespond) return;

    try {
      await conn.sendPresenceUpdate('composing', m.chat);

      let mediaData = null;
      if (mime && /image|video|audio|webp/i.test(mime)) {
        try {
          const media = await q.download();
          const file = await saveTemp(media, mime);
          const base64 = fs.readFileSync(file).toString("base64");
          mediaData = { base64, mime };
          cleanFile(file);
        } catch (err) {
          console.error("Gagal mendownload berkas media:", err);
        }
      }

      const response = await getAIResponse(m.chat, text, sender, conn, m, mediaData);

      if (response) {
        user.euphy.lastUsed = Date.now();
        user.euphy.session.push({ role: 'user', text });
        user.euphy.session.push({ role: 'assistant', text: response });
        if (user.euphy.session.length > 20) user.euphy.session.splice(0, 2);

        let cleanResponse = response.trim();
        let executeCommand = null;
        const executeRegex = /\|\|EXECUTE:\s*([^\s|]+(?:\s+[^\s|]+)*)\s*\|\|/;
        const match = cleanResponse.match(executeRegex);

        if (match) {
          executeCommand = match[1].trim();
          cleanResponse = cleanResponse.replace(executeRegex, "").trim();
        }

        await conn.sendMessage(m.chat, { text: cleanResponse }, { quoted: m });

        if (executeCommand) {
          m.key.id = 'euphy_EXEC_' + Math.random().toString(36).substring(2, 11).toUpperCase();
          global._euphyExecutedMessages.add(m.key.id);

          m.text = executeCommand;
          m.body = executeCommand;

          if (m.message) {
            const type = Object.keys(m.message)[0];
            if (type === 'imageMessage') {
              m.message.imageMessage.caption = executeCommand;
            } else if (type === 'videoMessage') {
              m.message.videoMessage.caption = executeCommand;
            } else if (type === 'documentMessage') {
              m.message.documentMessage.caption = executeCommand;
            } else {
              m.message = {
                conversation: executeCommand
              };
            }
          }

          if (m.msg) {
            if (typeof m.msg === 'string') m.msg = executeCommand;
            else {
              m.msg.text = executeCommand;
              m.msg.caption = executeCommand;
            }
          }

          conn.ev.emit('messages.upsert', {
            type: 'notify',
            messages: [m]
          });
        }
      }
    } catch (e) {
      console.error('[Error Inside AI HandleMessage]:', e);
    }
  }
};
