/** * Plugin: Sub-Menu Handler
 * Deskripsi: Menampilkan daftar fitur berdasarkan kategori yang dipilih.
 */

module.exports = {
    command: ['allmenu'],
    category: 'main',
    noPrefix: true,
    call: async (conn, m, { text, usedPrefix }) => {
        try {
            let tag = text.toLowerCase().trim();
            if (!tag) return;

            const categoryNames = {
                'main': 'MENU UTAMA',
                'anime': 'MENU WIBU',
                'ai': 'MENU AI',
                'premium': 'MENU PREMIUM',
                'downloader': 'MENU DOWNLOADER',
                'fun': 'MENU FUN',
                'group': 'MENU GROUP',
                'game': 'MENU GAMING',
                'tools': 'MENU TOOLS',
                'owner': 'MENU OWNER'
            };

            // Filter plugin berdasarkan kategori
            let categoryCommands = Object.values(global.plugins)
                .filter(p => p && p.category === tag && !p.disabled)
                .map(p => {
                    let cmd = Array.isArray(p.command) ? p.command[0] : p.command;
                    return ` ◦ ${usedPrefix + cmd}`;
                }).join('\n');

            if (!categoryCommands) return m.reply("Kategori tidak ditemukan atau kosong.");

            // Susun tampilan menu
            let txt = `╭───「 ${categoryNames[tag] || tag.toUpperCase()} 」\n`;
            txt += `${categoryCommands}\n`;
            txt += `╰──────────────\n\n_Pilih dan gunakan perintah dengan bijak._`;

            await m.reply(txt);

        } catch (e) {
            console.error(e);
            m.reply("Terjadi kesalahan saat memuat menu.");
        }
    }
};
