
/** * Plugin: Sub-Menu Handler ⛩️
 * Deskripsi: Menampilkan daftar fitur berdasarkan kategori yang dipilih (termasuk "Semua Menu").
 * Style: Clean & Minimalist (No Box Lines) ✨
 * Fixed by Euphy 🌸
 */

module.exports = {
    command: ['allmenu'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix }) => {
        try {
            // Pastikan ada tag kategori yang dikirim
            let tag = text ? text.toLowerCase().trim() : '';
            if (!tag) return;

            // Daftar nama kategori yang rapi
            const categoryNames = {
                'main': 'MENU UTAMA',
                'anime': 'MENU WIBU',
                'ai': 'MENU AI',
                'premium': 'MENU PREMIUM',
                'downloader': 'MENU DOWNLOADER',
                'economic': 'MENU EKONOMI GLOBAL',
                'fun': 'MENU FUN',
                'group': 'MENU GROUP',
                'game': 'MENU GAMING',
                'nsfw': 'MENU +18',
                'tools': 'MENU TOOLS',
                'owner': 'MENU OWNER'
            };

            // Mengambil prefix yang digunakan (jika tidak ada, fallback ke '/' atau '.')
            let pfx = usedPrefix || '.';
            const plugins = global.plugins || {};

            // --- KONDISI 1: JIKA USER MEMILIH "SEMUA MENU" (allmenu) ---
            if (tag === 'allmenu') {
                let txt = `🌸 *SEMUA PERINTAH BOT* 🌸\n\n`;
                
                // Looping semua kategori satu per satu untuk digabungkan
                for (let key in categoryNames) {
                    let categoryCmds = Object.values(plugins)
                        .filter(p => p && p.category === key && !p.disabled && p.command)
                        .map(p => {
                            let cmd = Array.isArray(p.command) ? p.command[0] : p.command;
                            return `${pfx}${cmd}`;
                        });

                    // Hilangkan duplikasi nama perintah jika ada
                    categoryCmds = [...new Set(categoryCmds)];

                    if (categoryCmds.length > 0) {
                        txt += `*${categoryNames[key]}*\n`;
                        txt += categoryCmds.map(c => ` ◦ ${c}`).join('\n') + `\n\n`;
                    }
                }

                txt += `> Pilih dan gunakan perintah dengan bijak ya!`;
                return await m.reply(txt);
            }

            // --- KONDISI 2: JIKA USER MEMILIH KATEGORI SPESIFIK (Misal: anime, ai, dll) ---
            let categoryCommands = Object.values(plugins)
                .filter(p => p && p.category === tag && !p.disabled && p.command)
                .map(p => {
                    let cmd = Array.isArray(p.command) ? p.command[0] : p.command;
                    return ` ◦ ${pfx}${cmd}`;
                });

            // Hilangkan duplikasi nama perintah jika ada alias yang mirip
            categoryCommands = [...new Set(categoryCommands)].join('\n');

            if (!categoryCommands) {
                return m.reply(`> Kategori *${tag.toUpperCase()}* tidak ditemukan atau belum memiliki fitur.`);
            }

            // Susun tampilan sub-menu dengan gaya yang super Clean & Minimalis
            let txt = `🌸 *${categoryNames[tag] || tag.toUpperCase()}* 🌸\n\n`;
            txt += `${categoryCommands}\n\n`;
            txt += `> Pilih dan gunakan perintah dengan bijak ya!`;

            // Balas pesan ke user
            await m.reply(txt);

        } catch (e) {
            console.error("Error in Sub-Menu Handler:", e);
            m.reply("> Aduh, terjadi kesalahan saat memuat daftar perintah.");
        }
    }
};
