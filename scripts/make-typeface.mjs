import opentype from 'opentype.js'
import fs from 'node:fs'
const [src, out] = process.argv.slice(2)
const buf = fs.readFileSync(src)
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
const scale = 1000 / font.unitsPerEm
const r = (n) => Math.round(n * scale)
const glyphs = {}
for (let i = 0; i < font.glyphs.length; i++) {
  const g = font.glyphs.get(i)
  const codes = g.unicodes?.length ? g.unicodes : (g.unicode !== undefined ? [g.unicode] : [])
  if (!codes.length) continue
  let o = ''
  for (const c of g.path.commands) {
    if (c.type === 'M') o += `m ${r(c.x)} ${r(c.y)} `
    else if (c.type === 'L') o += `l ${r(c.x)} ${r(c.y)} `
    else if (c.type === 'Q') o += `q ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} `
    else if (c.type === 'C') o += `b ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} `
  }
  const bb = g.getBoundingBox()
  const data = { ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: o.trim() }
  for (const code of codes) glyphs[String.fromCodePoint(code)] = data
}
const json = {
  glyphs, familyName: font.names.fontFamily?.en || 'Font',
  ascender: r(font.ascender), descender: r(font.descender),
  underlinePosition: r(font.tables.post.underlinePosition), underlineThickness: r(font.tables.post.underlineThickness),
  boundingBox: { yMin: r(font.tables.head.yMin), xMin: r(font.tables.head.xMin), yMax: r(font.tables.head.yMax), xMax: r(font.tables.head.xMax) },
  resolution: 1000, original_font_information: { format: 0 }, cssFontWeight: 'bold', cssFontStyle: 'normal',
}
fs.writeFileSync(out, JSON.stringify(json))
console.log('glyphs', Object.keys(glyphs).length, 'has é', !!glyphs['é'], 'ñ', !!glyphs['ñ'])
