/**
 * Euphy-Bot - Get Plugin Tool ✨
 * Deskripsi: Mengambil isi kode file di folder plugins secara manual atau via Interactive List Button
 */

const fs = require('fs');
const path = require('path');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['gp', 'getplugin'],
    category: 'owner',
    owner: true,
    call: async (conn, m, { text, usedPrefix, command }) => {
        const idch = global.idch || "1203632123456789@newsletter";
        const namech = global.namech || "Euphy Channel Updates";

        if (!text) {
            try {
                const files = fs.readdirSync(__dirname)
                    .filter(file => file.endsWith('.js'))
                    .sort();

                if (files.length === 0) {
                    return m.reply('> Aduh, folder plugins kosong nih!');
                }

                const rows = files.map((file) => {
                    return {
                        header: file,
                        title: `Ambil Kode ${file}`,
                        description: `Klik untuk mendownload source code file ${file}`,
                        id: `${usedPrefix + command} ${file}`
                    };
                });

                let bodyText = `✨ *GET PLUGIN MANAGER* ✨\n\n`;
                bodyText += `Halo Ownerku! Berikut adalah daftar seluruh file plugin yang terpasang di bot secara *real-time*.\n\n`;
                bodyText += `Silakan ketuk tombol *Pilih Plugin* di bawah untuk melihat dan mengambil kode secara instan! 🚀`;
                
                const listMessage = generateWAMessageFromContent(
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
                                        title: 'Code File Downloader',
                                        hasMediaAttachment: false
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: bodyText
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: `Total terdeteksi: ${files.length} plugin • ${global.wm || 'Euphy'}`
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        messageVersion: 1,
                                        buttons: [{
                                            name: "single_select",
                                            buttonParamsJson: JSON.stringify({
                                                title: "📁 Pilih Plugin",
                                                sections: [{
                                                    title: "Daftar Plugin Aktif",
                                                    highlight_label: "Terbaru",
                                                    rows: rows
                                                }]
                                            })
                                        }]
                                    }),
                                    contextInfo: {
                                        mentionedJid: [m.sender],
                                        forwardingScore: 999,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: idch,
                                            serverMessageId: 143,
                                            newsletterName: namech
                                        }
                                    }
                                })
                            }
                        }
                    },
                    { userJid: conn.user.id, quoted: m }
                );

                await conn.relayMessage(m.chat, listMessage.message, {
                    messageId: listMessage.key.id,
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

                return;
            } catch (dirError) {
                console.error(dirError);
                return m.reply(`❌ *Gagal membaca daftar plugin:* ${dirError.message}`);
            }
        }

        const filename = text.endsWith('.js') ? text : `${text}.js`;
        const pathPlugin = path.join(__dirname, filename);

        try {
            if (!fs.existsSync(pathPlugin)) {
                return m.reply(`> File *${filename}* tidak ditemukan di folder plugins!`);
            }

            const content = fs.readFileSync(pathPlugin, 'utf-8');

            await conn.sendMessage(m.chat, {
                text: content,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: idch,
                        newsletterName: namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });
        } catch (e) {
            console.error(e);
            m.reply(`❌ *Gagal mengambil plugin:* ${e.message}`);
        }
    }
};
