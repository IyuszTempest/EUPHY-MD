/**
 * Euphy-Bot - Sticker.js (V2.1 Final Stable)
 * Fix: Video Conversion & Buffer Detection
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { ffmpeg } = require('./converter')

/**
 * KHUSUS VIDEO: Optimasi Bitrate & FPS
 */
async function stickerVideo(img) {
  if (!img || !Buffer.isBuffer(img)) throw new Error("Input video kosong!")
  return await ffmpeg(img, [
    '-vcodec', 'libwebp',
    '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1,fps=10',
    '-lossless', '0',
    '-compression_level', '6',
    '-q:v', '30', 
    '-loop', '0',
    '-preset', 'picture',
    '-an',
    '-vsync', '0',
    '-fs', '850K' // Limit ketat di bawah 1MB
  ], 'mp4', 'webp')
}

/**
 * UNTUK GAMBAR: Pakai wa-sticker-formatter
 */
async function stickerImage(img, url, packname, author) {
  const WSF = require('wa-sticker-formatter')
  return await new WSF.Sticker(img ? img : url, {
    type: 'full',
    pack: packname,
    author,
  }).build()
}

/**
 * EXIF: Metadata packname/author
 */
async function addExif(webpSticker, packname, author) {
  if (!Buffer.isBuffer(webpSticker)) return webpSticker
  const webp = require('node-webpmux')
  const img = new webp.Image();
  const json = { 'sticker-pack-name': packname, 'sticker-pack-publisher': author };
  let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  let exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  await img.loadBuffer(webpSticker)
  img.exif = exif
  return await img.saveBuffer()
}

module.exports = {
  async sticker(img, url, packname, author) {
    let lastError
    // Deteksi Video lebih akurat via Magic Numbers atau URL
    let isVideo = (Buffer.isBuffer(img) && (img.slice(4, 8).toString('hex') === '66747970' || img.slice(0, 4).toString('hex') === '00000018')) || (url && url.includes('.mp4')) 
    
    let funcs = isVideo ? [stickerVideo] : [stickerImage]

    for (let func of funcs) {
      try {
        let stiker = await func(img, url, packname, author)
        if (Buffer.isBuffer(stiker) && stiker.includes('RIFF')) {
            try {
              return await addExif(stiker, packname, author)
            } catch (e) {
              return stiker
            }
        }
      } catch (err) {
        lastError = err
      }
    }
    return lastError
  }
}
