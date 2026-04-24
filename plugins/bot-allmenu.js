/** * Plugin: Sub-Menu Handler Euphylia Magenta
 * Deskripsi: Menampilkan daftar fitur berdasarkan kategori yang dipilih dari menu roll.
 */

module.exports = {
    command: ['allmenu'],
    category: 'main',
    noPrefix: true, // Karena ID dikirim langsung sebagai ".allmenu tag"
    call: async (conn, m, { text, usedPrefix }) => {
        try {
            // Ambil input kategori (misal: anime, ai, group)
            let tag = text.toLowerCase().trim();
            
            // Jika user cuma ngetik .allmenu tanpa kategori, bot diam saja
            if (!tag) return;

            // Mapping Nama Kategori agar tampilan di Header lebih rapi
            const categoryNames = {
                'main': '🍱 MENU UTAMA',
                'anime': '🌸 MENU WIBU',
                'ai': '🤖 MENU AI',
                'premium': '💎 MENU PREMIUM',
                'downloader': '📥 MENU DOWNLOADER',
                'fun': '😁 MENU FUN',
                'group': '👥 MENU GROUP',
                'game': '🎮 MENU GAMING',
                'tools': '🛠️ MENU TOOLS',
                'owner': '👑 MENU OWNER'
            };

            // Filter semua plugin yang memiliki properti 'category' sesuai dengan 'tag'
            let categoryCommands = Object.values(global.plugins)
                .filter(p => p && p.category === tag && !p.disabled)
                .map(p => {
                    // Ambil command pertama jika berupa array
                    let cmd = Array.isArray(p.command) ? p.command[0] : p.command;
                    return `  ◦ ⁠✿ ${usedPrefix + cmd}`;
                }).join('\n');

            // Jika kategori tidak ditemukan atau tidak ada fiturnya
            if (!categoryCommands) return;

            // Susun tampilan Menu per Kategori
            let txt = `╭━━〔 ⛩️ *${categoryNames[tag] || tag.toUpperCase()}* ⛩️ 〕━━┓\n`;
            txt += categoryCommands;
            txt += `\n┗━━━━━━━━━━━━┛\n\n`;
            txt += `_Gunakan command di atas dengan bijak ya, ${m.name || 'User'}!_ ✨`;

            // Kirim pesan sebagai balasan (quoted)
            await m.reply(txt);

        } catch (e) {
            console.error(e);
            // Logging error sederhana agar tetap terpantau di terminal
            console.log(`[ ERROR ALLMENU ] Gagal menampilkan kategori: ${text}`);
        }
    }
};
