// Data + pure helpers, ported from design/domovni-cisla.dc.html.
const DATA = "1|864|plastický|cihlová|ovál;4|178|plastický|modrá|ovál;5|260|plastický|modrá|ovál;6|85|plochý|cihlová|obdélník;7|8|plastický|zelená|ovál;9|14|plastický|hnědá|obdélník;10|220|plastický|hnědá|obdélník;11|175|plastický|modrá|seříznuté rohy;12|39|plastický|cihlová|ovál;13|29|plastický|zelená|ovál;14|126|plastický|zelená|ovál;15|7481|plastický|žlutá|ovál;18|133|plastický|modrá|seříznuté rohy;19|384|plastický|cihlová|ovál;20|70|plastický|černá|obdélník;22|80|plochý|černá|seříznuté rohy;23|28|plochý|zelená|obdélník;24|58|plastický|modrá|ovál;30|234|plastický|hnědá|oblouk;31|17|plastický|žlutá|šestiúhelník;32|16|plastický|žlutá|šestiúhelník;33|104/6|plochý|zelená|seříznuté rohy;34|7|plastický|modrá|ovál;35|77|plastický|hnědá|ovál;36|189/III|plochý|modrá|obdélník;37|99|plastický|modrá|kruh;38|30|plastický|zelená|ovál;39|751|plastický|cihlová|seříznuté rohy;40|1011|plastický|hnědá|oblouk;42|70|plastický|modrá|seříznuté rohy;43|88|plastický|hnědá|seříznuté rohy;44|255|plastický|modrá|ovál;45|97|plastický|žlutá|obdélník;46|45|plastický|hnědá|ovál;47|1028|plastický|hnědá|ovál;48|44|plastický|hnědá|ovál;49|35|plastický|zelená|ovál;50|203|plastický|cihlová|seříznuté rohy;51|2|plastický|zelená|ovál;52|79|plastický|modrá|seříznuté rohy";
const COLORS = { modrá:'#3e5d9e', zelená:'#5e6d3d', cihlová:'#b5552f', černá:'#262422', hnědá:'#6e4b2f', žlutá:'#d9a63a' };
const TVARY = ['ovál','kruh','obdélník','seříznuté rohy','oblouk','šestiúhelník'], PROVEDENI = ['plastický','plochý'];
const ITEMS = DATA.split(';').map((s, i) => {
  const [v, n, p, b, tvar] = s.split('|');
  return { vzor: 'V' + (i + 1), label: n, src: 'assets/cisla/n' + v + '.webp', provedeni: p, barva: b, tvar };
});
const ZOOMS = [0.55, 0.9, 1.45];
const F = (id, ff, fw, fs, ls, sh, note, cs) => ({ id, ff, fw: fw || 400, fs: fs || 'normal', ls: ls || '0', sh: sh || 'none', note: note || '', tt: cs === 'uppercase' ? 'uppercase' : 'none', fv: cs === 'small-caps' ? 'small-caps' : 'normal' });
const CISLA = [
  F('C1', "'Alegreya',serif", 500, 'italic'), F('C2', "'Almendra',serif", 700), F('C3', "'IM Fell English',serif"), F('C4', "'Playfair Display',serif", 700, 0, '.14em'),
  F('C5', "'Abril Fatface',serif"), F('C6', "'Libre Baskerville',serif"), F('C7', "'Jost',sans-serif"), F('C8', "'IM Fell DW Pica',serif", 400, 0, '.02em', '2px 2px 0 rgba(0,0,0,.28)'),
  F('C9', "'Courgette',cursive", 400, 0, '.12em'), F('C10', "'Cormorant Garamond',serif", 500, 'italic', '.1em'), F('C11', "'Josefin Sans',sans-serif", 300, 'italic'),
  F('C12', "'UnifrakturMaguntia',serif"),
];
const GLYPH = {"C1":{"0":0.619,"1":0.512,"2":0.643,"3":0.632,"4":0.667,"5":0.632,"6":0.619,"7":0.643,"8":0.619,"9":0.619},"C2":{"0":0.659,"1":0.373,"2":0.682,"3":0.714,"4":0.685,"5":0.666,"6":0.682,"7":0.659,"8":0.633,"9":0.679},"C3":{"0":0.564,"1":0.388,"2":0.564,"3":0.539,"4":0.573,"5":0.542,"6":0.567,"7":0.552,"8":0.561,"9":0.567},"C4":{"0":0.647,"1":0.588,"2":0.581,"3":0.64,"4":0.636,"5":0.61,"6":0.618,"7":0.555,"8":0.651,"9":0.618},"C5":{"0":0.687,"1":0.497,"2":0.742,"3":0.702,"4":0.801,"5":0.667,"6":0.664,"7":0.631,"8":0.689,"9":0.664},"C6":{"0":0.58,"1":0.375,"2":0.533,"3":0.543,"4":0.585,"5":0.564,"6":0.549,"7":0.546,"8":0.58,"9":0.541},"C7":{"0":0.728,"1":0.333,"2":0.585,"3":0.726,"4":0.741,"5":0.706,"6":0.717,"7":0.667,"8":0.667,"9":0.713},"C8":{"0":0.669,"1":0.495,"2":0.645,"3":0.62,"4":0.659,"5":0.632,"6":0.645,"7":0.569,"8":0.679,"9":0.652},"C9":{"0":0.807,"1":0.508,"2":0.781,"3":0.784,"4":0.927,"5":0.794,"6":0.764,"7":0.678,"8":0.817,"9":0.787},"C10":{"0":0.687,"1":0.565,"2":0.752,"3":0.714,"4":0.694,"5":0.721,"6":0.646,"7":0.633,"8":0.718,"9":0.646},"C11":{"0":0.646,"1":0.601,"2":0.659,"3":0.64,"4":0.643,"5":0.723,"6":0.656,"7":0.605,"8":0.592,"9":0.675},"C12":{"0":0.578,"1":0.39,"2":0.51,"3":0.525,"4":0.783,"5":0.504,"6":0.54,"7":0.56,"8":0.578,"9":0.569}};
// Which vzorník images exist on disk (filled by probeAssets). Missing → web-font fallback.
const ASSET_OK = {};
const probeAssets = onChange => {
  const urls = [...Object.keys(GLYPH).map(id => ['C:' + id, 'assets/vzorniky/' + id + '/0.png']), ...['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P8', 'P9', 'P10', 'P13', 'P14', 'P15'].map(id => ['P:' + id, 'assets/vzorniky/pisma/' + id + '.png'])];
  urls.forEach(([k, u]) => { const im = new Image(); im.onload = () => { ASSET_OK[k] = true; onChange(); }; im.src = u; });
};
const px = v => (+v).toFixed(1) + 'px';
// k = násobek velikosti záložního písma (číslice zabírají ~0.74 em) → výška číslic ≈ hpx
const glyphs = (txt, style, hpx, ff, u = px, k) => { const c = CISLA.find(q => q.id === style) || {}; return [...txt].map(ch => { const ar = ASSET_OK['C:' + style] && GLYPH[style] && GLYPH[style][ch];
  return ar ? { isImg: true, isTxt: false, w: u(hpx * ar), h: u(hpx), mask: 'url("assets/vzorniky/' + style + '/' + ch + '.png") center/100% 100% no-repeat' }
    : { isImg: false, isTxt: true, ch, ff: ff || "'Libre Baskerville',serif", fw: c.fw || 400, fst: c.fs || 'normal', fs: k ? u(hpx * k) : Math.round(hpx * (ff ? 1 : 0.8)) + 'px', lh: k ? u(hpx) : 1 }; }); };
const PISMA = [
  F('P1', "'Junge',serif"), F('P2', "'Eagle Lake',serif", 400, 0, '.05em'), F('P3', "'Courgette',cursive", 400, 0, '.04em'), F('P4', "'Cormorant Garamond',serif", 600, 'italic', '.06em'),
  F('P5', "'Rochester',cursive", 400, 0, '.04em'), F('P6', "'Lobster Two',cursive", 700, 'italic'), F('P8', "'Jim Nightshade',cursive"), F('P9', "'Great Vibes',cursive"),
  F('P10', "'Rouge Script',cursive", 400, 0, '.04em'), F('P13', "'Pinyon Script',cursive"), F('P14', "'Eagle Lake',serif", 400, 0, '.04em', 0, 0, 'small-caps'), F('P15', "'Della Respira',serif", 400, 0, '.02em', 0, 0, 'small-caps'),
];
const PAINT = { 'žlutá světlá':'#ecd36a', 'žlutá tmavá':'#e6a923', 'oranžová':'#e98a3c', 'červená':'#d8262b', 'vínová':'#a3283a', 'růžová tmavá':'#d76a73', 'cihlová':'#c06e66', 'lososová':'#efb1a4',
  'modrá světlá':'#6f9ad8', 'modrá střední':'#5a6eb6', 'modrá tmavá':'#1f3f7a', 'modrá tyrkys':'#2fa6cb', 'zeleno modrá':'#1f8a94', 'zelená akvarel':'#3f6236', 'zelená tmavá':'#24432e', 'zelená střední':'#4f6446',
  'šedá':'#50555c', 'černá':'#26272a', 'hnědo černá':'#3a2a24', 'hnědá tmavá':'#4e2f1f', 'hnědá světlá':'#c47a3a', 'béžová':'#d8b17a', 'fialová':'#c79bc6', 'zelená světlá':'#a6b63c' };
const TARGETS = [['cislo', 'číslo', 'barvaC'], ['napis', 'nápis', 'barvaN'], ['okraj', 'okraj', 'barvaO']];
const EMPTY_FORM = { cislo: '', ulice: '', barva: 'modrá', tvar: 'ovál', provedeni: 'plochý', jmeno: '', email: '', pozn: '', vzor: null, src: null, mode: 'vzor', pismoC: 'C1', pismoP: 'P15', barvaC: 'modrá tmavá', barvaN: 'modrá tmavá', barvaO: 'modrá tmavá', prefix: 'bez', rozvrzeni: 'nápis pod', oblouk: 'rovně', horni: '', velC: 100, velN: 100, rozestup: 100, posun: 0 };
const PREFIXY = ['bez', 'č.p.', 'Čís.', '№', 'ev.č.', 'číslo'], ROZVRZENI = ['jen číslo', 'nápis pod', 'nápis nad', 'nad i pod'], OBLOUK = ['rovně', 'mírně', 'po okraji'];
const _mc = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
const measureCh = (ch, font, fs) => { if (!_mc) return fs * .52; _mc.font = font; return _mc.measureText(ch).width; };
// znaky po elipse (a, b, střed W/2, cy); top = text nahoře (∩), jinak dole (∪). Vrací pozice v % a fs v jednotkách cedulky.
const arcText = (text, fs, ls, W, H, a, b, cy, top, font, upper) => {
  const chars = [...text], ws = chars.map(ch => measureCh(upper ? ch.toUpperCase() : ch, font, fs) + ls), total = ws.reduce((s, w) => s + w, 0), sp = t => Math.hypot(a * Math.sin(t), b * Math.cos(t));
  const step = (t0, d, dir) => { let t = t0, s = 0; while (s < d) { s += sp(t) * .002; t += .002 * dir; } return t; };
  const dir = top ? 1 : -1; let t = step(top ? -Math.PI / 2 : Math.PI / 2, total / 2, -dir);
  return chars.map((ch, i) => { const adv = ws[i], m = step(t, adv / 2, dir), x = W / 2 + a * Math.cos(m), y = cy + b * Math.sin(m), dx = dir * -a * Math.sin(m), dy = dir * b * Math.cos(m); t = step(t, adv, dir);
    return { ch, fs, l: (x / W * 100).toFixed(2) + '%', tp: (y / H * 100).toFixed(2) + '%', r: (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1) + 'deg' }; }); };
const insetPoly = (p, d) => { const n = p.length, L = []; for (let i = 0; i < n; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % n], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len; L.push([x1 + nx * d, y1 + ny * d, dx, dy]); } return L.map((a, i) => { const b = L[(i + n - 1) % n], den = b[2] * a[3] - b[3] * a[2], s = ((a[0] - b[0]) * a[3] - (a[1] - b[1]) * a[2]) / den; return [b[0] + b[2] * s, b[1] + b[3] * s]; }); };
const f2 = v => v.toFixed(2), polyD = P => 'M' + P.map(q => f2(q[0]) + ',' + f2(q[1])).join('L') + 'Z';
const ellD = (W, H, d) => { const rx = f2(W / 2 - d), ry = f2(H / 2 - d), c = f2(H / 2); return 'M' + d + ',' + c + 'A' + rx + ',' + ry + ' 0 1 1 ' + f2(W - d) + ',' + c + 'A' + rx + ',' + ry + ' 0 1 1 ' + d + ',' + c + 'Z'; };
const rrectD = (W, H, d, r0) => { const r = Math.max(r0 - d, 0), x1 = W - d, y1 = H - d; return 'M' + f2(d + r) + ',' + d + 'L' + f2(x1 - r) + ',' + d + 'Q' + f2(x1) + ',' + d + ' ' + f2(x1) + ',' + f2(d + r) + 'L' + f2(x1) + ',' + f2(y1 - r) + 'Q' + f2(x1) + ',' + f2(y1) + ' ' + f2(x1 - r) + ',' + f2(y1) + 'L' + f2(d + r) + ',' + f2(y1) + 'Q' + d + ',' + f2(y1) + ' ' + d + ',' + f2(y1 - r) + 'L' + d + ',' + f2(d + r) + 'Q' + d + ',' + d + ' ' + f2(d + r) + ',' + d + 'Z'; };
const archPoly = (W, H) => { const ry = H * .42, P = []; for (let i = 0; i <= 40; i++) { const t = Math.PI + Math.PI * i / 40; P.push([W / 2 + W / 2 * Math.cos(t), ry + ry * Math.sin(t)]); } return [...P, [W, H], [0, H]]; };
const chamfer = (W, H) => { const c = H * .14; return [[c, 0], [W - c, 0], [W, c], [W, H - c], [W - c, H], [c, H], [0, H - c], [0, c]]; };
const hexa = (W, H) => [[W / 4, 0], [W * 3 / 4, 0], [W, H / 2], [W * 3 / 4, H], [W / 4, H], [0, H / 2]];
// relief: round = zaoblený vystouplý okraj, sharp = vystouplý okraj s ostrými hranami, panel = vystouplý obdélník uprostřed
const SHAPES = { 'ovál': { aspect: '1.4', radius: '50%', clip: 'none', relief: 'round', path: ellD }, 'kruh': { aspect: '1', radius: '50%', clip: 'none', relief: 'round', path: ellD }, 'obdélník': { aspect: '1.4', radius: '6px', clip: 'none', relief: 'panel', path: (W, H, d) => rrectD(W, H, d, 6) }, 'seříznuté rohy': { aspect: '1.4', radius: '0', relief: 'panel', poly: chamfer, clip: 'polygon(10% 0,90% 0,100% 14%,100% 86%,90% 100%,10% 100%,0 86%,0 14%)' }, 'oblouk': { aspect: '1.1', radius: '50% 50% 6px 6px / 42% 42% 6px 6px', clip: 'none', relief: 'sharp', poly: archPoly }, 'šestiúhelník': { aspect: '1.1547', radius: '0', relief: 'sharp', poly: hexa, clip: 'polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)' } };
for (const s of Object.values(SHAPES)) if (s.poly) s.path = (W, H, d) => polyD(insetPoly(s.poly(W, H), d));
// ── rozložení vlastní cedulky (jednotky cedulky: šířka 320) ──
const cq = v => (v / 3.2).toFixed(2) + 'cqw'; // → kontejnerové jednotky, škáluje s náhledem
const widthAt = (tvar, W, H, y) => { if (y < 0 || y > H) return 0; const t = Math.abs(y - H / 2) / (H / 2);
  if (tvar === 'ovál' || tvar === 'kruh') return W * Math.sqrt(Math.max(0, 1 - t * t));
  if (tvar === 'šestiúhelník') return W * (1 - t / 2);
  if (tvar === 'oblouk') { const ry = H * .42; if (y >= ry) return W; const u = (ry - y) / ry; return W * Math.sqrt(Math.max(0, 1 - u * u)); }
  return W; };
const FK = 1.35; // záložní písmo čísel: font-size = výška číslic × FK
// Poměry odměřené z hotových vzorů: číslo ~45–50 % výšky, nápis ~12 %, číslo nad středem, když je nápis jen dole.
const LAYOUTS = { 'oba': { nc: .5, nh: .4, tc: .19, bc: .81, ts: .115 }, 'pod': { nc: .42, nh: .45, bc: .77, ts: .125 }, 'nad': { nc: .58, nh: .45, tc: .23, ts: .125 }, 'nic': { nc: .5, nh: .54 } };
// největší v z [lo, hi], pro kterou fits(v) platí (fits je klesající)
const maxFit = (fits, lo, hi) => { if (fits(hi)) return hi; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (fits(m)) lo = m; else hi = m; } return lo; };
const plateLayout = o => {
  const { tvar, sh, txt, cS, pS, pre, topTxt, botTxt, oblouk } = o, W = 320, H = W / parseFloat(sh.aspect), D = 20;
  const avail = y => widthAt(tvar, W - 2 * D, H - 2 * D, y - D) * .95;
  const up = pS.tt === 'uppercase', pls = parseFloat(pS.ls) || 0;
  const pFont = fs => (pS.fs || 'normal') + ' ' + (pS.fv === 'small-caps' ? 'small-caps' : 'normal') + ' ' + (pS.fw || 400) + ' ' + fs + 'px ' + pS.ff;
  const cFont = fs => (cS.fs || 'normal') + ' ' + (cS.fw || 400) + ' ' + fs + 'px ' + cS.ff;
  const tw = (s, fs) => [...s].reduce((a, ch) => a + measureCh(up ? ch.toUpperCase() : ch, pFont(fs), fs) + pls * fs, 0);
  const L = { ...LAYOUTS[topTxt && botTxt ? 'oba' : botTxt ? 'pod' : topTxt ? 'nad' : 'nic'] };
  const preAbove = pre === 'ev.č.' || pre === 'číslo';
  if (preAbove) { L.nh *= .84; L.nc += topTxt && !botTxt ? .03 : .05; }
  // 100 % = automatika (vejde se do tvaru); posuvníky pak násobí bez omezení → jemné doladění, klidně i přes okraj
  const sp = (o.rozestup || 100) / 100, nc0 = L.nc * H, nc = nc0 + (o.posun || 0) / 100 * H;
  // ── číslo: výška z rozložení × posuvník, pak zúžit, aby se vešlo do tvaru
  const gap = 2, img = ch => ASSET_OK['C:' + cS.id] && GLYPH[cS.id] && GLYPH[cS.id][ch];
  const preW = hp => pre === 'č.p.' ? measureCh('č.p.', pFont(hp * .42), hp * .42) + hp * .08 : pre === 'Čís.' ? measureCh('Č', pFont(hp * FK), hp * FK) + hp * .06 : pre === '№' ? measureCh('N', pFont(hp * FK), hp * FK) + hp * .5 : 0;
  const numW = hp => [...txt].reduce((a, ch) => a + (img(ch) ? hp * img(ch) : measureCh(ch, cFont(hp * FK), hp * FK)), 0) + gap * (txt.length - 1) + preW(hp);
  const hp = Math.min(L.nh * H, maxFit(h => numW(h) <= Math.min(avail(nc0 - h * .45), avail(nc0 + h * .45)), 10, H)) * (o.velC || 100) / 100;
  // ── nápisy
  const lines = [], arc = [], curve = oblouk === 'mírně' ? 1 : oblouk === 'po okraji' || oblouk === 'do oblouku' ? 2 : 0, round = tvar === 'ovál' || tvar === 'kruh';
  const line = (text, base, top) => { if (!text) return; const k = curve ? 1.04 : 1, y0 = base * H, y = nc + (y0 - nc0) * sp;
    const ts = Math.min(H * L.ts, maxFit(t => tw(text, t) <= avail(top ? y0 - t * .45 : y0 + t * .45) * k, 6, H * .4)) * (o.velN || 100) / 100;
    if (curve === 2) { const ins = 18 + ts * .6; let a, b, cy; if (round) { a = W / 2 - ins; b = H / 2 - ins; cy = H / 2; } else { a = W * .75; b = H * .55; cy = top ? ins + b : H - ins - b; }
      arc.push(...arcText(text, ts, pls * ts, W, H, a, b, cy, top, pFont(ts), up)); }
    else if (curve === 1) { const R = W * .72; arc.push(...arcText(text, ts, pls * ts, W, H, R, R * (round ? .8 : 1), top ? y + R * (round ? .8 : 1) : y - R * (round ? .8 : 1), top, pFont(ts), up)); }
    else lines.push({ key: top ? 't' : 'b', text, top: (y / H * 100).toFixed(2) + '%', fs: cq(ts) }); };
  line(topTxt, L.tc, true); line(botTxt, L.bc, false);
  const preS = hp * .42, preA = hp * .34;
  return { arc: arc.map(c => ({ ...c, fs: cq(c.fs) })), lines, nTop: (nc / H * 100).toFixed(2) + '%', gap: cq(gap), glyphs: glyphs(txt, cS.id, hp, cS.ff, cq, FK),
    preAbove, preATop: ((nc - hp / 2 - preA * .62) / H * 100).toFixed(2) + '%', preAS: cq(preA),
    preCp: pre === 'č.p.', preCis: pre === 'Čís.', preNo: pre === '№', preS: cq(preS), preMb: cq(-preS * .2), preM: cq(hp * .06), preL: cq(hp * FK), preLh: cq(hp) }; };
const LX = -.45, LY = -.89; // světlo zleva shora
const shade = b => b > 0 ? 'fill="#fff" fill-opacity="' + f2(b * .6) + '"' : 'fill="#3c2814" fill-opacity="' + f2(-b * .42) + '"';
// ostrá fazeta mezi obrysy d0→d1; out=true svah ven (okraj), false svah dovnitř (stěna do pole)
const facets = (P, d0, d1, out) => { const A = insetPoly(P, d0), B = insetPoly(P, d1), n = P.length; let s = '';
  for (let i = 0; i < n; i++) { const j = (i + 1) % n, dx = P[j][0] - P[i][0], dy = P[j][1] - P[i][1], len = Math.hypot(dx, dy), nx = dy / len, ny = -dx / len, b = (out ? 1 : -1) * (nx * LX + ny * LY);
    s += '<path d="' + polyD([A[i], A[j], B[j], B[i]]) + '" ' + shade(b) + ' stroke="none"/>'; } return s; };
const plateSvg = (sh, ring, plast) => { const W = 320, H = W / parseFloat(sh.aspect), p = d => sh.path(W, H, d), F = '#f6f1e2';
  let defs = '', s = '<path d="' + p(0) + '" fill="' + ring + '"/><path d="' + p(9) + '" fill="' + F + '"/><path d="' + p(13) + '" fill="' + ring + '"/><path d="' + p(15) + '" fill="' + F + '"/>';
  if (plast && sh.relief === 'round') {
    defs = '<linearGradient id="lt" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#3c2814" stop-opacity="0"/><stop offset="1" stop-color="#3c2814" stop-opacity=".5"/></linearGradient>'
      + '<linearGradient id="dk" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#3c2814" stop-opacity=".45"/><stop offset=".4" stop-color="#3c2814" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient>'
      + '<linearGradient id="cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c2814" stop-opacity=".3"/><stop offset=".35" stop-color="#3c2814" stop-opacity="0"/></linearGradient>'
      + '<filter id="b1" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="b2" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.6"/></filter>';
    s += '<path d="' + p(18) + '" fill="none" stroke="url(#cs)" stroke-width="6" filter="url(#b2)"/>'
      + '<path d="' + p(3.5) + '" fill="none" stroke="url(#lt)" stroke-width="7" filter="url(#b1)"/>'
      + '<path d="' + p(12.5) + '" fill="none" stroke="url(#dk)" stroke-width="5" filter="url(#b1)"/>';
  } else if (plast && sh.relief === 'sharp') { const P = sh.poly(W, H);
    s += facets(P, 0, 6, true) + facets(P, 10, 15, false) + '<path d="' + p(15) + '" fill="none" stroke="#3c2814" stroke-opacity=".12" stroke-width="1"/>';
  } else if (plast && sh.relief === 'panel') { const m = 30, R = [[m, m], [W - m, m], [W - m, H - m], [m, H - m]];
    defs = '<filter id="ds" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>';
    s += '<path d="' + polyD(R.map(q => [q[0] + 2.5, q[1] + 4])) + '" fill="#3c2814" fill-opacity=".28" filter="url(#ds)"/><path d="' + polyD(R) + '" fill="' + F + '"/>' + facets(R, 0, 5, true);
  }
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + f2(H) + '" preserveAspectRatio="none">' + (defs ? '<defs>' + defs + '</defs>' : '') + s + '</svg>';
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'; };
const STEPS = [
  { n: '01', title: 'Vyberte vzor', text: 'Inspirujte se v galerii, nebo mi popište vlastní představu — číslo, barvu, tvar.' },
  { n: '02', title: 'Návrh a cena', text: 'Do 3 pracovních dnů pošlu skicu a přesnou cenu. Upravujeme, dokud nesedí.' },
  { n: '03', title: 'Malování', text: 'Po schválení a připsání platby cedulku vytvaruji z keramiky, ručně pomaluji a vypálím. Trvá to obvykle 2–3 týdny.' },
  { n: '04', title: 'Předání', text: 'Cedulku pošlu bezpečně zabalenou i s kotvením, nebo si ji vyzvednete osobně.' },
];
const FAKTA = [
  ['materiál', 'kamenina', 'Malba pod transparentní glazuru, dva výpaly v peci.'],
  ['výpal', '1200 °C', 'Nízká nasákavost — cedulka odolá dešti, mrazu i slunci.'],
  ['rozměr', '± 1 cm', 'Hlína se při sušení a pálení smrští o 8–15 %. U menších cedulek ± 0,5 cm.'],
  ['montáž', 'v ceně', 'Šrouby, hmoždinky i návod. Do zateplené fasády speciální hmoždinky za +40 Kč.'],
  ['dlouhé číslo', '+3 cm, +100 Kč', 'Od 4 číslic, nebo 3 číslice se zkratkou (Čís., č.p.…) — cedulku rozšířím.'],
  ['výroba', '2–3 týdny', 'Nestandardní rozměr 4–6 týdnů. Spěcháte na dárek? Napište termín, posunu vás v pořadníku.'],
  ['platba', 'předem', 'Malovat začínám po připsání platby. Účet u Fio — ze Slovenska bez poplatků.'],
  ['doprava', 'Česká pošta', 'Cenný křehký balík do ruky, i na Slovensko (cca 320 Kč). Osobní odběr po domluvě.'],
];
const mod = (a, n) => ((a % n) + n) % n;
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

export { ASSET_OK, probeAssets, DATA, COLORS, TVARY, PROVEDENI, ITEMS, ZOOMS, CISLA, GLYPH, glyphs, PISMA, PAINT, TARGETS, EMPTY_FORM, PREFIXY, ROZVRZENI, OBLOUK, arcText, plateLayout, SHAPES, plateSvg, STEPS, FAKTA, mod, rng };
