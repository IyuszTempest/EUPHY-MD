/** * Minimalist User Profile - Clean Style ⛩️
 * Fitur: Cek Profil dengan Foto Profil User (Sederhana & Elegan)
 * Adopted from Kuroyami Menu Structure
 */

const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

module.exports = {
    command: ['me', 'profile', 'profil'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { usedPrefix: _p }) => {
        try {
            // Berikan reaksi loading biar interaktif ⚡
            await conn.sendMessage(m.chat, { react: { text: "👤", key: m.key } });

            // Menentukan target user (bisa tag orang lain, reply chat, atau diri sendiri)
            let who = m.mentionedJid && m.mentionedJid[0] 
                ? m.mentionedJid[0] 
                : m.quoted 
                    ? m.quoted.sender 
                    : m.sender;

            // Mengambil data dari database global (dengan perlindungan aman jika db kosong)
            let user = global.db?.data?.users?.[who];
            let userName = user?.name || conn.getName(who) || 'User Baru';
            let userAge = user?.age || '-';

            // Mengambil URL foto profil user
            let ppUrl;
            try {
                ppUrl = await conn.profilePictureUrl(who, 'image');
            } catch (e) {
                // Fallback jika PP disembunyikan atau tidak ada
                ppUrl = 'https://placehold.co/600x600/9b005a/ffffff?text=No+Avatar+✨'; 
            }

            // Mempersiapkan media gambar untuk header pesan interaktif
            let media;
            try {
                media = await prepareWAMessageMedia({ image: { url: ppUrl } }, { upload: conn.waUploadToServer });
            } catch (mediaError) {
                console.error("Gagal mengupload PP user ke server WA:", mediaError);
                media = await prepareWAMessageMedia({ image: { url: global.imgall } }, { upload: conn.waUploadToServer });
            }

            // Desain teks body profile yang super simpel dan clean
            let cap += `👤 *Name:* ${userName}\n`;
            cap += `🔢 *Age:* ${userAge} Tahun\n`;
            cap += `📱 *Number:* @${who.split('@')[0]}\n`;
            cap += `📌 *LID:* ${who.endsWith('@lid') ? 'Active ✓' : 'Standard 📱'}\n\n`;

            // Membuat pesan interaktif satu gambar utuh dengan tombol salin & chat langsung
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
                                    title: 'User Profile Info',
                                    hasMediaAttachment: true,
                                    ...media
                                }),
                                body: proto.Message.InteractiveMessage.Body.create({
                                    text: cap
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: global.wm
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    messageVersion: 1,
                                    buttons: [
                                        {
                                            name: "cta_copy",
                                            buttonParamsJson: JSON.stringify({
                                                display_text: "Salin Nomor 📱",
                                                copy_code: who.split('@')[0]
                                            })
                                        },
                                        {
                                            name: "cta_url",
                                            buttonParamsJson: JSON.stringify({
                                                display_text: "Chat WhatsApp",
                                                url: `https://wa.me/${who.split('@')[0]}`
                                            })
                                        }
                                    ]
                                }),
                                contextInfo: { 
                                    mentionedJid: [m.sender, who],
                                    forwardingScore: 999,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: global.idch,
                                        serverMessageId: 143,
                                        newsletterName: `${global.namech}`
                                    }
                                }
                            })
                        }
                    }
                },
                { userJid: conn.user.id, quoted: m }
            );

            // Relay Message dengan Node interaktif agar lancar di Android/iOS terbaru tanpa bug button
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

            // Berikan reaksi sukses setelah terkirim
            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (e) {
            console.error("Eror pada command Profile:", e);
            m.reply(`> Waduh, gagal mengambil profil: ${e.message}`);
        }
    }
};
