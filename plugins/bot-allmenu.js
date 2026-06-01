/** * Plugin: Sub-Menu Handler ⛩️
 * Deskripsi: Menampilkan daftar fitur berdasarkan kategori yang dipilih.
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
                'menuall': 'SEMUA MENU',
                'main': 'MENU UTAMA',
                'anime': 'MENU WIBU',
                'ai': 'MENU AI',
                'premium': 'MENU PREMIUM',
                'downloader': 'MENU DOWNLOADER',
                'economic': 'MENU EKONOMI GLOBAL', // <-- Sudah ditambahkan koma yang hilang!
                'fun': 'MENU FUN',
                'group': 'MENU GROUP',
                'game': 'MENU GAMING',
                'nsfw': 'MENU +18',
                'tools': 'MENU TOOLS',
                'owner': 'MENU OWNER'
            };

            // Mengambil prefix yang digunakan (jika tidak ada, fallback ke '/' atau '.')
            let pfx = usedPrefix || '.';

            // Filter plugin berdasarkan kategori secara aman
            const plugins = global.plugins || {};
            let categoryCommands = Object.values(plugins)
                .filter(p => p && p.category === tag && !p.disabled)
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
            txt += `_Pilih dan gunakan perintah dengan bijak ya, Yus!_`;

            // Balas pesan ke user
            await m.reply(txt);

        } catch (e) {
            console.error("Error in Sub-Menu Handler:", e);
            m.reply("Aduh, terjadi kesalahan saat memuat daftar perintah.");
        }
    }
};
