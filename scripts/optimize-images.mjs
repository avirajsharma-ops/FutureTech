#!/usr/bin/env node
/**
 * Generates web-optimized WebP siblings for the heaviest PNGs in /public.
 *
 * Run with: `npm run optimize:images`
 *
 * Originals are kept on disk (so designers can re-export later) — the app
 * just points at the .webp variant. Re-runs are idempotent: if the .webp
 * already exists and is newer than the source, it's skipped.
 */
import { readdir, stat, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PUBLIC = path.join(ROOT, 'public')

/** @type {{ dir: string, maxWidth: number, quality: number, recursive?: boolean }[]} */
const TARGETS = [
  // Hero backgrounds — large photos, fine at 2560
  { dir: 'images/hero-backgrounds', maxWidth: 2560, quality: 80 },
  // Earth texture — 8192px is wildly overkill for an on-screen globe
  { dir: 'images',                  maxWidth: 4096, quality: 82, only: /earth-blue-marble/ },
  { dir: 'images',                  maxWidth: 2048, quality: 80, only: /graffiti-hero|satellite-bead/ },
  // Team and director portraits
  { dir: 'team',                    maxWidth: 800,  quality: 78 },
  { dir: 'directors',               maxWidth: 1200, quality: 82 },
  // Project mockups in the Work-page gallery
  { dir: 'mockups',                 maxWidth: 1600, quality: 80 },
  // Contact figma media
  { dir: 'contact',                 maxWidth: 1600, quality: 80 },
]

const formatBytes = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`

async function listPngs(dir, only) {
  const abs = path.join(PUBLIC, dir)
  if (!existsSync(abs)) return []
  const entries = await readdir(abs)
  return entries
    .filter((name) => /\.png$/i.test(name))
    .filter((name) => (only ? only.test(name) : true))
    .map((name) => path.join(abs, name))
}

async function shouldSkip(src, dest) {
  if (!existsSync(dest)) return false
  const [a, b] = await Promise.all([stat(src), stat(dest)])
  return b.mtimeMs >= a.mtimeMs
}

async function convertOne(src, { maxWidth, quality }) {
  const dest = src.replace(/\.png$/i, '.webp')
  if (await shouldSkip(src, dest)) return { src, dest, skipped: true }

  const srcStat = await stat(src)
  const image = sharp(src, { failOn: 'none' })
  const meta = await image.metadata()
  const targetWidth = Math.min(meta.width || maxWidth, maxWidth)

  await image
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(dest)

  const destStat = await stat(dest)
  return {
    src,
    dest,
    before: srcStat.size,
    after: destStat.size,
    saved: srcStat.size - destStat.size,
  }
}

async function main() {
  console.log('• Optimizing images → WebP\n')
  let totalBefore = 0
  let totalAfter = 0
  let totalSkipped = 0

  for (const target of TARGETS) {
    const files = await listPngs(target.dir, target.only)
    if (files.length === 0) continue
    console.log(`  ${target.dir}/  (${files.length} files, max ${target.maxWidth}px, q${target.quality})`)
    for (const src of files) {
      try {
        const res = await convertOne(src, target)
        if (res.skipped) {
          totalSkipped += 1
          console.log(`    · ${path.basename(src)}  (skipped, already fresh)`)
        } else {
          totalBefore += res.before
          totalAfter += res.after
          const pct = ((1 - res.after / res.before) * 100).toFixed(0)
          console.log(
            `    ✓ ${path.basename(src)}  ${formatBytes(res.before)} → ${formatBytes(res.after)}  (-${pct}%)`,
          )
        }
      } catch (err) {
        console.warn(`    ✗ ${path.basename(src)}  ${err.message}`)
      }
    }
    console.log()
  }

  if (totalBefore > 0) {
    const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(1)
    console.log(`Total: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}  (-${pct}%)`)
  }
  if (totalSkipped > 0) console.log(`${totalSkipped} files already up-to-date`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
