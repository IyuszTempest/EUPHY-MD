/** 
 * Updated Menu Euphylia Magenta - "The King of UI" Style
 * Feature: Single Select List Button (Native Flow)
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['menu', 'help', '?'],
    category: 'main',
    noPrefix: true, 
    call: async (conn, m, { usedPrefix: _p }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "🗿", key: m.key } });

            // 1. Inisialisasi Data
            let name = `@${m.sender.split`@`[0]}`;
            let uptime = clockString(process.uptime() * 1000);

            // 2. Daftar Kategori untuk List
            const allTags = {
                'anime': '🌸 Zona Wibu', 
                'ai': '🤖 Menu AI',
                'downloader': '📥 Menu Downloader',
                'economic': '💵 Menu Ekonomi Global',
                'fun': '😁 Menu Fun',
                'group': '👥 Menu Group',
                'game': '🎮 Menu Gaming', 
                'nsfw': '🔞 Zona +18',
                'tools': '🛠️ Menu Tools',
                'owner': '👑 Menu Owner',
                'main': '🐦 Menu Main'
            };

            // 3. Susun Rows untuk Button List
            let rows = [];
            for (let tag in allTags) {
                rows.push({
                    header: '',
                    title: allTags[tag],
                    description: `Klik untuk melihat fitur ${allTags[tag]}`,
                    id: `${_p}allmenu ${tag}` 
                });
            }

            let listMessage = {
                title: 'Open list!',
                sections: [{
                    title: 'List Menu',
                    highlight_label: 'Hot Menu 🔥',
                    rows: rows
                }]
            };

            // 4. Header & Body Text (Fixing the += error)
            let menuContent = `👤 *User:* ${name}\n`;
            menuContent += `🕒 *Uptime:* ${uptime}\n`;
            menuContent += `🔰 *App: WhatsApp*\n\n`;
            menuContent += `Silahkan pilih kategori menu pada tombol di bawah ini untuk melihat daftar perintah yang tersedia.`;

            // 5. Generate Message
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
                                    title: global.namebot,
                                    hasMediaAttachment: true,
                                    ...(await prepareWAMessageMedia({ image: { url: global.imgall} }, { upload: conn.waUploadToServer }))
                                }),
                                body: proto.Message.InteractiveMessage.Body.create({
                                    text: menuContent
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: global.wm
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    messageVersion: 1,
                                    buttons: [{
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify(listMessage) 
                                    }],
                                }),
                                contextInfo: { 
                                    mentionedJid: [m.sender],
                                    forwardingScore: 999,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: global.idch,
                                        serverMessageId: 143,
                                        newsletterName: `${global.namech} - Sistem Online`
                                    }
                                }
                            })
                        }
                    }
                },
                { userJid: conn.user.id, quoted: m }
            );

            // 6. Relay Message
            await conn.relayMessage(m.chat, msg.message, {
                messageId: msg.key.id,
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [{
                            tag: 'interactive',
                            attrs: { type: 'native_flow', v: '1' },
                            content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
                        }]
                    }
                ]
            });

        } catch (e) {
            console.error(e);
            m.reply(`Error Menu: ${e.message}`);
        }
    }
};

function clockString(ms) {
    if (isNaN(ms)) ms = 0;
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
