/**
 * Euphy-Bot - Converter.js (V2.1 Optimized)
 * Fix: FFmpeg Execution & Auto-Delete Tmp Files
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      let tmp = path.join(__dirname, '../tmp', + new Date + '.' + ext)
      let out = tmp + '.' + ext2
      await fs.promises.writeFile(tmp, buffer)
      
      // Menggunakan spawn dengan penanganan error yang lebih ketat
      const process = spawn('ffmpeg', [
        '-y',
        '-i', tmp,
        ...args,
        out
      ])

      process.on('error', async (err) => {
        if (fs.existsSync(tmp)) await fs.promises.unlink(tmp)
        reject(err)
      })

      process.on('close', async (code) => {
        try {
          if (fs.existsSync(tmp)) await fs.promises.unlink(tmp)
          if (code !== 0) return reject(new Error(`FFmpeg exited with code ${code}`))
          
          // Baca hasil konversi
          let data = await fs.promises.readFile(out)
          if (fs.existsSync(out)) await fs.promises.unlink(out) // Hapus file output setelah dibaca
          
          resolve(data) // Langsung kembalikan Buffer agar sinkron dengan sticker.js
        } catch (e) {
          reject(e)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on',
  ], ext, 'ogg')
}

function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10'
  ], ext, 'opus')
}

function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264', '-c:a', 'aac', '-ab', '128k', '-ar', '44100', '-crf', '32', '-preset', 'slow'
  ], ext, 'mp4')
}

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
}
