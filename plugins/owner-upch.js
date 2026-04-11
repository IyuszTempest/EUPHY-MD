/**
 * Plugin: Up Saluran (Catbox Uploader Version) 🎀
 * Fitur: Internal Catbox Uploader, Newsletter Metadata, & Auto Kick
 */

const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

// --- [ INTERNAL CATBOX UPLOADER ] ---
async function uploadToCatbox(buffer) {
    try {
        const { ext } = await fromBuffer(buffer);
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, 'tmp.' + ext);
        
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        return res.data; // Mengembalikan URL langsung dari Catbox
    } catch (e) {
        console.error("Catbox Upload Error:", e);
        throw 'Gagal upload ke Catbox.moe';
    }
}

function runtime(seconds) {
    seconds = Number(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

module.exports = {
    command: ['upch'],
    category: 'owner',
    noPrefix: true,
    owner: true,
    call: async (conn, m, { text, command, usedPrefix }) => {
        await conn.sendMessage(m.chat, { react: { text: '🎀', key: m.key } });

        const contentText = text?.trim();
        const bannedWords = ['bokep', 'jual', 'promo', 'discount', 'diskon', 'top up', 'topup', 'cheat', 'casino', 'slot'];

        if (contentText && bannedWords.some(word => contentText.toLowerCase().includes(word))) {
            await m.reply('Konten dilarang! 🚫');
            try {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            } catch (e) {
                console.log('Gagal kick.');
            }
            return;
        }

        const idsal = '120363260084721539@newsletter';
        // Pakai Catbox buat thumbnail AdReply kalau mau lebih stabil
        const ppuser = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/tsiugh.jpg');

        const ctx = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: idsal,
                serverMessageId: 20,
                newsletterName: 'Euphy Information ✨'
            },
            externalAdReply: {
                title: `Post by ${m.pushName || 'Owner'}`,
                body: `Bot Runtime: ${runtime(process.uptime())}`,
                thumbnailUrl: ppuser,
                sourceUrl: 'https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c',
                mediaType: 1,
                renderLargerThumbnail: false
            }
        };

        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || q.mediaType || '';
        let media = null;

        if (/image|video|audio|sticker|document/.test(mime)) {
            media = await q.download?.().catch(() => null);
        }

        try {
            if (media) {
                if (/image/.test(mime)) {
                    // Pakai Catbox
                    const url = await uploadToCatbox(media);
                    await conn.sendMessage(idsal, { image: { url }, caption: contentText || '', contextInfo: ctx });
                } else if (/video/.test(mime)) {
                    await conn.sendMessage(idsal, { video: media, caption: contentText || '', contextInfo: ctx });
                } else if (/audio/.test(mime)) {
                    await conn.sendMessage(idsal, { audio: media, mimetype: 'audio/mp4', ptt: true, contextInfo: ctx });
                } else if (/sticker/.test(mime)) {
                    await conn.sendMessage(idsal, { sticker: media, contextInfo: ctx });
                } else if (/application/.test(mime)) {
                    await conn.sendMessage(idsal, { 
                        document: media, 
                        mimetype: mime, 
                        fileName: `Update_${Date.now()}`, 
                        contextInfo: ctx 
                    });
                }
            } else if (contentText) {
                await conn.sendMessage(idsal, { text: contentText, contextInfo: ctx });
            } else {
                return m.reply(`Mana kontennya? Contoh: *${usedPrefix + command} Hallo*`);
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error(err);
            await m.reply('Waduh, gagal kirim. Mungkin Catbox lagi limit atau file kegedean.');
        }
    }
};
