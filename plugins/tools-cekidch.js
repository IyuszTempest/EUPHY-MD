/** * Plugin: Check Channel/Newsletter ID 📢⛩️
 * Deskripsi: Mendeteksi ID unik dari Channel WhatsApp via Link atau Reply, plus tombol Copy ID.
 * Style: Clean & Minimalist ✨
 * Adopted to Euphylia Magenta Bot Structure
 */

const { proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['cekidch', 'idch', 'channelid'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, text }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: '📢', key: m.key } });

            let channelId = null;
            
            const regexCh = /(https?:\/\/)?(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)/i;
            const match = (text || m.text || '').match(regexCh);

            if (match && match[3]) {
                const inviteToken = match[3];
                try {
                    const res = await conn.newsletterMetadata("invite", inviteToken);
                    if (res && res.id) {
                        channelId = res.id;
                    }
                } catch (err) {
                    console.error("Gagal fetch metadata via link:", err);
                    return m.reply("❌ *Link Expired / Invalid!*\nBot tidak dapat mengambil data dari link channel tersebut. Pastikan link-nya benar ya.");
                }
            }

            if (!channelId && m.quoted) {
                const msgType = Object.keys(m.quoted.message || {})[0];
                const contextInfo = m.quoted.contextInfo || m.quoted.message?.[msgType]?.contextInfo;

                if (contextInfo?.forwardedNewsletterMessageInfo) {
                    channelId = contextInfo.forwardedNewsletterMessageInfo.newsletterJid;
                } else if (m.quoted.chat && m.quoted.chat.endsWith('@newsletter')) {
                    channelId = m.quoted.chat;
                }
            }

            if (!channelId && m.chat.endsWith('@newsletter')) {
                channelId = m.chat;
            }

            if (!channelId || !channelId.endsWith('@newsletter')) {
                return m.reply(
                    "*Cara Pakai:*\n" +
                    "• Kirim link channel langsung: `idch https://whatsapp.com/channel/xxx`\n" +
                    "• Atau *reply* pesan terusan dari channel tersebut dengan mengetik `idch`."
                );
            }
            
            let caption = `🌸 *CHANNEL ID FOUND* 🌸\n\n` +
                          `📌 *ID:* \`${channelId}\`\n\n` +
                          `_Silakan klik tombol di bawah untuk menyalin ID channel ini secara otomatis ya, Yus!_`;

            const buttons = [
                {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Salin ID Channel 📋",
                        copy_code: channelId
                    })
                }
            ];

            const msg = generateWAMessageFromContent(
                m.chat,
                {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                header: proto.Message.InteractiveMessage.Header.create({
                                    title: 'Cek ID Channel',
                                    hasMediaAttachment: false
                                }),
                                body: proto.Message.InteractiveMessage.Body.create({
                                    text: caption
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: global.wm || 'Euphylia Magenta'
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    messageVersion: 1,
                                    buttons: buttons
                                }),
                                contextInfo: { 
                                    mentionedJid: [m.sender],
                                    forwardingScore: 999,
                                    isForwarded: true
                                }
                            })
                        }
                    }
                },
                { userJid: conn.user.id, quoted: m }
            );

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error("Error in CekID:", e);
            m.reply("❌ Terjadi kesalahan saat mendeteksi ID Channel.");
        }
    }
};
