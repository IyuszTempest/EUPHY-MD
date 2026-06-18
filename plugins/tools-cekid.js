/**
 * Plugin: Cek ID Owner & Bot 🤖👑
 * Fitur: Mengambil JID pengelola dan JID sistem bot yang sedang aktif.
 */

const { proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['cekid'],
    category: 'tools',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command }) => {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply("Daftar dulu di database!");

        await conn.sendMessage(m.chat, { react: { text: '🆔', key: m.key } });
        
        const targetId = m.sender;
        
        const buttons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Salin ID mu 📋",
                    copy_code: targetId
                })
            }
        ];
        
        let caption = `👤 *ID:* ${targetId}\n\n` +
                      `Gunakan ID di atas untuk keperluan konfigurasi script atau database.`;

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
                                title: '🪪 Cek ID Sistem',
                                hasMediaAttachment: false
                            }),
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: caption
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: global.wm
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
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};
