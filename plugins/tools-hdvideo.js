/**
 * Professional Video Enhancer 🎬
 * Multi-Option: Basic, Super Sharp, AI Upscale, Low Light
 * Optimized for i5-8500 / 8GB RAM
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENHANCEMENT_OPTIONS = {
    '1': {
        name: 'Basic Enhancement',
        desc: 'Noise reduction + sharpening',
        filters: ['hqdn3d=4:3:6:4.5', 'unsharp=5:5:1.0:5:5:0.0']
    },
    '2': {
        name: 'Super Sharp',
        desc: 'Maximum sharpening + detail enhancement',
        filters: ['unsharp=7:7:2.5:7:7:0.0', 'smartblur=1.5:-0.35:-3.5:0.65:0.25:2.0']
    },
    '3': {
        name: 'AI Upscale',
        desc: 'Resolution upscaling (2x) + quality boost',
        filters: ['scale=iw*2:ih*2:flags=lanczos', 'hqdn3d=2:1:2:3', 'unsharp=5:5:1.0:5:5:0.0']
    },
    '4': {
        name: 'Low Light Boost',
        desc: 'Brightness + shadow enhancement',
        filters: ['eq=brightness=0.2:contrast=1.3:gamma=1.1', 'hqdn3d=3:2:3:3', 'unsharp=3:3:0.8:3:3:0.0']
    }
};

module.exports = {
    command: ['hdvid'],
    category: 'tools',
    premium: false,
    noPrefix: true,
    call: async (conn, m, { usedPrefix, command, text }) => {
        // Tampilkan Menu Pilihan jika tidak ada input angka
        if (!text || !ENHANCEMENT_OPTIONS[text.trim()]) {
            let optionsList = Object.entries(ENHANCEMENT_OPTIONS)
                .map(([key, option]) => `*${key}.* ${option.name}\n   └ ${option.desc}`)
                .join('\n\n');
                
            return m.reply(
                `🎥 *VIDEO ENHANCEMENT PRO*\n\n${optionsList}\n\n` +
                `📝 *Usage:* ${usedPrefix + command} <nomor>\n` +
                `📎 Reply video dengan perintah di atas.\n` +
                `⚠️ *Max size:* 70MB`
            );
        }

        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!/video/.test(mime)) return m.reply(`❌ Reply file videonya, Proxy!`);

        const option = ENHANCEMENT_OPTIONS[text.trim()];
        let media = await q.download();
        const inputSizeMB = (media.length / (1024 * 1024)).toFixed(2);

        if (media.length > 70 * 1024 * 1024) {
            return m.reply(`❌ *File Kegedean!*\n📊 Ukuran: ${inputSizeMB} MB\n📝 Maks: 70 MB`);
        }

        await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });

        const tempDir = './tmp';
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const randomId = crypto.randomBytes(4).toString('hex');
        const inputPath = path.join(tempDir, `in_${randomId}.mp4`);
        const outputPath = path.join(tempDir, `out_${randomId}.mp4`);

        try {
            fs.writeFileSync(inputPath, media);
            await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

            // Cek kemampuan FFmpeg di server
            const availableFilters = await checkFFmpegFilters();
            const adaptedFilters = adaptFiltersForFFmpeg(option.filters, availableFilters);
            const filterComplex = adaptedFilters.join(',');

            // Command FFmpeg - Optimized for i5-8500
            const ffmpegCommand = [
                'ffmpeg',
                '-i', `"${inputPath}"`,
                '-vf', `"${filterComplex}"`,
                '-c:v', 'libx264',
                '-preset', 'superfast', // Agar RAM 8GB gak sesak
                '-crf', '20',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-y',
                `"${outputPath}"`
            ].join(' ');

            await new Promise((resolve, reject) => {
                exec(ffmpegCommand, { timeout: 600000 }, (error, stdout, stderr) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            const stats = fs.statSync(outputPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            let caption = `✅ *Enhance Selesai!*\n\n` +
                          `🎬 *Mode:* ${option.name}\n` +
                          `📊 *In/Out:* ${inputSizeMB}MB / ${fileSizeMB}MB\n` +
                          `⚙️ *Filter:* FFmpeg Optimized`;

            await conn.sendMessage(m.chat, { 
                video: { url: outputPath }, 
                caption: caption 
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            m.reply(`❌ *Gagal:* ${error.message}`);
        } finally {
            // Cleanup file
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }
    }
};

/**
 * Functions Helper
 */
function checkFFmpegFilters() {
    return new Promise((resolve) => {
        exec('ffmpeg -filters', (error, stdout) => {
            if (error) return resolve({});
            const out = stdout.toLowerCase();
            resolve({
                nlmeans: out.includes('nlmeans'),
                smartblur: out.includes('smartblur')
            });
        });
    });
}

function adaptFiltersForFFmpeg(filters, availableFilters) {
    return filters.map(f => {
        if (f.startsWith('nlmeans') && !availableFilters.nlmeans) return 'hqdn3d=8:6:12:9';
        if (f.startsWith('smartblur') && !availableFilters.smartblur) return 'unsharp=3:3:0.5:3:3:0.0';
        return f;
    });
}
