/**
 * Plugin: GitHub Repository Downloader 🐙📦
 * Deskripsi: Mengunduh source code repositori GitHub menjadi file ZIP secara instan.
 * Style: Clean & Minimalist ✨
 */

const fetch = require('node-fetch');

module.exports = {
    command: ['githubdl', 'gitclone', 'github'],
    category: 'downloader',
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        // Validasi input link repositori
        if (!text) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply(`Mana link repositori GitHub-nya?\nContoh: *${command} https://github.com/user/repo*`);
        }

        // Regex untuk mengekstrak username dan nama repo dari URL
        const regex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/\s#?]+)/i;
        const match = text.trim().match(regex);

        if (!match) {
            await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
            return m.reply('❌ Tautan GitHub tidak valid! Pastikan formatnya benar (contoh: https://github.com/user/repo).');
        }

        const [, username, repo] = match;
        // Bersihkan nama repo jika ada akhiran .git
        const repoName = repo.replace(/\.git$/i, '');
        
        // Membangun URL download zip otomatis dari server resmi GitHub
        const zipUrl = `https://github.com/${username}/${repoName}/archive/refs/heads/main.zip`;
        const fallbackZipUrl = `https://github.com/${username}/${repoName}/archive/refs/heads/master.zip`;

        try {
            await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

            // Tembak URL utama (branch main)
            let res = await fetch(zipUrl, { method: 'HEAD' });
            let finalUrl = zipUrl;

            // Jika main branch tidak ditemukan (404), switch otomatis ke master branch
            if (res.status === 404) {
                res = await fetch(fallbackZipUrl, { method: 'HEAD' });
                if (res.status === 404) throw new Error('Repositori tidak ditemukan atau bersifat privat.');
                finalUrl = fallbackZipUrl;
            }

            // Dapatkan buffer data ZIP repositori
            const zipRes = await fetch(finalUrl);
            if (!zipRes.ok) throw new Error(`Gagal mengunduh file dari GitHub (${zipRes.statusText})`);
            const zipBuffer = await zipRes.buffer();

            // Proteksi ukuran file agar tidak melebihi limit kirim WhatsApp (biasanya 100MB)
            if (zipBuffer.length > 100 * 1024 * 1024) {
                throw new Error('Ukuran zip repositori terlalu besar (maksimal 100MB).');
            }

            // Kirim berkas dokumen .zip ke chatroom dengan format terusan newsletter yang rapi
            await conn.sendMessage(m.chat, {
                document: zipBuffer,
                mimetype: 'application/zip',
                fileName: `${repoName}.zip`,
                caption: `🐙 *G I T H U B   D O W N L O A D E R*\n\n📦 *Repo:* ${username}/${repoName}\n🔗 *Source:* ${text.trim()}`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.idch,
                        newsletterName: global.namech,
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

        } catch (err) {
            console.error("GitHub DL Error:", err);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`❌ *Unduhan gagal:* ${err.message || "Terjadi kesalahan internal."}`);
        }
    }
};
