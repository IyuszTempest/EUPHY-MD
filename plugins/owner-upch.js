/**
 * Plugin: Up Saluran (Direct Buffer Safe Version) 🎀
 * Fitur: Direct Media Buffer Only, Newsletter Metadata (Clean Style)
 */

module.exports = {
    command: ['upch'],
    category: 'owner',
    noPrefix: true,
    owner: true,
    call: async (conn, m, { text, command, usedPrefix }) => {
        await conn.sendMessage(m.chat, { react: { text: '🎀', key: m.key } });

        const idsal = global.idch
        const contentText = text?.trim();

        const ctx = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: idsal,
                serverMessageId: 20,
                newsletterName: global.namech
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
                    // FIX TOTAL: Kirim langsung buffernya, dijamin ga bakal abu-abu lagi!
                    await conn.sendMessage(idsal, { image: media, caption: contentText || '', contextInfo: ctx });
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
            await m.reply('> Waduh, gagal kirim ke saluran. Coba cek apakah bot sudah jadi admin di saluran tersebut.');
        }
    }
};
