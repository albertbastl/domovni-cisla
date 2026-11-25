import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import htm from 'https://esm.sh/htm@3.1.1';
import {
  ASSET_OK, probeAssets, COLORS, TVARY, PROVEDENI, ITEMS, ZOOMS, CISLA, glyphs, PISMA, PAINT, TARGETS, EMPTY_FORM,
  PREFIXY, ROZVRZENI, OBLOUK, plateLayout, SHAPES, plateSvg, STEPS, FAKTA, mod, rng,
} from './data.js';

const html = htm.bind(React.createElement);
const HERO_PAD = 48; // world units, mezera mezi textem hero a čísly
// měřítko plochy úměrné oknu: na 1440×900 = 1, na každém monitoru stejný výřez
const viewScale = (w, h) => Math.max(0.6, Math.min(3, Math.min(w / 1440, h / 900)));
// dotykové zařízení (bez myši) → jiný text nápovědy
const TOUCH = typeof matchMedia === 'function' && matchMedia('(hover: none) and (pointer: coarse)').matches;

// "a:b;c:d" → { a: 'b', c: 'd' } (keeps the design's inline CSS readable)
const cssCache = new Map();
const css = s => {
  let o = cssCache.get(s);
  if (o) return o;
  o = {};
  for (const d of s.split(';')) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    const k = d.slice(0, i).trim();
    if (!k) continue;
    const key = k.replace(/^-(webkit|moz|ms)-/, (m, p) => p[0].toUpperCase() + p.slice(1) + '-').replace(/-([a-z])/g, (m, c) => c.toUpperCase());
    o[key] = d.slice(i + 1).trim();
  }
  if (cssCache.size > 4000) cssCache.clear();
  cssCache.set(s, o);
  return o;
};

class App extends React.Component {
  state = { ox: 0, oy: 0, zi: 1, z: 0.68, vw: 1280, vh: 800, sel: null, hover: -1, f: { barva: [], tvar: [], provedeni: [] }, filterOpen: false, section: 'barva', menuOpen: false, fade: false, view: 'canvas', shown: 0, heroW: 520, heroH: 290, navOn: false, popDone: false, page: null, sent: false, err: false, form: { ...EMPTY_FORM }, cTarget: 'cislo', assets: 0 };
  pageRef = React.createRef();
  stageRef = React.createRef();
  heroRef = React.createRef();

  // skutečná velikost textu hero (závisí na fontu) → podle ní se odsouvají čísla
  measureHero() {
    const el = this.heroRef.current;
    if (!el) return;
    // šířka = nejširší potomek (vč. přetečení), ne jen box — Safari počítá max-content flexu jinak
    const w = Math.ceil(Math.max(el.offsetWidth, ...[...el.children].map(c => Math.max(c.offsetWidth, c.scrollWidth)))), h = Math.ceil(Math.max(el.offsetHeight, el.scrollHeight));
    if (w && h && (Math.abs(w - this.state.heroW) > 1 || Math.abs(h - this.state.heroH) > 1)) this.setState({ heroW: w, heroH: h });
  }

  componentDidUpdate() { this.measureHero(); }

  go(page, extra) { if (this.pageRef.current) this.pageRef.current.scrollTop = 0; this.setState({ page, sel: null, menuOpen: false, ...(extra || {}) }); }

  componentDidMount() {
    probeAssets(() => this.setState(s => ({ assets: s.assets + 1 })));
    // náhled měří šířky textu canvasem → po načtení webfontů přepočítat
    if (document.fonts) { this.onFonts = () => this.setState(s => ({ assets: s.assets + 1 })); document.fonts.addEventListener('loadingdone', this.onFonts); }
    this.onResize = () => {
      const el = this.stageRef.current, vw = (el && el.clientWidth) || innerWidth || 1280, vh = (el && el.clientHeight) || innerHeight || 800;
      const k = viewScale(vw, vh), f = this._k ? k / this._k : 1; this._k = k;
      // při změně měřítka přepočítat zoom kolem středu obrazovky
      this.setState(s => f === 1 ? { vw, vh } : { vw, vh, z: s.z * f, ox: vw / 2 - (vw / 2 - s.ox) * f, oy: vh / 2 - (vh / 2 - s.oy) * f });
    };
    this._k = viewScale(innerWidth || 1280, innerHeight || 800); this.setState(s => ({ z: s.z * this._k }));
    this.onResize();
    this.center = () => {
      if (this.drag || this.moved) return;
      const el = this.stageRef.current, vw = (el && el.clientWidth) || innerWidth, vh = (el && el.clientHeight) || innerHeight;
      this.setState({ vw, vh }, () => {
        const s = this.layout().hero;
        if (s) this.setState(st => ({ ox: vw / 2 - (s.x + s.w / 2) * st.z, oy: vh / 2 - (s.y + s.h / 2) * st.z }));
      });
    };
    this.c1 = setTimeout(this.center, 0); this.c2 = setTimeout(this.center, 250);
    addEventListener('resize', this.onResize);
    if (window.ResizeObserver && this.stageRef.current) { this.ro = new ResizeObserver(this.onResize); this.ro.observe(this.stageRef.current); }
    this.onMove = e => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.drag.x = e.clientX; this.drag.y = e.clientY; this.drag.dist += Math.abs(dx) + Math.abs(dy);
      const now = performance.now(), dt = Math.max(1, now - this.drag.t); this.drag.t = now;
      this.vx = dx / dt * 16; this.vy = dy / dt * 16;
      this.setState(s => ({ ox: s.ox + dx, oy: s.oy + dy }));
    };
    this.onUp = () => {
      if (!this.drag) return;
      this.moved = this.drag.dist > 6; this.drag = null;
      if (this.stageRef.current) this.stageRef.current.style.cursor = 'grab';
      this.glide();
    };
    addEventListener('pointermove', this.onMove);
    addEventListener('pointerup', this.onUp);
    this.onKey = e => { if (e.key === 'Escape') this.setState(s => s.sel || s.menuOpen ? { sel: null, menuOpen: false } : { page: null }); };
    addEventListener('keydown', this.onKey);
    // intro: tiles pop in, then zoom to default level and reveal footer
    this.iv = setInterval(() => {
      const n = this.visCount || 0;
      if (n && this.state.shown >= n) { clearInterval(this.iv); this.t1 = setTimeout(() => { this.setState({ popDone: true }); this.animate({ z: ZOOMS[1] * this._k }); this.t2 = setTimeout(() => this.setState({ navOn: true }), 600); }, 350); return; }
      this.setState(s => ({ shown: s.shown + 3 }));
    }, 30);
  }

  componentWillUnmount() {
    removeEventListener('resize', this.onResize); if (this.ro) this.ro.disconnect();
    removeEventListener('pointermove', this.onMove); removeEventListener('pointerup', this.onUp); removeEventListener('keydown', this.onKey); if (this.onFonts) document.fonts.removeEventListener('loadingdone', this.onFonts);
    cancelAnimationFrame(this.raf); clearTimeout(this.ft); clearInterval(this.iv); clearTimeout(this.t1); clearTimeout(this.t2); clearTimeout(this.c1); clearTimeout(this.c2);
  }

  glide() {
    cancelAnimationFrame(this.raf);
    const step = () => {
      this.vx *= 0.94; this.vy *= 0.94;
      if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) return;
      this.setState(s => ({ ox: s.ox + this.vx, oy: s.oy + this.vy }));
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  animate(to) {
    cancelAnimationFrame(this.raf);
    const { ox, oy, z, vw, vh } = this.state, t0 = performance.now();
    const cx = vw / 2, cy = vh / 2, wx = (cx - ox) / z, wy = (cy - oy) / z;
    const step = now => {
      const p = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - p, 3);
      const nz = z + (to.z - z) * e;
      const next = to.center
        ? { z: nz, ox: ox + (to.ox - ox) * e, oy: oy + (to.oy - oy) * e }
        : { z: nz, ox: cx - wx * nz, oy: cy - wy * nz };
      this.setState(next);
      if (p < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  setZoom(zi) {
    zi = Math.max(0, Math.min(2, zi));
    if (zi === this.state.zi) return;
    this.setState({ zi }); this.animate({ z: ZOOMS[zi] * this._k });
  }

  filtered() {
    const { f } = this.state;
    return ITEMS.filter(it => (!f.barva.length || f.barva.includes(it.barva)) && (!f.tvar.length || f.tvar.includes(it.tvar)) && (!f.provedeni.length || f.provedeni.includes(it.provedeni)));
  }

  layout() {
    const { vw, vh, f } = this.state;
    const { heroW: HERO_W, heroH: HERO_H } = this.state;
    const key = vw + 'x' + vh + JSON.stringify(f) + HERO_W + 'x' + HERO_H;
    if (this._lk === key) return this._l;
    const items = this.filtered(), r = rng(11), S = 320, zmin = ZOOMS[0] * (this._k || 1);
    const NC = Math.max(8, Math.ceil(vw / (S * zmin)) + 2);
    const order = [];
    if (items.length) { const a = items.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } order.push(...a); }
    const R = 300, NR = Math.max(4, Math.ceil(vh / (R * zmin)) + 2);
    const slots = []; let k = 0;
    const active = f.barva.length || f.tvar.length || f.provedeni.length;
    if (active && order.length) {
      // filtered: finite cluster, centred on screen
      const n = order.length, cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.5)));
      order.forEach((item, i) => {
        const c = i % cols, r0 = Math.floor(i / cols), w = 120 + r() * 130, h = w * 0.8;
        const cx = c * S + S / 2 + (r0 % 2) * S / 3, cy = r0 * R + R / 2 + (c % 2) * R / 3;
        slots.push({ x: cx - w / 2, y: cy - h / 2, w, h, item });
      });
      const x0 = Math.min(...slots.map(s => s.x)), x1 = Math.max(...slots.map(s => s.x + s.w)), y0 = Math.min(...slots.map(s => s.y)), y1 = Math.max(...slots.map(s => s.y + s.h));
      this._lk = key; this._l = { slots, W: 1, H: 1, finite: true, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
      return this._l;
    }
    // unfiltered: infinite wrapping canvas
    if (order.length) for (let r0 = 0; r0 < NR; r0++) for (let c = 0; c < NC; c++) {
      const w = 120 + r() * 130, h = w * 0.8;
      const cx = c * S + S / 2, cy = r0 * R + R / 2 + (c % 2) * R / 2;
      slots.push({ x: cx - w / 2, y: cy - h / 2, w, h, item: order[k++ % order.length] });
    }
    // hero: nahradí prostřední číslo (n32), okolní čísla, která by překážela, vyhodí
    let hero = null;
    const mid = slots.find(q => q.item.src.endsWith('/n32.webp')) || slots[Math.floor(slots.length / 2)];
    if (mid) {
      const hx = mid.x + mid.w / 2 - HERO_W / 2, hy = mid.y + mid.h / 2 - HERO_H / 2, pad = HERO_PAD;
      hero = { x: hx, y: hy, w: HERO_W, h: HERO_H };
      // čísla, která by do hero zasahovala, odsune od středu těsně k jeho okraji
      const mx = hx + HERO_W / 2, my = hy + HERO_H / 2;
      // pokud by odsunuté číslo narazilo do souseda, zmenší se (min. 60 %), jinak se vynechá
      // plocha se opakuje (perioda W×H) → každé číslo posunout do kopie nejbližší hero, aby se kontrolovaly i kolize přes šev
      const PW = NC * S, PH = NR * R;
      for (let i = 0; i < slots.length; i++) {
        const q = slots[i], ddx = q.x + q.w / 2 - mx, ddy = q.y + q.h / 2 - my;
        slots[i] = { ...q, x: q.x - Math.round(ddx / PW) * PW, y: q.y - Math.round(ddy / PH) * PH };
      }
      const hit = (q, g) => q.x < hx + HERO_W + g && q.x + q.w > hx - g && q.y < hy + HERO_H + g && q.y + q.h > hy - g;
      const touch = (a, b, g) => a.x < b.x + b.w + g && a.x + a.w > b.x - g && a.y < b.y + b.h + g && a.y + a.h > b.y - g;
      const moved = [], keep = slots.filter(q => !hit(q, pad));
      for (const q of slots) {
        if (!hit(q, pad)) continue;
        const cx = q.x + q.w / 2, cy = q.y + q.h / 2, dx = cx - mx, dy = cy - my;
        let placed = null;
        for (let sc = 1; sc >= 0.6 && !placed && (dx || dy); sc -= 0.1) {
          const w = q.w * sc, h = q.h * sc;
          const tx = dx ? (HERO_W / 2 + w / 2 + pad) / Math.abs(dx) : Infinity, ty = dy ? (HERO_H / 2 + h / 2 + pad) / Math.abs(dy) : Infinity, t = Math.min(tx, ty);
          const c = { ...q, w, h, x: mx + dx * t - w / 2, y: my + dy * t - h / 2 };
          if (!keep.some(o => touch(c, o, 24)) && !moved.some(o => touch(c, o, 24))) placed = c;
        }
        if (placed) moved.push(placed);
      }
      slots.length = 0; slots.push(...keep, ...moved);
    }
    this._lk = key; this._l = { slots, W: NC * S, H: NR * R, hero };
    return this._l;
  }

  applyFilter(fn) {
    clearTimeout(this.ft);
    this.setState({ fade: true });
    this.ft = setTimeout(() => this.setState(s => ({ f: fn(s.f), fade: false }), () => {
      const L = this.layout();
      if (L.finite) { cancelAnimationFrame(this.raf); this.setState(st => ({ ox: st.vw / 2 - L.cx * st.z, oy: st.vh / 2 - L.cy * st.z })); }
    }), 200);
  }

  toggleOpt(group, val) {
    this.applyFilter(f => { const cur = f[group]; return { ...f, [group]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] }; });
  }

  vals() {
    const { ox, oy, z, zi, vw, sel, hover, f, filterOpen, section, menuOpen, fade } = this.state;
    const { slots, W, H, finite, hero } = this.layout();
    const Wz = W * z, Hz = H * z, m = 280 * z, tiles = [], shown = this.state.shown;
    slots.forEach((s, i) => {
      const w = s.w * z, h = s.h * z;
      const x = finite ? s.x * z + ox : mod(s.x * z + ox + m, Wz) - m, y = finite ? s.y * z + oy : mod(s.y * z + oy + m, Hz) - m;
      tiles.push({
        _i: i, w, h, transform: `translate3d(${x}px,${y}px,0)`, bg: `url("${s.item.src}")`, opacity: fade ? 0 : 1,
        vzor: s.item.vzor, hovered: hover === i,
        enter: () => { if (!this.drag) this.setState({ hover: i }); },
        leave: () => this.setState(st => st.hover === i ? { hover: -1 } : null),
        open: () => { if (!this.moved) this.setState({ sel: s.item, hover: -1 }); },
      });
    });
    const hs = n => (Math.imul(n + 1, 2654435761) >>> 0) % 100003;
    const ord = tiles.map(t => t._i).sort((a, b) => hs(a) - hs(b));
    this.visCount = tiles.length;
    tiles.forEach(t => { const on = this.state.popDone || ord.indexOf(t._i) < shown; t.opacity = on ? t.opacity : 0; t.pop = on ? 1 : 0.5; });
    const navOn = this.state.navOn;
    const narrow = vw < 900, phone = vw < 600, heroBig = vw < 1000;
    const navZoom = vw < 700 ? 1 : Math.min(2.4, Math.max(1.2, vw / 1500));
    const activeChips = [
      ...f.barva.map(v => ({ label: v, color: COLORS[v], remove: () => this.toggleOpt('barva', v) })),
      ...f.tvar.map(v => ({ label: v, color: null, remove: () => this.toggleOpt('tvar', v) })),
      ...f.provedeni.map(v => ({ label: v, color: null, remove: () => this.toggleOpt('provedeni', v) })),
    ];
    const mk = (group, label, opts, swatch) => {
      const open = section === group;
      return {
        group, label, sign: open ? '|' : '+', signColor: open ? '#b0b0a6' : '#1b1b1b',
        showSwatches: open && swatch, showChips: open && !swatch,
        toggle: () => this.setState({ section: open ? null : group }),
        opts: opts.map(v => {
          const on = f[group].includes(v);
          return { label: v, color: COLORS[v] || null, toggle: () => this.toggleOpt(group, v),
            ring: on ? 'inset 0 0 0 7px ' + COLORS[v] + ', inset 0 0 0 13px #fff' : 'none',
            chipBg: on ? '#1b1b1b' : '#e5e5dc', chipColor: on ? '#fff' : '#1b1b1b' };
        }),
      };
    };
    const crowded = narrow || filterOpen;
    const { page, form, sent, err } = this.state;
    const nav = p => e => { if (e) e.preventDefault(); this.go(p); };
    const setF = k => e => { const v = e.target.value; this.setState(s => ({ form: { ...s.form, [k]: v } })); };
    const pickF = (k, v) => () => this.setState(s => ({ form: { ...s.form, [k]: v } }));
    const sh = SHAPES[form.tvar] || SHAPES['ovál'], plast = form.provedeni === 'plastický', txt = form.cislo.trim() || '32';
    const okCislo = !!form.cislo.trim(), okEmail = /.+@.+\..+/.test(form.email);
    const kickers = { omne: 'o mně', cisla: 'o číslech', jak: 'jak objednat', kontakt: 'kontakt', objednat: 'objednávka' };
    const pick = ['V38', 'V27', 'V13'].map(v => ITEMS.find(it => it.vzor === v)).filter(Boolean);
    const wideNow = Math.min(vw, innerWidth || vw) >= 1200;
    const cS = CISLA.find(c => c.id === form.pismoC) || CISLA[0], pS = PISMA.find(c => c.id === form.pismoP) || PISMA[0];
    const tgt = TARGETS.find(t => t[0] === this.state.cTarget) || TARGETS[0];
    const selB = on => ({ border: on ? '#1b1b1b' : '#e0e0d6', bg: on ? '#fff' : '#fbfbf6' });
    const pColO = PAINT[form.barvaO], streetTxt = form.ulice.trim();
    const roz = form.rozvrzeni || 'nápis pod', pre = form.prefix || 'bez';
    const topTxt = roz === 'nad i pod' ? (form.horni || '').trim() : roz === 'nápis nad' ? streetTxt : '', botTxt = roz === 'nápis pod' || roz === 'nad i pod' ? streetTxt : '';
    const chipF = (k, cur) => v => ({ label: v, pick: pickF(k, v), bg: cur === v ? '#1b1b1b' : '#e5e5dc', fg: cur === v ? '#fff' : '#1b1b1b' });
    const lay = form.mode === 'vlastni' ? plateLayout({ tvar: form.tvar, sh, txt, cS, pS, pre, topTxt, botTxt, oblouk: form.oblouk, velC: +form.velC, velN: +form.velN, rozestup: +form.rozestup, posun: +form.posun || 0 }) : { arc: [], lines: [], glyphs: [] };
    const SL_DEF = { velC: 100, velN: 100, rozestup: 100, posun: 0 }, slider = (k, label, lo, hi, step, fmt) => { const val = form[k] === undefined || form[k] === '' ? SL_DEF[k] : +form[k]; return { key: k, label, lo, hi, step, val, txt: fmt(val), on: setF(k) }; };
    const pct = v => v + ' %';
    return {
      phone, heroBig, touch: TOUCH, hasPage: !!page, pageKicker: kickers[page] || '', pageZoom: navZoom > 1 ? Math.max(1, navZoom * 0.8) : 1,
      isOmne: page === 'omne', isCisla: page === 'cisla', isJak: page === 'jak', isKontakt: page === 'kontakt', isObjednat: page === 'objednat',
      lineOmne: page === 'omne' ? '#1b1b1b' : 'transparent', lineCisla: page === 'cisla' ? '#1b1b1b' : 'transparent', lineJak: page === 'jak' ? '#1b1b1b' : 'transparent', lineKontakt: page === 'kontakt' ? '#1b1b1b' : 'transparent',
      goHome: e => { if (e) e.preventDefault(); this.setState({ page: null, sel: null, menuOpen: false }); },
      goGrid: e => { if (e) e.preventDefault(); this.setState({ page: null, sel: null, menuOpen: false, view: 'grid' }); },
      goOmne: nav('omne'), goCisla: nav('cisla'), goJak: nav('jak'), goKontakt: nav('kontakt'),
      goObjednat: e => { if (e) e.preventDefault(); this.go('objednat', this.state.sent ? { sent: false, err: false, form: { ...EMPTY_FORM } } : null); },
      orderLike: e => { e.preventDefault(); const s = this.state.sel; this.go('objednat', { sent: false, err: false, form: { ...EMPTY_FORM, cislo: s.label, barva: s.barva, tvar: s.tvar, provedeni: s.provedeni, vzor: s.vzor, src: s.src, mode: 'vzor' } }); },
      notWide: !wideNow, menuLabel: menuOpen ? 'zavřít' : 'menu',
      omneWorks: pick.map(it => ({ key: it.vzor, bg: 'url("' + it.src + '")', open: () => this.setState({ sel: it }) })),
      steps: STEPS,
      form, sent, hasErr: err, hasRef: !!form.vzor, refBg: form.src ? 'url("' + form.src + '")' : 'none',
      isVzor: form.mode !== 'vlastni', isVlastni: form.mode === 'vlastni',
      setModeVzor: () => this.setState(s => ({ form: { ...s.form, mode: 'vzor' } })), setModeVlastni: () => this.setState(s => ({ form: { ...s.form, mode: 'vlastni' } })),
      modeVzorBg: form.mode !== 'vlastni' ? '#fbfbf6' : 'transparent', modeVzorSh: form.mode !== 'vlastni' ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
      modeVlastniBg: form.mode === 'vlastni' ? '#fbfbf6' : 'transparent', modeVlastniSh: form.mode === 'vlastni' ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
      refPicks: ITEMS.map(it => ({ vzor: it.vzor, bg: 'url("' + it.src + '")', pick: () => this.setState(s => ({ form: { ...s.form, vzor: it.vzor, src: it.src, barva: it.barva, tvar: it.tvar, provedeni: it.provedeni } })) })),
      noteHelp: form.mode === 'vlastni' ? 'Popište, jak si cedulku představujete — ornament, písmo, styl domu. Ráda všechno vyslechnu.' : 'Chcete na vzoru něco změnit? Jinou barvu, kytičky, jméno domu… Ráda všechno vyslechnu.',
      notePh: form.mode === 'vlastni' ? 'např. modré kytičky po obvodu, psací písmo, dům je bílý se zelenými okenicemi…' : 'např. stejný vzor, ale v modré a s nápisem „U Nováků“…',
      clearRef: () => this.setState(s => ({ form: { ...s.form, vzor: null, src: null } })),
      errCislo: err && !okCislo ? '#b5552f' : '#d6d6cc', errEmail: err && !okEmail ? '#b5552f' : '#d6d6cc',
      onCislo: setF('cislo'), onUlice: setF('ulice'), onJmeno: setF('jmeno'), onEmail: setF('email'), onPozn: setF('pozn'), onHorni: setF('horni'),
      sliders: [slider('velC', 'číslo', 40, 160, 2, pct), slider('velN', 'nápis', 40, 220, 2, pct), slider('rozestup', 'rozestup', 40, 170, 2, pct), slider('posun', 'výška', -25, 25, 1, v => v > 0 ? '↓ ' + v : v < 0 ? '↑ ' + -v : 'střed')],
      slidersDirty: Object.keys(SL_DEF).some(k => form[k] !== undefined && +form[k] !== SL_DEF[k]), resetSliders: () => this.setState(s => ({ form: { ...s.form, ...SL_DEF } })),
      fTvary: TVARY.map(chipF('tvar', form.tvar)),
      fProvedeni: PROVEDENI.map(chipF('provedeni', form.provedeni)),
      cStyle: cS, pStyle: pS,
      fCisla: CISLA.map(c => ({ ...c, glyphs: glyphs(txt, c.id, 30, c.ff), pick: pickF('pismoC', c.id), ...selB(c.id === cS.id) })),
      fPisma: PISMA.map(c => ({ ...c, hasImg: !!ASSET_OK['P:' + c.id], mask: 'url("assets/vzorniky/pisma/' + c.id + '.png") left center/contain no-repeat', pick: pickF('pismoP', c.id), ...selB(c.id === pS.id) })),
      cTargets: TARGETS.map(([k, l, fk]) => ({ key: k, label: l, color: PAINT[form[fk]], pick: () => this.setState({ cTarget: k }), bg: k === tgt[0] ? '#fbfbf6' : 'transparent', sh: k === tgt[0] ? '0 1px 2px rgba(0,0,0,.1)' : 'none' })),
      cTargetLabel: tgt[1], cTargetName: form[tgt[2]],
      fPaint: Object.keys(PAINT).map(v => ({ label: v, color: PAINT[v], pick: pickF(tgt[2], v), ring: form[tgt[2]] === v ? '0 0 0 3px #f4f4ec, 0 0 0 4.5px #1b1b1b' : 'inset 0 0 0 1px rgba(0,0,0,.06)' })),
      fPrefix: PREFIXY.map(chipF('prefix', pre)), fRozvrzeni: ROZVRZENI.map(chipF('rozvrzeni', roz)), fOblouk: OBLOUK.map(chipF('oblouk', form.oblouk === 'do oblouku' ? 'po okraji' : form.oblouk || 'rovně')),
      showHorni: roz === 'nad i pod',
      plate: { ...sh, ...lay, preTxt: pre, bg: plateSvg(sh, pColO, plast), fg: PAINT[form.barvaC], sfg: PAINT[form.barvaN], text: txt,
        pff: pS.ff, pfw: pS.fw, pfs: pS.fs, pls: pS.ls, ptt: pS.tt, pfv: pS.fv,
        // písmo je vždy malované naplocho — plastický je jen reliéf cedulky
        ink: 'color:' + PAINT[form.barvaC], sink: 'color:' + PAINT[form.barvaN], tshadow: 'none' },
      submit: () => { if (!okCislo || !okEmail) return this.setState({ err: true }); this.setState({ sent: true, err: false }); if (this.pageRef.current) this.pageRef.current.scrollTop = 0; },
      newOrder: () => this.setState({ sent: false, err: false, form: { ...EMPTY_FORM } }),
      tiles, navOpacity: navOn ? 1 : 0, navShift: navOn ? 0 : 24, navPE: navOn ? 'auto' : 'none',
      onDown: e => {
        cancelAnimationFrame(this.raf);
        this.moved = false; this.vx = this.vy = 0;
        this.drag = { x: e.clientX, y: e.clientY, t: performance.now(), dist: 0 };
        e.currentTarget.style.cursor = 'grabbing';
        if (this.state.menuOpen) this.setState({ menuOpen: false });
      },
      onWheel: e => {
        if (this.state.view !== 'canvas' || this.state.sel || this.state.filterOpen || this.state.page) return;
        const now = performance.now(), dy = e.deltaY;
        if (!dy || now - (this._wt || 0) < 350) { this._wt = Math.abs(dy) > 4 ? now : (this._wt || 0); return; }
        this._wt = now;
        this.setZoom(this.state.zi + (dy < 0 ? 1 : -1));
      },
      zoomIn: () => this.setZoom(zi + 1), zoomOut: () => this.setZoom(zi - 1),
      inOpacity: zi === 2 ? 0.35 : 1, outOpacity: zi === 0 ? 0.35 : 1,
      wide: wideNow,
      hero: hero && { transform: `translate3d(${mod(hero.x * z + ox + hero.w * z, Wz) - hero.w * z}px,${mod(hero.y * z + oy + hero.h * z, Hz) - hero.h * z}px,0) scale(${z})`, on: this.state.popDone && !fade },
      heroGrid: () => { if (!this.moved) this.setState({ view: 'grid' }); },
      isGrid: this.state.view === 'grid', showZoom: !filterOpen, filterMax: (Math.min(vw, innerWidth || vw) / navZoom - (wideNow ? 500 : phone && filterOpen ? 24 : phone ? 200 : 230)) + 'px', showSeg: !(phone && filterOpen), navZoom, headerH: 68 * navZoom, footerH: 72 * navZoom,
      hintText: this.state.view === 'grid' ? '↕ scrollujte a prohlížejte' : '↔ táhněte a prohlížejte',
      gridCols: 'repeat(auto-fill,minmax(' + [130, 210, 340][zi] * (this._k || 1) + 'px,1fr))', gridGap: [[36, 20], [56, 32], [72, 48]][zi].map(g => g * (this._k || 1) + 'px').join(' '), gridMax: 1500 * (this._k || 1) / (navZoom > 1 ? Math.max(1, navZoom * 0.8) : 1),
      setCanvas: () => this.setState({ view: 'canvas' }), setGrid: () => this.setState({ view: 'grid' }),
      canvasBg: this.state.view === 'canvas' ? '#1b1b1b' : '#f4f4ec', canvasColor: this.state.view === 'canvas' ? '#fff' : '#1b1b1b',
      gridBg: this.state.view === 'grid' ? '#1b1b1b' : '#f4f4ec', gridColor: this.state.view === 'grid' ? '#fff' : '#1b1b1b',
      gridItems: this.filtered().map(it => ({ ...it, bg: 'url("' + it.src + '")', opacity: fade ? 0 : 1, open: () => this.setState({ sel: it }) })),
      showHint: !crowded, chipsBottom: Math.ceil(72 * navZoom) + 14,
      menuOpen, toggleMenu: () => this.setState({ menuOpen: !menuOpen }),
      filterOpen,
      openFilter: () => this.setState({ filterOpen: true, menuOpen: false }),
      closeFilter: () => this.setState({ filterOpen: false }),
      sections: [mk('barva', 'barva', Object.keys(COLORS), true), mk('tvar', 'tvar', TVARY, false), mk('provedeni', 'provedení', PROVEDENI, false)],
      clearFilters: () => { this.applyFilter(() => ({ barva: [], tvar: [], provedeni: [] })); this.setState({ zi: 1 }); this.animate({ z: ZOOMS[1] * this._k, ox: 0, oy: 0, center: true }); },
      activeChips, hasActive: activeChips.length > 0, activeCount: activeChips.length,
      sel: sel ? { ...sel, bg: `url("${sel.src}")` } : null,
      close: () => this.setState({ sel: null }),
      stop: e => e.stopPropagation(),
    };
  }

  render() {
    const v = this.vals();
    return html`
      ${this.renderStage(v)}
      ${this.renderHeader(v)}
      ${v.isGrid && this.renderGrid(v)}
      ${v.hasActive && this.renderChips(v)}
      ${this.renderFooter(v)}
      ${v.hasPage && this.renderPage(v)}
      ${v.sel && this.renderModal(v)}
    `;
  }

  renderStage(v) {
    return html`
      <div ref=${this.stageRef} onPointerDown=${v.onDown} onWheel=${v.onWheel} style=${css('position:fixed;inset:0;overflow:hidden;cursor:grab;touch-action:none;user-select:none;background:#f4f4ec;visibility:' + (v.isGrid ? 'hidden' : 'visible'))}>
        ${v.tiles.map(t => html`
          <div key=${t._i} className="tile" onClick=${t.open} onMouseEnter=${t.enter} onMouseLeave=${t.leave} style=${{ position: 'absolute', left: 0, top: 0, width: t.w + 'px', height: t.h + 'px', transform: t.transform, opacity: t.opacity, transition: 'opacity .25s ease', willChange: 'transform', cursor: 'pointer' }}>
            <div style=${{ width: '100%', height: '100%', transform: `scale(${t.pop})`, transition: 'transform .22s cubic-bezier(.2,1.4,.4,1)', pointerEvents: 'none' }}>
              <div className="tile-img" style=${{ width: '100%', height: '100%', backgroundImage: t.bg, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'drop-shadow(5px 12px 10px rgba(40,32,20,.22))', transition: 'transform .35s cubic-bezier(.2,.7,.2,1)', pointerEvents: 'none' }}></div>
            </div>
            ${t.hovered && html`<div style=${css('position:absolute;left:-14px;top:58%;background:#1b1b1b;color:#fff;font-size:15px;padding:7px 11px;border-radius:3px;white-space:nowrap;pointer-events:none;display:flex;gap:6px;align-items:center')}><span>+</span><span>vzor ${t.vzor}</span></div>`}
          </div>`)}
        ${v.hero && this.renderHero(v)}
      </div>`;
  }

  renderHeader(v) {
    const navLink = (onClick, line, label) => html`<a href="#" onClick=${onClick} style=${css(`padding:4px 0;border-bottom:1.5px solid ${line}`)}>${label}</a>`;
    const menuLink = (onClick, label, last) => html`<a href="#" onClick=${onClick} style=${css(`font-size:28px;letter-spacing:-.03em;padding:12px 0;${last ? '' : 'border-bottom:1px solid #e0e0d6'}`)}>${label}</a>`;
    return html`
      <header style=${css(`zoom:${v.navZoom};position:fixed;top:0;left:0;right:0;height:68px;z-index:6;background:#f4f4ec;border-bottom:1px solid #e0e0d6;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:${v.phone ? 8 : 24}px;padding:0 ${v.phone ? 14 : 24}px`)}>
        <a href="#" onClick=${v.goHome} style=${css(`font-size:${v.phone ? 20 : 24}px;font-weight:600;letter-spacing:-.04em;line-height:1;white-space:nowrap;justify-self:start`)}>domovní čísla</a>
        <nav style=${css(`display:flex;justify-content:flex-end;align-items:center;gap:${v.phone ? 10 : 24}px;font-size:15px;grid-column:3;white-space:nowrap;min-width:0`)}>
          ${v.wide && navLink(v.goOmne, v.lineOmne, 'o mně')}
          ${v.wide && navLink(v.goCisla, v.lineCisla, 'o číslech')}
          ${v.wide && navLink(v.goJak, v.lineJak, 'jak objednat')}
          ${v.wide && navLink(v.goKontakt, v.lineKontakt, 'kontakt')}
          ${v.notWide && html`<button onClick=${v.toggleMenu} style=${css('height:40px;display:flex;align-items:center;gap:8px;padding:0 4px;border:0;background:none;font-size:15px;color:#1b1b1b;cursor:pointer')}><span>${v.menuLabel}</span></button>`}
          <a href="#" onClick=${v.goObjednat} style=${css(`height:40px;display:flex;align-items:center;padding:0 ${v.phone ? 12 : 16}px;border-radius:4px;background:#1b1b1b;color:#fff;white-space:nowrap`)}>${v.phone ? 'objednat' : 'objednat číslo'}</a>
        </nav>
      </header>
      ${v.menuOpen && html`
        <div style=${css(`zoom:${v.navZoom};position:fixed;top:68px;left:0;right:0;z-index:9;background:#f4f4ec;border-bottom:1px solid #e0e0d6;display:flex;flex-direction:column;padding:8px ${v.phone ? 14 : 24}px 20px`)}>
          ${menuLink(v.goOmne, 'o mně')}
          ${menuLink(v.goCisla, 'o číslech')}
          ${menuLink(v.goJak, 'jak objednat')}
          ${menuLink(v.goKontakt, 'kontakt', true)}
        </div>`}`;
  }

  renderHero(v) {
    const h = v.hero, ph = v.heroBig, col = v.phone;
    return html`
      <div style=${{ position: 'absolute', left: 0, top: 0, width: this.state.heroW + 'px', height: this.state.heroH + 'px', transform: h.transform, transformOrigin: '0 0', pointerEvents: 'none' }}>
        <div ref=${this.heroRef} style=${css(`position:absolute;left:0;top:0;width:max-content;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;opacity:${h.on ? 1 : 0};transform:translateY(${h.on ? 0 : 20}px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)`)}>
          <h1 style=${css(`margin:0;font-size:${ph ? 60 : 52}px;font-weight:600;letter-spacing:-.04em;line-height:1.02;color:#1b1b1b`)}>Vaše adresa,<br />namalovaná štětcem.</h1>
          <p style=${css(`margin:0;font-size:${ph ? 27 : 19}px;line-height:1.45;color:#55554b;max-width:${ph ? 540 : 470}px`)}>Keramická domovní čísla maluji už dlouhá léta ručně a s láskou, podle opravdových starých vzorů. Vyberte si z katalogu, nebo si nechte namalovat vlastní.</p>
          <div style=${css(`display:flex;flex-direction:${col ? 'column' : 'row'};align-items:center;gap:${col ? 16 : 12}px;margin-top:6px;font-size:${ph ? 26 : 16}px;color:#1b1b1b;justify-content:center;white-space:nowrap`)}>
            <span style=${css(`display:flex;align-items:center;gap:22px;padding-left:${v.touch ? 0 : 10}px`)}>
              ${!v.touch && html`<span className="hero-mouse"><span></span></span>`}
              <span>${v.touch ? '↔ táhněte prstem a prohlížejte' : 'táhněte myší a prohlížejte'}</span>
            </span>
            <span style=${css('color:#9a9a8f')}>nebo</span>
            <button onClick=${v.heroGrid} style=${css(`pointer-events:auto;height:${ph ? 64 : 38}px;display:flex;align-items:center;gap:${ph ? 10 : 6}px;padding:0 ${ph ? 24 : 14}px;border:1px solid #c9c9bf;border-radius:${ph ? 6 : 4}px;background:#f4f4ec;font-size:${ph ? 26 : 16}px;color:#1b1b1b;cursor:pointer`)}><span style=${css(`font-size:${ph ? 21 : 13}px`)}>▦</span>prohlédněte katalog</button>
          </div>
        </div>
      </div>`;
  }

  renderGrid(v) {
    return html`
      <div style=${css(`position:fixed;top:${v.headerH}px;bottom:${v.footerH}px;left:0;right:0;overflow-y:auto;overscroll-behavior:contain;background:#f4f4ec;z-index:4;padding:${v.phone ? '28px 16px 96px' : '48px 32px 120px'}`)}>
        <div style=${css(`zoom:${v.pageZoom};max-width:${v.gridMax}px;margin:0 auto ${v.phone ? 32 : 56}px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px 48px`)}>
          <h1 style=${css(H1 + ';text-wrap:balance')}>Katalog vzorů</h1>
          <p style=${css('margin:0;font-size:17px;line-height:1.5;color:#55554b;max-width:420px')}>${v.gridItems.length} ${v.gridItems.length === 1 ? 'vzor' : v.gridItems.length < 5 && v.gridItems.length ? 'vzory' : 'vzorů'} k inspiraci. Klikněte na cedulku pro detail — každou namaluji i v jiné barvě nebo s vaším číslem.</p>
        </div>
        <div style=${css(`display:grid;grid-template-columns:${v.gridCols};gap:${v.gridGap};max-width:${1500 * (this._k || 1)}px;margin:0 auto`)}>
          ${v.gridItems.map(g => html`
            <button key=${g.vzor} className="hov-scale" onClick=${g.open} aria-label=${"vzor " + g.vzor} style=${css(`border:0;background:none;padding:0;cursor:pointer;display:flex;flex-direction:column;gap:14px;text-align:left;font:inherit;color:#1b1b1b;opacity:${g.opacity};transition:opacity .25s ease`)}>
              <div className="hov-img" style=${css(`width:100%;aspect-ratio:1.25;background-image:${g.bg};background-size:contain;background-repeat:no-repeat;background-position:center;filter:drop-shadow(5px 12px 10px rgba(40,32,20,.2));transition:transform .35s cubic-bezier(.2,.7,.2,1)`)}></div>
            </button>`)}
        </div>
      </div>`;
  }

  renderChips(v) {
    return html`
      <div style=${css(`position:fixed;left:50%;bottom:${v.chipsBottom}px;transform:translateX(-50%);display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 48px);z-index:5`)}>
        ${v.activeChips.map(c => html`
          <button key=${c.label} onClick=${c.remove} style=${css('height:38px;display:flex;align-items:center;gap:8px;padding:0 14px;border:1px solid #d6d6cc;background:#f4f4ec;border-radius:4px;font-size:14px;color:#1b1b1b;cursor:pointer')}>
            <span>${c.label}</span>
            ${c.color && html`<span style=${css(`width:12px;height:12px;border-radius:50%;background:${c.color}`)}></span>`}
            <span style=${css('font-size:12px')}>✕</span>
          </button>`)}
      </div>`;
  }

  renderFooter(v) {
    const seg = (onClick, bg, color, icon, label) => html`<button onClick=${onClick} style=${css(`height:42px;display:flex;align-items:center;gap:8px;padding:0 14px;border:0;font-size:15px;cursor:pointer;background:${bg};color:${color}`)}><span style=${css('font-size:13px')}>${icon}</span>${v.wide && html`<span>${label}</span>`}</button>`;
    const knob = left => html`<span style=${css('width:16px;height:1.5px;background:#1b1b1b;position:relative')}><span style=${css(`position:absolute;left:${left}px;top:-2.5px;width:6px;height:6px;border-radius:50%;background:#1b1b1b`)}></span></span>`;
    const round = (onClick, label, opacity) => html`<button onClick=${onClick} style=${css(`width:44px;height:44px;border-radius:50%;border:1px solid #c9c9bf;background:#f4f4ec;font-size:21px;color:#1b1b1b;cursor:pointer;opacity:${opacity}`)}>${label}</button>`;
    return html`
      <footer style=${css(`zoom:${v.navZoom};opacity:${v.navOpacity};transform:translateY(${v.navShift}px);pointer-events:${v.navPE};transition:opacity .5s ease,transform .5s cubic-bezier(.2,.7,.2,1);position:fixed;bottom:0;left:0;right:0;height:72px;z-index:6;background:#f4f4ec;border-top:1px solid #e0e0d6;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:0 ${v.phone ? 12 : 24}px`)}>
        <div style=${css(`display:${v.showSeg ? 'flex' : 'none'};border:1px solid #d6d6cc;border-radius:4px;overflow:hidden;width:max-content`)}>
          ${seg(v.setCanvas, v.canvasBg, v.canvasColor, '✣', 'plocha')}
          ${seg(v.setGrid, v.gridBg, v.gridColor, '▦', 'katalog')}
        </div>
        <div style=${css(`position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:${v.filterMax};overflow-x:auto;scrollbar-width:thin;z-index:1`)}><div style=${css('display:flex;gap:8px;align-items:center;width:max-content;margin:0 auto')}>
          ${!v.filterOpen && html`
            <button onClick=${v.openFilter} style=${css('height:44px;display:flex;align-items:center;gap:8px;padding:0 16px;border:1px solid #d6d6cc;background:#f4f4ec;color:#1b1b1b;border-radius:4px;font-size:15px;cursor:pointer;white-space:nowrap')}>
              <span style=${css('display:flex;flex-direction:column;gap:5px;padding:0 2px')}>${knob(3)}${knob(9)}${knob(1)}</span>
              <span>filtr</span>
              ${v.hasActive && html`<span style=${css('font-size:12px;background:#1b1b1b;color:#fff;border-radius:999px;padding:2px 7px')}>${v.activeCount}</span>`}
            </button>`}
          ${v.filterOpen && html`
            <button onClick=${v.closeFilter} style=${css('width:44px;height:44px;flex:none;border-radius:50%;border:1px solid #d6d6cc;background:#f4f4ec;font-size:16px;color:#1b1b1b;cursor:pointer')}>✕</button>
            ${v.sections.map(s => html`
              <div key=${s.group} style=${css('height:44px;flex:none;display:flex;align-items:center;gap:10px;padding:0 6px 0 14px;border:1px solid #d6d6cc;background:#f4f4ec;border-radius:4px')}>
                <button onClick=${s.toggle} style=${css('border:0;background:none;padding:0 6px 0 0;font-size:15px;color:#1b1b1b;cursor:pointer;display:flex;gap:6px;align-items:center;height:100%;white-space:nowrap')}><span>${s.label}</span><span style=${css(`color:${s.signColor}`)}>${s.sign}</span></button>
                ${s.showSwatches && html`
                  <div style=${css('display:flex;gap:6px;align-items:center;padding-right:6px')}>
                    ${s.opts.map(o => html`<button key=${o.label} onClick=${o.toggle} title=${o.label} style=${css(`width:24px;height:24px;border-radius:50%;border:0;padding:0;cursor:pointer;background:${o.color};box-shadow:${o.ring}`)}></button>`)}
                  </div>`}
                ${s.showChips && html`
                  <div style=${css('display:flex;gap:4px;align-items:center')}>
                    ${s.opts.map(o => html`<button key=${o.label} onClick=${o.toggle} style=${css(`height:32px;padding:0 12px;border-radius:999px;border:0;font-size:14px;cursor:pointer;white-space:nowrap;background:${o.chipBg};color:${o.chipColor}`)}>${o.label}</button>`)}
                  </div>`}
              </div>`)}
            <button onClick=${v.clearFilters} style=${css('height:44px;flex:none;padding:0 18px;border:0;border-radius:999px;background:#e5e5dc;font-size:15px;color:#1b1b1b;cursor:pointer;display:flex;gap:8px;align-items:center')}><span>↺</span><span>reset</span></button>`}
        </div></div>
        <div style=${css('display:flex;justify-content:flex-end;align-items:center;gap:8px')}>
          ${v.showHint && html`<span style=${css('font-size:15px;color:#55554b;margin-right:10px;white-space:nowrap')}>${v.hintText}</span>`}
          ${v.showZoom && html`${round(v.zoomOut, '−', v.outOpacity)}${round(v.zoomIn, '+', v.inOpacity)}`}
        </div>
      </footer>`;
  }

  renderPage(v) {
    return html`
      <div ref=${this.pageRef} style=${css(`position:fixed;top:${v.headerH}px;bottom:0;left:0;right:0;overflow-y:auto;background:#f4f4ec;z-index:8`)}>
        <div style=${css(`zoom:${v.pageZoom};max-width:1120px;margin:0 auto;padding:${v.phone ? '28px 16px 72px' : '56px 28px 96px'};display:flex;flex-direction:column;gap:${v.phone ? 32 : 48}px`)}>
          <div style=${css('display:flex;justify-content:space-between;align-items:center;gap:16px')}>
            <span style=${css('font-size:15px;color:#55554b')}>${v.pageKicker}</span>
            <button onClick=${v.goHome} style=${css('height:40px;display:flex;align-items:center;gap:8px;padding:0 14px;border:1px solid #d6d6cc;border-radius:4px;background:#f4f4ec;font-size:15px;color:#1b1b1b;cursor:pointer')}><span>←</span><span>zpět na čísla</span></button>
          </div>
          ${v.isOmne && this.renderOmne(v)}
          ${v.isCisla && this.renderCisla(v)}
          ${v.isJak && this.renderJak(v)}
          ${v.isKontakt && this.renderKontakt(v)}
          ${v.isObjednat && (v.sent ? this.renderSent(v) : this.renderOrder(v))}
        </div>
      </div>`;
  }

  renderOmne(v) {
    const p = t => html`<p style=${css('margin:0;font-size:18px;line-height:1.6;color:#3a3a33;max-width:46ch;text-wrap:pretty')}>${t}</p>`;
    return html`
      <div style=${css('display:flex;flex-direction:column;gap:48px')}>
        <img src="assets/portret.png" alt="Portrét u dveří s malovanou cedulkou" style=${css('width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:4px;display:block;background:#ebeae0')} />
        <div style=${css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:24px 56px;align-items:start')}>
          <h1 style=${css(H1 + ';text-wrap:balance')}>Maluji čísla, která k domu patří.</h1>
          <div style=${css('display:flex;flex-direction:column;gap:24px;padding-top:8px')}>
            ${p('Každá cedulka vzniká ručně z keramické hlíny — tvaruji ji, maluji štětcem glazurami a vypaluji v peci. Inspiruji se tradičním malovaným písmem a ornamenty z fasád českých měst a vesnic.')}
            ${p('Barvu, tvar i ornament ladím s domem — s fasádou, okny nebo dveřmi. Výsledkem je kus, který vydrží počasí i roky.')}
          </div>
        </div>
        <a href="https://www.fler.cz/magazin/db-keramika-strasne-nerada-delam-hrnky-2480" target="_blank" rel="noopener" style=${css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:16px 56px;align-items:start;padding-top:32px;border-top:1px solid #e0e0d6;color:#1b1b1b;text-decoration:none')}>
          <span style=${css('font-size:15px;color:#77776c;padding-top:10px')}>napsali o mně</span>
          <span style=${css('display:flex;flex-direction:column;gap:14px')}>
            <span style=${css("font-family:'Instrument Serif',serif;font-style:italic;font-size:32px;line-height:1.2;letter-spacing:-.01em;text-wrap:balance;max-width:24ch")}>„Barevná či černobílá cedulka rozzáří každý vchod.“</span>
            <span style=${css('font-size:15px;color:#55554b')}>Fler MAG, červenec 2018 · <span style=${css('text-decoration:underline;text-underline-offset:3px')}>dB keramika: Strašně nerada dělám hrnky ↗</span></span>
          </span>
        </a>
        <div style=${css('display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,3vw,24px);padding-top:32px;border-top:1px solid #e0e0d6')}>
          ${v.omneWorks.map(w => html`<button key=${w.key} onClick=${w.open} style=${css(`border:0;padding:0;background:none;cursor:pointer;aspect-ratio:1.3;background-image:${w.bg};background-size:contain;background-repeat:no-repeat;background-position:center;filter:drop-shadow(4px 10px 8px rgba(40,32,20,.2))`)}></button>`)}
        </div>
      </div>`;
  }

  renderCisla(v) {
    const p = t => html`<p style=${css('margin:0;font-size:18px;line-height:1.6;color:#3a3a33;max-width:46ch;text-wrap:pretty')}>${t}</p>`;
    return html`
      <div style=${css('display:flex;flex-direction:column;gap:48px')}>
        <div style=${css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:24px 56px;align-items:start')}>
          <h1 style=${css(H1 + ';text-wrap:balance')}>Keramika, která vydrží na fasádě.</h1>
          <div style=${css('display:flex;flex-direction:column;gap:24px;padding-top:8px')}>
            ${p('Maluji tradiční technikou pod glazuru, kde je vidět každý tah štětcem. Každá cedulka je originál — žádná přesná replika předlohy, ale kus namalovaný tak, jak ho v tu chvíli vnímám.')}
            ${p('Odstín malby i podkladu se může mírně lišit — to k ručně pálené keramice patří.')}
          </div>
        </div>
        <div style=${css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));border-top:1px solid #1b1b1b')}>
          ${FAKTA.map(([l, val, t]) => html`
            <div key=${l} style=${css('display:flex;flex-direction:column;gap:8px;padding:24px 24px 28px 0;border-bottom:1px solid #e0e0d6')}>
              <span style=${css('font-size:15px;color:#77776c')}>${l}</span>
              <span style=${css('font-size:24px;letter-spacing:-.03em')}>${val}</span>
              <span style=${css('font-size:15px;line-height:1.5;color:#3a3a33;text-wrap:pretty')}>${t}</span>
            </div>`)}
        </div>
        <div style=${css('display:flex;gap:12px;flex-wrap:wrap;align-items:center')}>
          <a href="#" onClick=${v.goObjednat} style=${css(BTN_DARK)}>objednat číslo</a>
          <a href="#" onClick=${v.goJak} style=${css('height:48px;display:flex;align-items:center;padding:0 22px;border-radius:4px;border:1px solid #d6d6cc;font-size:16px')}>jak objednat</a>
        </div>
      </div>`;
  }

  renderJak(v) {
    const pics = [
      html`<div style=${css('position:relative;aspect-ratio:4/3;border-radius:4px;background:#ebeae0;overflow:hidden')}>
        <img src="assets/cisla/n37.webp" alt="" style=${css('position:absolute;left:4%;top:30%;width:42%;transform:rotate(-12deg);filter:drop-shadow(0 6px 10px rgba(40,35,20,.18))')} />
        <img src="assets/cisla/n31.webp" alt="" style=${css('position:absolute;right:3%;top:34%;width:40%;transform:rotate(9deg);filter:drop-shadow(0 6px 10px rgba(40,35,20,.18))')} />
        <img src="assets/cisla/n44.webp" alt="" style=${css('position:absolute;left:22%;top:10%;width:56%;transform:rotate(-2deg);filter:drop-shadow(0 8px 14px rgba(40,35,20,.22))')} />
      </div>`,
      html`<div style=${css('position:relative;aspect-ratio:4/3;border-radius:4px;background-color:#f7f5ec;background-image:linear-gradient(#e4e2d6 1px,transparent 1px),linear-gradient(90deg,#e4e2d6 1px,transparent 1px);background-size:18px 18px;overflow:hidden')}>
        <img src="assets/cisla/n24.webp" alt="" style=${css('position:absolute;left:50%;top:50%;width:68%;transform:translate(-50%,-50%) rotate(-3deg);filter:grayscale(1) contrast(1.5) brightness(1.15);opacity:.7;mix-blend-mode:multiply')} />
      </div>`,
      html`<div style=${css('position:relative;aspect-ratio:4/3;border-radius:4px;background:#ebeae0;overflow:hidden')}>
        <img src="assets/cisla/n13.webp" alt="" style=${css('position:absolute;left:50%;top:50%;width:72%;transform:translate(-50%,-50%);filter:drop-shadow(0 8px 14px rgba(40,35,20,.2))')} />
        <img src="assets/cisla/n13.webp" alt="" style=${css('position:absolute;left:50%;top:50%;width:72%;transform:translate(-50%,-50%);filter:grayscale(1) sepia(.5) contrast(.28) brightness(1.32);clip-path:inset(0 0 0 50%)')} />
        <span style=${css('position:absolute;left:calc(50% - 2px);top:12%;bottom:12%;width:4px;background:#5e6d3d;border-radius:4px;opacity:.85')}></span>
        <span style=${css('position:absolute;left:calc(50% - 9px);top:8%;width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#5e6d3d')}></span>
      </div>`,
      html`<div style=${css('position:relative;aspect-ratio:4/3;border-radius:4px;background-color:#d8cfbd;background-image:radial-gradient(rgba(255,255,255,.18) 1px,transparent 1.5px),radial-gradient(rgba(60,45,25,.08) 1px,transparent 1.5px);background-size:7px 7px,11px 11px;background-position:0 0,3px 5px;overflow:hidden')}>
        <img src="assets/cisla/n12.webp" alt="" style=${css('position:absolute;left:50%;top:50%;width:64%;transform:translate(-50%,-50%);filter:drop-shadow(4px 10px 8px rgba(50,35,15,.35))')} />
      </div>`,
    ];
    return html`
      <div style=${css('display:flex;flex-direction:column;gap:48px')}>
        <h1 style=${css(H1 + ';max-width:14ch;text-wrap:balance')}>Od nápadu po cedulku na fasádě.</h1>
        <div style=${css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr));border-top:1px solid #1b1b1b')}>
          ${v.steps.map((s, i) => html`
            <div key=${s.n} style=${css('display:flex;flex-direction:column;gap:14px;padding:24px 24px 32px 0;border-bottom:1px solid #e0e0d6')}>
              ${pics[i]}
              <h3 style=${css('margin:0;font-size:24px;font-weight:500;letter-spacing:-.03em')}>${s.title}</h3>
              <p style=${css('margin:0;font-size:16px;line-height:1.55;color:#3a3a33;text-wrap:pretty')}>${s.text}</p>
            </div>`)}
        </div>
        <div style=${css('display:flex;gap:12px;flex-wrap:wrap;align-items:center')}>
          <a href="#" onClick=${v.goObjednat} style=${css(BTN_DARK)}>začít objednávku</a>
          <a href="#" onClick=${v.goGrid} style=${css('height:48px;display:flex;align-items:center;padding:0 22px;border-radius:4px;border:1px solid #d6d6cc;font-size:16px')}>nejdřív vybrat vzor</a>
        </div>
      </div>`;
  }

  renderKontakt(v) {
    const cell = (label, value) => html`<div style=${css('display:flex;flex-direction:column;gap:8px;padding:24px 24px 28px 0;border-bottom:1px solid #e0e0d6')}><span style=${css('font-size:15px;color:#77776c')}>${label}</span>${value}</div>`;
    const big = 'font-size:24px;letter-spacing:-.03em';
    return html`
      <div style=${css('display:flex;flex-direction:column;gap:48px')}>
        <h1 style=${css(H1 + ';max-width:14ch;text-wrap:balance')}>Napište mi, ráda poradím.</h1>
        <div style=${css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));border-top:1px solid #1b1b1b')}>
          ${cell('e-mail', html`<a href="mailto:ahoj@domovnicisla.cz" style=${css(big)}>ahoj@domovnicisla.cz</a>`)}
          ${cell('instagram', html`<a href="#" style=${css(big)}>@domovni.cisla</a>`)}
          ${cell('odpovídám', html`<span style=${css(big)}>do 3 pracovních dnů</span>`)}
        </div>
        <p style=${css('margin:0;font-size:18px;line-height:1.6;color:#3a3a33;max-width:52ch;text-wrap:pretty')}>Máte jasnou představu? Rovnou vyplňte objednávku — nic se neplatí, dokud neodsouhlasíte návrh.</p>
        <div><a href="#" onClick=${v.goObjednat} style=${css(BTN_DARK.replace('display:flex', 'display:inline-flex'))}>objednat číslo</a></div>
      </div>`;
  }

  renderSent(v) {
    return html`
      <div style=${css('display:flex;flex-direction:column;gap:24px;align-items:flex-start;padding:40px 0')}>
        <h1 style=${css(H1)}>Děkuji, poptávka dorazila.</h1>
        <p style=${css('margin:0;font-size:18px;line-height:1.6;color:#3a3a33;max-width:46ch;text-wrap:pretty')}>Do 3 pracovních dnů vám na ${v.form.email} pošlu návrh čísla ${v.form.cislo} a cenu.</p>
        <div style=${css('display:flex;gap:12px;flex-wrap:wrap')}>
          <button onClick=${v.goHome} style=${css('height:48px;padding:0 22px;border-radius:4px;border:0;background:#1b1b1b;color:#fff;font-size:16px;cursor:pointer')}>zpět na čísla</button>
          <button onClick=${v.newOrder} style=${css('height:48px;padding:0 22px;border-radius:4px;border:1px solid #d6d6cc;background:#f4f4ec;color:#1b1b1b;font-size:16px;cursor:pointer')}>další číslo</button>
        </div>
      </div>`;
  }

  renderOrder(v) {
    const { form, plate } = v;
    const label = t => html`<span style=${css('font-size:14px;color:#55554b')}>${t}</span>`;
    const input = (value, onChange, border, extra = {}) => html`<input value=${value} onChange=${onChange} ...${extra} style=${css(`width:100%;height:48px;padding:0 14px;border:1px solid ${border};border-radius:4px;background:#fbfbf6;font:inherit;font-size:16px;color:#1b1b1b;outline:none`)} />`;
    const chips = list => html`<div style=${css('display:flex;gap:6px;flex-wrap:wrap')}>${list.map(o => html`<button key=${o.label} onClick=${o.pick} style=${css(`height:36px;padding:0 14px;border-radius:999px;border:0;font-size:14px;cursor:pointer;background:${o.bg};color:${o.fg}`)}>${o.label}</button>`)}</div>`;
    const field = 'display:flex;flex-direction:column;gap:8px;font-size:14px;color:#55554b';
    const glyphRow = (gl, color) => gl.map((g, i) => g.isImg
      ? html`<span key=${i} style=${{ flex: 'none', width: g.w, height: g.h, background: color, WebkitMask: g.mask, mask: g.mask }}></span>`
      : html`<span key=${i} style=${{ flex: 'none', fontFamily: g.ff, fontWeight: g.fw, fontStyle: g.fst, fontSize: g.fs, lineHeight: g.lh, color }}>${g.ch}</span>`);
    const pf = `font-family:${plate.pff};font-weight:${plate.pfw};font-style:${plate.pfs}`;
    return html`
      <div style=${css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:${v.phone ? 32 : 56}px;align-items:start`)}>
        <div style=${css('display:flex;flex-direction:column;gap:28px')}>
          <h1 style=${css('margin:0;font-weight:500;font-size:clamp(40px,6vw,64px);letter-spacing:-.05em;line-height:.98')}>Vaše číslo</h1>
          <div style=${css('display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:6px;background:#e5e5dc')}>
            <button onClick=${v.setModeVzor} style=${css(`height:56px;border:0;border-radius:4px;cursor:pointer;font:inherit;font-size:16px;background:${v.modeVzorBg};color:#1b1b1b;box-shadow:${v.modeVzorSh};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px`)}><span style=${css('font-weight:500')}>podle vzoru</span><span style=${css('font-size:13px;color:#77776c')}>vyberu z galerie</span></button>
            <button onClick=${v.setModeVlastni} style=${css(`height:56px;border:0;border-radius:4px;cursor:pointer;font:inherit;font-size:16px;background:${v.modeVlastniBg};color:#1b1b1b;box-shadow:${v.modeVlastniSh};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px`)}><span style=${css('font-weight:500')}>vlastní návrh</span><span style=${css('font-size:13px;color:#77776c')}>sestavím si sám</span></button>
          </div>

          ${v.isVzor && (v.hasRef ? html`
            <div style=${css('display:flex;align-items:center;gap:14px;padding:10px 10px 10px 14px;border:1px solid #d6d6cc;border-radius:4px')}>
              <div style=${css(`width:56px;height:46px;flex:none;background-image:${v.refBg};background-size:contain;background-repeat:no-repeat;background-position:center`)}></div>
              <span style=${css('font-size:15px;flex:1')}>vzor ${form.vzor}</span>
              <button onClick=${v.clearRef} style=${css('height:32px;padding:0 10px;border:0;background:none;font:inherit;font-size:14px;color:#55554b;cursor:pointer;text-decoration:underline')}>změnit</button>
            </div>` : html`
            <div style=${css('display:flex;flex-direction:column;gap:10px')}>
              <div style=${css('display:flex;justify-content:space-between;align-items:baseline;gap:12px')}>${label('vyberte vzor')}<a href="#" onClick=${v.goGrid} style=${css('font-size:14px;text-decoration:underline')}>celá galerie →</a></div>
              <div style=${css('display:grid;grid-template-columns:repeat(auto-fill,minmax(min(84px,100%),1fr));gap:8px;max-height:236px;overflow-y:auto;padding:2px')}>
                ${v.refPicks.map(r => html`<button key=${r.vzor} className="hov-border" onClick=${r.pick} title=${'vzor ' + r.vzor} style=${css('aspect-ratio:1.25;border:1px solid #e0e0d6;border-radius:4px;padding:6px;cursor:pointer;background:#fbfbf6')}><div style=${css(`width:100%;height:100%;background-image:${r.bg};background-size:contain;background-repeat:no-repeat;background-position:center`)}></div></button>`)}
              </div>
            </div>`)}

          <div style=${css('display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:12px')}>
            <label style=${css(field)}><span>číslo *</span>${input(form.cislo, v.onCislo, v.errCislo, { placeholder: '32', inputMode: 'text' })}</label>
            <label style=${css(field)}><span>ulice (nepovinné)</span>${input(form.ulice, v.onUlice, '#d6d6cc', { placeholder: 'Lipová' })}</label>
          </div>

          ${v.isVlastni && html`
            <div style=${css('display:flex;flex-direction:column;gap:10px')}>${label('zkratka před číslem')}${chips(v.fPrefix)}</div>
            <div style=${css('display:flex;flex-direction:column;gap:10px')}>${label('rozvržení nápisu')}${chips(v.fRozvrzeni)}${chips(v.fOblouk)}</div>
            ${v.showHorni && html`<label style=${css(field)}><span>horní nápis</span>${input(form.horni, v.onHorni, '#d6d6cc', { placeholder: 'Novákovi' })}</label>`}
            <div style=${css('display:flex;flex-direction:column;gap:10px')}>
              <div style=${css('display:flex;justify-content:space-between;align-items:baseline;gap:12px')}>${label('velikost a rozestup')}${v.slidersDirty && html`<button onClick=${v.resetSliders} style=${css('border:0;background:none;padding:0;font:inherit;font-size:14px;color:#55554b;cursor:pointer;text-decoration:underline')}>výchozí</button>`}</div>
              ${v.sliders.map(o => html`<label key=${o.key} style=${css('display:grid;grid-template-columns:72px minmax(0,1fr) 52px;gap:12px;align-items:center;font-size:14px;color:#1b1b1b')}><span>${o.label}</span><input type="range" min=${o.lo} max=${o.hi} step=${o.step} value=${o.val} onInput=${o.on} onChange=${o.on} style=${css('width:100%;accent-color:#1b1b1b')} /><span style=${css('text-align:right;color:#77776c;font-variant-numeric:tabular-nums;white-space:nowrap')}>${o.txt}</span></label>`)}
            </div>
            <div style=${css('display:flex;flex-direction:column;gap:10px')}>
              <div style=${css('display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap')}>${label('písmo čísla · vzor ' + v.cStyle.id)}${v.cStyle.note && html`<span style=${css('font-size:13px;color:#b5552f')}>${v.cStyle.note}</span>`}</div>
              <div style=${css('display:grid;grid-template-columns:repeat(auto-fill,minmax(min(112px,100%),1fr));gap:6px;max-height:256px;overflow-y:auto;padding:2px')}>
                ${v.fCisla.map(o => html`<button key=${o.id} onClick=${o.pick} style=${css(`height:78px;border:1px solid ${o.border};border-radius:4px;background:${o.bg};cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:6px 10px 10px;color:#1b1b1b;overflow:hidden;min-width:0`)}><span style=${css('font-size:11px;color:#77776c')}>${o.id}</span><span style=${css('display:flex;align-items:flex-end;gap:1px;height:32px;max-width:100%;overflow:hidden')}>${glyphRow(o.glyphs, '#1b1b1b')}</span></button>`)}
              </div>
            </div>
            <div style=${css('display:flex;flex-direction:column;gap:10px')}>
              <div style=${css('display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap')}>${label('písmo nápisu · vzor ' + v.pStyle.id)}<span style=${css('font-size:13px;color:#77776c')}>ulice, jméno domu</span></div>
              <div style=${css('display:grid;grid-template-columns:repeat(auto-fill,minmax(min(150px,100%),1fr));gap:6px;max-height:232px;overflow-y:auto;padding:2px')}>
                ${v.fPisma.map(o => html`<button key=${o.id} onClick=${o.pick} style=${css(`height:64px;border:1px solid ${o.border};border-radius:4px;background:${o.bg};cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:6px 10px 8px;color:#1b1b1b;overflow:hidden;min-width:0`)}><span style=${css('font-size:11px;color:#77776c')}>${o.id}</span>${o.hasImg
                  ? html`<span style=${{ width: '100%', height: '30px', background: '#1b1b1b', WebkitMask: o.mask, mask: o.mask }}></span>`
                  : html`<span style=${{ fontFamily: o.ff, fontWeight: o.fw, fontStyle: o.fs, fontVariant: o.fv, letterSpacing: o.ls, fontSize: '22px', lineHeight: '30px', whiteSpace: 'nowrap' }}>${form.ulice.trim() || 'Lipová'}</span>`}</button>`)}
              </div>
            </div>
            <div style=${css('display:flex;flex-direction:column;gap:12px')}>${label('barvy glazury')}
              <div style=${css('display:flex;gap:4px;padding:3px;border-radius:999px;background:#e5e5dc;align-self:flex-start;flex-wrap:wrap')}>
                ${v.cTargets.map(t => html`<button key=${t.key} onClick=${t.pick} style=${css(`height:34px;padding:0 14px 0 10px;border:0;border-radius:999px;font-size:14px;cursor:pointer;background:${t.bg};box-shadow:${t.sh};color:#1b1b1b;display:flex;align-items:center;gap:8px`)}><span style=${css(`width:14px;height:14px;border-radius:50%;background:${t.color}`)}></span><span>${t.label}</span></button>`)}
              </div>
              <div style=${css('display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;max-width:400px')}>
                ${v.fPaint.map(o => html`<button key=${o.label} onClick=${o.pick} title=${o.label} style=${css(`aspect-ratio:1;border:0;padding:0;border-radius:4px;cursor:pointer;background:${o.color};box-shadow:${o.ring}`)}></button>`)}
              </div>
              <span style=${css('font-size:14px;color:#1b1b1b')}>${v.cTargetLabel}: ${v.cTargetName}</span>
            </div>
            <div style=${css('display:flex;flex-direction:column;gap:10px')}>${label('tvar')}${chips(v.fTvary)}</div>
            <div style=${css('display:flex;flex-direction:column;gap:10px')}>${label('provedení')}${chips(v.fProvedeni)}</div>`}

          <label style=${css(field)}><span>vaše představa a poznámky</span><span style=${css('font-size:15px;color:#3a3a33;line-height:1.5;text-wrap:pretty')}>${v.noteHelp}</span><textarea value=${form.pozn} onChange=${v.onPozn} rows="5" placeholder=${v.notePh} style=${css('width:100%;padding:12px 14px;border:1px solid #d6d6cc;border-radius:4px;background:#fbfbf6;font:inherit;font-size:16px;line-height:1.5;color:#1b1b1b;outline:none;resize:vertical')}></textarea></label>
          <div style=${css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:12px;padding-top:12px;border-top:1px solid #e0e0d6')}>
            <label style=${css(field)}><span>jméno</span>${input(form.jmeno, v.onJmeno, '#d6d6cc', { autoComplete: 'name' })}</label>
            <label style=${css(field)}><span>e-mail *</span>${input(form.email, v.onEmail, v.errEmail, { type: 'email', autoComplete: 'email' })}</label>
          </div>
          ${v.hasErr && html`<span style=${css('font-size:14px;color:#b5552f')}>Vyplňte prosím číslo a platný e-mail.</span>`}
          <div style=${css('display:flex;gap:16px;align-items:center;flex-wrap:wrap')}>
            <button onClick=${v.submit} style=${css('height:50px;padding:0 24px;border-radius:4px;border:0;background:#1b1b1b;color:#fff;font-size:16px;cursor:pointer')}>odeslat poptávku</button>
            <span style=${css('font-size:14px;color:#77776c')}>nezávazné — platíte až po schválení návrhu</span>
          </div>
        </div>

        <div style=${css(`position:sticky;top:24px;display:flex;flex-direction:column;gap:16px;align-items:center;padding:${v.phone ? '28px 16px' : '48px 24px'};border-radius:4px;background:#ebebe2`)}>
          ${v.isVlastni && html`
            <div style=${{ width: 'min(320px,100%)', aspectRatio: plate.aspect, borderRadius: plate.radius, clipPath: plate.clip, background: plate.bg, backgroundSize: '100% 100%', overflow: 'hidden', position: 'relative', containerType: 'inline-size', transition: 'aspect-ratio .35s cubic-bezier(.2,.7,.2,1)' }}>
              ${plate.arc.map((c, i) => html`<span key=${i} style=${css(`position:absolute;left:${c.l};top:${c.tp};transform:translate(-50%,-50%) rotate(${c.r});${pf};text-transform:${plate.ptt};font-variant:${plate.pfv};${plate.sink};font-size:${c.fs};line-height:1;white-space:pre;filter:${plate.tshadow}`)}>${c.ch}</span>`)}
              ${plate.lines.map(l => html`<span key=${l.key} style=${css(`position:absolute;left:50%;top:${l.top};transform:translate(-50%,-50%);${pf};letter-spacing:${plate.pls};text-transform:${plate.ptt};font-variant:${plate.pfv};${plate.sink};line-height:1.1;white-space:nowrap;font-size:${l.fs};filter:${plate.tshadow}`)}>${l.text}</span>`)}
              ${plate.preAbove && html`<span style=${css(`position:absolute;left:50%;top:${plate.preATop};transform:translate(-50%,-50%);${pf};${plate.ink};line-height:1;white-space:nowrap;font-size:${plate.preAS};filter:${plate.tshadow}`)}>${plate.preTxt}</span>`}
              <span style=${css(`position:absolute;left:50%;top:${plate.nTop};transform:translate(-50%,-50%);display:flex;align-items:flex-end;gap:${plate.gap};white-space:nowrap;filter:${plate.tshadow}`)}>
                ${plate.preCp && html`<span style=${css(`flex:none;margin-right:${plate.preM};margin-bottom:${plate.preMb};${pf};${plate.ink};line-height:1;font-size:${plate.preS}`)}>č.p.</span>`}
                ${plate.preCis && html`<span style=${css(`flex:none;position:relative;margin-right:${plate.preM};${pf};${plate.ink};line-height:${plate.preLh};font-size:${plate.preL}`)}>Č<span style=${css(`position:absolute;left:40%;top:38%;font-size:.34em;line-height:1;${plate.ink}`)}>ís.</span></span>`}
                ${plate.preNo && html`<span style=${css(`flex:none;display:flex;align-items:flex-start;margin-right:${plate.preM};${pf};${plate.ink};line-height:${plate.preLh};font-size:${plate.preL}`)}>N<span style=${css(`font-size:.4em;line-height:1;margin:.12em 0 0 .06em;padding-bottom:.06em;border-bottom:.12em solid ${plate.fg};${plate.ink}`)}>o</span></span>`}
                ${glyphRow(plate.glyphs, plate.fg)}
              </span>
            </div>
            <span style=${css('font-size:14px;color:#55554b;text-align:center;text-wrap:balance')}>náhled · číslo ${v.cStyle.id} · nápis ${v.pStyle.id} · nápis v náhledu orientačně, namaluji ho ve stylu vzoru · ${form.tvar} · ${form.provedeni}</span>`}
          ${v.isVzor && (v.hasRef ? html`
            <div style=${css(`width:min(340px,100%);aspect-ratio:1.3;background-image:${v.refBg};background-size:contain;background-repeat:no-repeat;background-position:center;filter:drop-shadow(6px 14px 12px rgba(40,32,20,.22))`)}></div>
            <span style=${css('font-size:14px;color:#55554b;text-align:center')}>vzor ${form.vzor} · namaluji s vaším číslem ${plate.text}</span>` : html`
            <div style=${css('width:min(300px,100%);aspect-ratio:1.4;border:1.5px dashed #c9c9bd;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;color:#77776c;text-align:center;padding:24px')}>zde se ukáže vybraný vzor</div>`)}
        </div>
      </div>`;
  }

  renderModal(v) {
    const s = v.sel;
    return html`
      <div onClick=${v.close} style=${css(`position:fixed;inset:0;background:rgba(244,244,236,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;overflow-y:auto;overscroll-behavior:contain;padding:${v.phone ? 20 : 32}px;z-index:10`)}>
        <div onClick=${v.stop} style=${css(`margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:${v.phone ? 20 : 48}px;align-items:center;max-width:960px;width:100%`)}>
          <div style=${css(`aspect-ratio:1.2;background-image:${s.bg};background-size:contain;background-repeat:no-repeat;background-position:center;filter:drop-shadow(8px 18px 16px rgba(40,32,20,.25))`)}></div>
          <div style=${css('display:flex;flex-direction:column;gap:16px')}>
            <span style=${css('font-size:15px;color:#5c5c52')}>vzor ${s.vzor} · ${s.tvar} · ${s.provedeni}</span>
            <h2 style=${css('margin:0;font-weight:500;font-size:clamp(40px,11vw,56px);letter-spacing:-.045em;line-height:1')}>Číslo ${s.label}</h2>
            <p style=${css('margin:0;font-size:16px;line-height:1.55;color:#3a3a33;max-width:38ch;text-wrap:pretty')}>Každá cedulka je malovaná ručně štětcem. Číslo, ulici, barvu i ornament přizpůsobím vašemu domu.</p>
            <div style=${css('display:flex;gap:8px;margin-top:8px;flex-wrap:wrap')}>
              <a href="#" onClick=${v.orderLike} style=${css('height:46px;display:flex;align-items:center;padding:0 20px;border-radius:4px;background:#1b1b1b;color:#fff;font-size:16px')}>chci podobné</a>
              <button onClick=${v.close} style=${css('height:46px;padding:0 20px;border-radius:4px;border:1px solid #d6d6cc;background:#f4f4ec;font-size:16px;color:#1b1b1b;cursor:pointer')}>zpět</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

const H1 = 'margin:0;font-weight:500;font-size:clamp(40px,6vw,72px);letter-spacing:-.05em;line-height:.98';
const BTN_DARK = 'height:48px;display:flex;align-items:center;padding:0 22px;border-radius:4px;background:#1b1b1b;color:#fff;font-size:16px';

createRoot(document.getElementById('root')).render(html`<${App} />`);
