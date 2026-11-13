// Data + pure helpers, ported from "Domovni Cisla.dc.html".
const DATA = "1|864|plochý|cihlová|ovál;4|178|plochý|modrá|ovál;5|260|plochý|modrá|ovál;6|85|plastický|cihlová|obdélník;7|8|plochý|zelená|ovál;9|14|plastický|hnědá|obdélník;10|220|plastický|hnědá|obdélník;11|175|plastický|modrá|seříznuté rohy;12|39|plochý|cihlová|ovál;13|29|plochý|zelená|ovál;14|126|plochý|zelená|ovál;15|7481|plochý|žlutá|ovál;18|133|plastický|modrá|seříznuté rohy;19|384|plochý|cihlová|ovál;20|70|plastický|černá|obdélník;22|80|plastický|černá|seříznuté rohy;23|28|plastický|zelená|obdélník;24|58|plochý|modrá|ovál;30|234|plastický|hnědá|oblouk;31|17|plastický|žlutá|šestiúhelník;32|16|plastický|žlutá|šestiúhelník;33|104/6|plastický|zelená|seříznuté rohy;34|7|plochý|modrá|ovál;35|77|plochý|hnědá|ovál;36|189/III|plochý|modrá|obdélník;37|99|plastický|modrá|kruh;38|30|plochý|zelená|ovál;39|751|plastický|cihlová|seříznuté rohy;40|1011|plastický|hnědá|oblouk;42|70|plastický|modrá|seříznuté rohy;43|88|plastický|hnědá|seříznuté rohy;44|255|plochý|modrá|ovál;45|97|plastický|žlutá|obdélník;46|45|plochý|hnědá|ovál;47|1028|plochý|hnědá|ovál;48|44|plochý|hnědá|ovál;49|35|plochý|zelená|ovál;50|203|plastický|cihlová|seříznuté rohy;51|2|plochý|zelená|ovál;52|79|plastický|modrá|seříznuté rohy";
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
const GLYPH = {"C1":{"0":0.624,"1":0.517,"2":0.646,"3":0.638,"4":0.669,"5":0.638,"6":0.621,"7":0.646,"8":0.624,"9":0.626},"C2":{"0":0.665,"1":0.383,"2":0.689,"3":0.721,"4":0.689,"5":0.673,"6":0.686,"7":0.665,"8":0.641,"9":0.684},"C3":{"0":0.57,"1":0.396,"2":0.575,"3":0.55,"4":0.577,"5":0.55,"6":0.575,"7":0.557,"8":0.567,"9":0.572},"C4":{"0":0.655,"1":0.595,"2":0.586,"3":0.646,"4":0.643,"5":0.616,"6":0.619,"7":0.562,"8":0.655,"9":0.625},"C5":{"0":0.678,"1":0.486,"2":0.726,"3":0.685,"4":0.781,"5":0.658,"6":0.651,"7":0.623,"8":0.678,"9":0.651},"C6":{"0":0.583,"1":0.382,"2":0.54,"3":0.549,"4":0.59,"5":0.57,"6":0.553,"7":0.553,"8":0.583,"9":0.546},"C7":{"0":0.726,"1":0.333,"2":0.583,"3":0.726,"4":0.738,"5":0.702,"6":0.714,"7":0.661,"8":0.661,"9":0.708},"C8":{"0":0.673,"1":0.497,"2":0.642,"3":0.624,"4":0.661,"5":0.636,"6":0.648,"7":0.576,"8":0.679,"9":0.648},"C9":{"0":0.81,"1":0.514,"2":0.785,"3":0.785,"4":0.927,"5":0.793,"6":0.766,"7":0.682,"8":0.818,"9":0.791},"C10":{"0":0.641,"1":0.571,"2":0.755,"3":0.716,"4":0.694,"5":0.724,"6":0.652,"7":0.638,"8":0.721,"9":0.652},"C11":{"0":0.656,"1":0.611,"2":0.67,"3":0.648,"4":0.652,"5":0.733,"6":0.663,"7":0.615,"8":0.604,"9":0.689},"C12":{"0":0.584,"1":0.399,"2":0.519,"3":0.531,"4":0.784,"5":0.512,"6":0.546,"7":0.567,"8":0.582,"9":0.577}};
// Which vzorník images exist on disk (filled by probeAssets). Missing → web-font fallback.
const ASSET_OK = {};
const probeAssets = onChange => {
  const urls = [...Object.keys(GLYPH).map(id => ['C:' + id, 'assets/vzorniky/' + id + '/0.png']), ...['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P8', 'P9', 'P10', 'P13', 'P14', 'P15'].map(id => ['P:' + id, 'assets/vzorniky/pisma/' + id + '.png'])];
  urls.forEach(([k, u]) => { const im = new Image(); im.onload = () => { ASSET_OK[k] = true; onChange(); }; im.src = u; });
};
const glyphs = (txt, style, hpx, ff) => [...txt].map(ch => { const ar = ASSET_OK['C:' + style] && GLYPH[style] && GLYPH[style][ch];
  return ar ? { isImg: true, isTxt: false, w: (hpx * ar).toFixed(1) + 'px', h: hpx + 'px', mask: 'url("assets/vzorniky/' + style + '/' + ch + '.png") center/100% 100% no-repeat' }
    : { isImg: false, isTxt: true, ch, ff: ff || "'Libre Baskerville',serif", fs: Math.round(hpx * (ff ? 1 : 0.8)) + 'px' }; });
const PISMA = [
  F('P1', "'Junge',serif"), F('P2', "'Eagle Lake',serif", 400, 0, '.05em'), F('P3', "'Courgette',cursive", 400, 0, '.04em'), F('P4', "'Cormorant Garamond',serif", 600, 'italic', '.06em'),
  F('P5', "'Rochester',cursive", 400, 0, '.04em'), F('P6', "'Lobster Two',cursive", 700, 'italic'), F('P8', "'Jim Nightshade',cursive"), F('P9', "'Great Vibes',cursive"),
  F('P10', "'Rouge Script',cursive", 400, 0, '.04em'), F('P13', "'Pinyon Script',cursive"), F('P14', "'Eagle Lake',serif", 400, 0, '.04em', 0, 0, 'small-caps'), F('P15', "'Della Respira',serif", 400, 0, '.02em', 0, 0, 'small-caps'),
];
const PAINT = { 'žlutá světlá':'#ecd36a', 'žlutá tmavá':'#e6a923', 'oranžová':'#e98a3c', 'červená':'#d8262b', 'vínová':'#a3283a', 'růžová tmavá':'#d76a73', 'cihlová':'#c06e66', 'lososová':'#efb1a4',
  'modrá světlá':'#6f9ad8', 'modrá střední':'#5a6eb6', 'modrá tmavá':'#1f3f7a', 'modrá tyrkys':'#2fa6cb', 'zeleno modrá':'#1f8a94', 'zelená akvarel':'#3f6236', 'zelená tmavá':'#24432e', 'zelená střední':'#4f6446',
  'šedá':'#50555c', 'černá':'#26272a', 'hnědo černá':'#3a2a24', 'hnědá tmavá':'#4e2f1f', 'hnědá světlá':'#c47a3a', 'béžová':'#d8b17a', 'fialová':'#c79bc6', 'zelená světlá':'#a6b63c' };
const TARGETS = [['cislo', 'číslo', 'barvaC'], ['napis', 'nápis', 'barvaN'], ['okraj', 'okraj', 'barvaO']];
const EMPTY_FORM = { cislo: '', ulice: '', barva: 'modrá', tvar: 'ovál', provedeni: 'plochý', jmeno: '', email: '', pozn: '', vzor: null, src: null, mode: 'vzor', pismoC: 'C1', pismoP: 'P15', barvaC: 'modrá tmavá', barvaN: 'modrá tmavá', barvaO: 'modrá tmavá', prefix: 'bez', rozvrzeni: 'nápis pod', oblouk: 'rovně', horni: '' };
const PREFIXY = ['bez', 'č.p.', 'Čís.', '№', 'ev.č.', 'číslo'], ROZVRZENI = ['jen číslo', 'nápis pod', 'nápis nad', 'nad i pod'], OBLOUK = ['rovně', 'do oblouku'];
const _mc = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
const measureCh = (ch, font, fs) => { if (!_mc) return fs * .52; _mc.font = font; return _mc.measureText(ch).width; };
const arcText = (text, fs, ls, W, H, top, oval, font, upper) => { const ins = 22 + fs * .55; let a, b, cy;
  if (oval) { a = W / 2 - ins; b = H / 2 - ins; cy = H / 2; } else { a = W * .75; b = H * .55; cy = top ? ins + b : H - ins - b; }
  const chars = [...text], ws = chars.map(ch => measureCh(upper ? ch.toUpperCase() : ch, font, fs) + ls), total = ws.reduce((s, w) => s + w, 0), sp = t => Math.hypot(a * Math.sin(t), b * Math.cos(t));
  const step = (t0, d, dir) => { let t = t0, s = 0; while (s < d) { s += sp(t) * .002; t += .002 * dir; } return t; };
  const dir = top ? 1 : -1; let t = step(top ? -Math.PI / 2 : Math.PI / 2, total / 2, -dir);
  return chars.map((ch, i) => { const adv = ws[i], m = step(t, adv / 2, dir), x = W / 2 + a * Math.cos(m), y = cy + b * Math.sin(m), dx = dir * -a * Math.sin(m), dy = dir * b * Math.cos(m); t = step(t, adv, dir);
    return { ch, fs: fs + 'px', l: (x / W * 100).toFixed(2) + '%', tp: (y / H * 100).toFixed(2) + '%', r: (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1) + 'deg' }; }); };
const SHAPES = { 'ovál': { aspect: '1.4', radius: '50%', clip: 'none' }, 'kruh': { aspect: '1', radius: '50%', clip: 'none' }, 'obdélník': { aspect: '1.4', radius: '6px', clip: 'none' }, 'seříznuté rohy': { aspect: '1.4', radius: '0', poly: (W, H) => { const c = H * .14; return [[c, 0], [W - c, 0], [W, c], [W, H - c], [W - c, H], [c, H], [0, H - c], [0, c]]; }, clip: 'polygon(10% 0,90% 0,100% 14%,100% 86%,90% 100%,10% 100%,0 86%,0 14%)' }, 'oblouk': { aspect: '1.1', radius: '50% 50% 6px 6px / 42% 42% 6px 6px', clip: 'none' }, 'šestiúhelník': { aspect: '1.1547', radius: '0', poly: (W, H) => [[W / 4, 0], [W * 3 / 4, 0], [W, H / 2], [W * 3 / 4, H], [W / 4, H], [0, H / 2]], clip: 'polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)' } };
const insetPoly = (p, d) => { const n = p.length, L = []; for (let i = 0; i < n; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % n], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len; L.push([x1 + nx * d, y1 + ny * d, dx, dy]); } return L.map((a, i) => { const b = L[(i + n - 1) % n], den = b[2] * a[3] - b[3] * a[2], s = ((a[0] - b[0]) * a[3] - (a[1] - b[1]) * a[2]) / den; return [b[0] + b[2] * s, b[1] + b[3] * s]; }); };
const polySvg = (sh, ring, plast) => { const W = 320, H = W / parseFloat(sh.aspect), P = sh.poly(W, H), pts = d => insetPoly(P, d).map(q => q[0].toFixed(2) + ',' + q[1].toFixed(2)).join(' ');
  const g = plast ? '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3c2814" stop-opacity=".16"/></linearGradient></defs>' : '';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H.toFixed(2) + '" preserveAspectRatio="none">' + g + '<polygon points="' + pts(0) + '" fill="' + ring + '"/><polygon points="' + pts(9) + '" fill="#f6f1e2"/><polygon points="' + pts(13) + '" fill="' + ring + '"/><polygon points="' + pts(15) + '" fill="#f6f1e2"/>' + (plast ? '<polygon points="' + pts(15) + '" fill="url(#g)"/>' : '') + '</svg>';
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'; };
const STEPS = [
  { n: '01', title: 'Vyberte vzor', text: 'Inspirujte se v galerii, nebo mi popište vlastní představu — číslo, barvu, tvar.' },
  { n: '02', title: 'Návrh a cena', text: 'Do 3 pracovních dnů pošlu skicu a přesnou cenu. Upravujeme, dokud nesedí.' },
  { n: '03', title: 'Malování', text: 'Po schválení cedulku vytvaruji z keramiky, ručně pomaluji a vypálím. Trvá to obvykle 2–3 týdny.' },
  { n: '04', title: 'Předání', text: 'Cedulku pošlu bezpečně zabalenou i s kotvením, nebo si ji vyzvednete osobně.' },
];
const mod = (a, n) => ((a % n) + n) % n;
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

export { ASSET_OK, probeAssets, DATA, COLORS, TVARY, PROVEDENI, ITEMS, ZOOMS, CISLA, GLYPH, glyphs, PISMA, PAINT, TARGETS, EMPTY_FORM, PREFIXY, ROZVRZENI, OBLOUK, arcText, SHAPES, polySvg, STEPS, mod, rng };
