(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches, toca = matchMedia('(hover: none)').matches, chica = matchMedia('(max-width:700px),(max-width:900px) and (orientation:portrait)');
const blando = t => t * t * (3 - 2 * t), entre = (a, b, t) => a + (b - a) * t;

/* ---------- Horarios, hora de Buenos Aires ---------- */
const H = { 0: null, 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [8, 19] }, DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function estado() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  const d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), h = +p.hour + p.minute / 60, t = H[d], ab = t && h >= t[0] && h < t[1]; let s;
  if (ab) s = `Abierto hasta las ${t[1]}`;
  else if (t && h < t[0]) s = `Abre hoy a las ${t[0]}`;
  else { let i = 1; while (!H[(d + i) % 7]) i++; s = i === 1 ? `Abre mañana a las ${H[(d + 1) % 7][0]}` : `Abre el ${DIA[(d + i) % 7]} a las ${H[(d + i) % 7][0]}`; }
  $$('[data-estado]').forEach(e => e.textContent = s); document.body.classList.toggle('abierto', !!ab); $$('tr[data-d]').forEach(r => { const [x, y = x] = r.dataset.d.split('-').map(Number); r.classList.toggle('hoy', d >= x && d <= y); });
}
estado(); setInterval(estado, 60000);

/* ---------- Portada: header verde que se pliega y grano que se rompe ---------- */
const N = 23, sec = $('.inicio'), vaso = $('.vaso'), c = $('#rotura'), x = c.getContext('2d'), f = [], fin = $('#fin'), mg = $('#migas'), mx = mg.getContext('2d');
const tope = $('.tope'), hueco = $('.hueco'), marca = $('.marca'), telon = $('.telon'), movil = $('.estado-movil'), banda = $$('.banda'), granos = $$('.inicio .grano'), vuela = $$('.vuela'), contacto = $('.contacto'), dk = $('.dock');
let migas = [], sprites = [], ox = 0, oy = 0, piso = 0, mov = [0, 0], suave = [0, 0], vivo = true, vivo3 = false, enC = false, tRot = -1, M = {}, ultimo = -1;
const carga = u => new Promise(r => { const g = new Image(); g.onload = () => r(g); g.onerror = () => r(null); g.src = u; });
const az = (() => { let s = 7; return () => (s = s * 16807 % 2147483647) / 2147483647; })();
function hacerSprites(g) {
  for (let i = 0; i < 9; i++) { const k = document.createElement('canvas'); k.width = k.height = 64; const y = k.getContext('2d'); y.beginPath(); const n = 9; for (let j = 0; j < n; j++) { const a = j / n * 6.283, r = 17 + az() * 14; y.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r * .85); } y.closePath(); y.clip(); y.drawImage(g, 40 + az() * 60, 60 + az() * 120, 70, 70, 0, 0, 64, 64); const q = y.createLinearGradient(8, 6, 54, 60); q.addColorStop(0, '#0000'); q.addColorStop(1, '#180a04d0'); y.fillStyle = q; y.fillRect(0, 0, 64, 64); sprites.push(k); }
}
function medir() {
  const d = Math.min(devicePixelRatio || 1, 1.5), w = sec.clientWidth, h = sec.clientHeight, ch = chica.matches; mg.width = w * d; mg.height = h * d; mx.setTransform(d, 0, 0, d, 0, 0);
  const vw = vaso.offsetWidth, vh = vaso.offsetHeight; ox = w / 2; oy = vaso.offsetTop + vh * .47; piso = $('h1').offsetTop + $('h1').offsetHeight; const R = vw * .5;
  migas = []; for (let i = 0; i < 80; i++) { const an = i * 2.39996 + az() * .5, r = R * (.42 + az() * .62), z = az(); migas.push({ an, r, z, t: (z > .9 ? 24 : 4 + z * z * 15) * (R / 320), s: i % 9, g: az() * 6.28, v: .4 + az() }); }
  const b = hueco.getBoundingClientRect(), Hb = telon.offsetHeight, by = tope.offsetTop, bh = tope.offsetHeight, W = ch ? Math.min(w * .62, (Hb - by - bh) * 2.5) : Math.min(w * .4, Hb * .66 * 246 / 85), cy = ch ? by + bh + (Hb - by - bh) * .42 : Hb * .5;
  marca.style.setProperty('--w', W + 'px');
  M = { w, h, Hb, by, bh, x0: (w - W) / 2, y0: cy - W * 85 / 492, x1: b.left, y1: b.top + (b.height - b.width * 85 / 246) / 2, s1: b.width / W, bx: tope.offsetLeft, rec: Hb - by - bh };
  alMover(); if (quieto) pintaMigas(1, 0);
}
function pintaMigas(k, t) {
  mx.clearRect(0, 0, M.w, M.h); if (k <= 0 || !sprites.length) return;
  for (const m of migas) { const e = 1 - Math.pow(1 - Math.min(1, k * (.8 + m.v * .3)), 3), r = m.r * e, px = ox + Math.cos(m.an) * r + suave[0] * (6 + m.z * 22), py = oy + Math.sin(m.an) * r * 1.08 + suave[1] * (6 + m.z * 22) + Math.sin(t * .5 * m.v + m.g) * 3; if (py - m.t < piso) continue; mx.save(); mx.translate(px, py); mx.rotate(m.g + e * 2 * m.v); mx.globalAlpha = Math.min(1, k * 3); mx.drawImage(sprites[m.s], -m.t / 2, -m.t / 2, m.t, m.t); mx.restore(); }
}
const cuadro = i => { if (i === ultimo || !f[i]) return; ultimo = i; x.clearRect(0, 0, 720, 792); x.drawImage(f[i], 0, 0, 720, 792); };
const romper = () => { if (!f.length) return; vaso.classList.remove('lista'); ultimo = -1; cuadro(0); tRot = performance.now() + 550; };
function alMover() {
  const y = Math.max(0, scrollY), k = Math.min(1, y / M.rec), e = blando(k), l = M.bx * e, t = M.by * k;
  telon.style.clipPath = `inset(${t}px ${l}px ${Math.min(y, M.rec)}px ${l}px round ${M.bh / 2 * e}px ${M.bh / 2 * e}px ${entre(36, M.bh / 2, e)}px ${entre(36, M.bh / 2, e)}px)`;
  marca.style.transform = `translate(${entre(M.x0, M.x1, e)}px,${entre(M.y0, M.y1, e)}px) scale(${entre(1, M.s1, e)})`;
  tope.classList.toggle('fija', k >= 1); const o = Math.max(0, 1 - k * 1.5); banda.forEach(g => g.style.opacity = o); movil.style.opacity = Math.max(0, 1 - k * 3); dock();
}
function dock() { dk.classList.toggle('si', !enC && scrollY > M.h * .6); }
function bucle(now) {
  suave[0] += (mov[0] - suave[0]) * .05; suave[1] += (mov[1] - suave[1]) * .05;
  if (vivo) {
    const q = tRot < 0 ? 0 : (now - tRot) / 1000;
    if (tRot > 0 && q < 0) vaso.style.transform = `translateX(${Math.sin(now / 22) * 2.2 * Math.max(0, 1 + q * 2)}px)`;
    else if (tRot > 0) {
      const k = 1 - Math.pow(1 - Math.min(1, q / .95), 2.6); if (!vaso.classList.contains('lista')) { cuadro(Math.round(k * (N - 1))); if (q > 1 && fin.complete && fin.naturalWidth) vaso.classList.add('lista'); }
      vaso.style.transform = `translate(${suave[0] * -8}px,${suave[1] * -6 + Math.sin(now / 1400) * 4}px)`;
    }
    pintaMigas(Math.max(0, q) / 1.1, now / 1000);
    granos.forEach((g, i) => { const z = [1, .9, .6, 1.1, .6, 1.5, .8][i]; g.style.transform = `translate(${suave[0] * 28 * z}px,${suave[1] * 22 * z + Math.sin(now / 1650 + i * 2) * 6}px) rotate(${Math.sin(now / 2600 + i) * 5}deg)`; });
  }
  if (vivo3) vuela.forEach((g, i) => { const z = [1.3, .7][i]; g.style.transform = `translate(${suave[0] * 34 * z}px,${suave[1] * 28 * z + Math.sin(now / 1500 + i * 1.9) * 8}px) rotate(${Math.sin(now / 2600 + i) * 5}deg)`; });
  requestAnimationFrame(bucle);
}
new IntersectionObserver(e => { enC = e[0].isIntersecting; dock(); }, { rootMargin: '0px 0px -25% 0px' }).observe(contacto);
[[$('.horas'), 0], [contacto, 1]].forEach(([e, i]) => new IntersectionObserver(z => $$('.tope nav a')[i].toggleAttribute('aria-current', z[0].isIntersecting), { rootMargin: i ? '0px 0px -45% 0px' : '-35% 0px -55% 0px' }).observe(e));
addEventListener('scroll', alMover, { passive: true }); addEventListener('resize', medir); medir();
if (quieto) { vaso.classList.add('lista'); carga('piezas/g0.webp').then(g => { if (g) hacerSprites(g); medir(); }); }
else {
  new IntersectionObserver(e => { vivo = e[0].isIntersecting; }).observe(sec); new IntersectionObserver(e => { vivo3 = e[0].isIntersecting; }).observe(contacto);
  if (!toca) addEventListener('pointermove', e => { mov = [e.clientX / innerWidth - .5, e.clientY / innerHeight - .5]; }, { passive: true });
  carga('piezas/r-00.webp').then(g => { if (g && tRot < 0 && !f.length) x.drawImage(g, 0, 0, 720, 792); });
  Promise.all([carga('piezas/g0.webp'), ...Array.from({ length: N }, (_, i) => carga(`piezas/r-${String(i).padStart(2, '0')}.webp`))]).then(([g, ...r]) => { if (g) hacerSprites(g); if (r.every(Boolean)) { f.push(...r); romper(); } else { vaso.classList.add('lista'); tRot = performance.now() - 2000; } medir(); });
  vaso.addEventListener('click', romper); requestAnimationFrame(bucle);
}
document.fonts?.ready.then(medir);

/* ---------- Muestra: los botones no mandan nada ---------- */
const av = $('#aviso'), abre = (t, m) => { $('.t', av).textContent = t; const b = $('blockquote', av); b.textContent = m; b.hidden = !m; av.showModal(); };
$$('[data-wa]').forEach(b => b.addEventListener('click', () => abre('Se abriría WhatsApp', b.dataset.wa)));
$$('[data-llamar]').forEach(b => b.addEventListener('click', () => abre('Se abriría la llamada', '11 6039-3729')));
$('#formulario').addEventListener('submit', e => { e.preventDefault(); const d = new FormData(e.target); abre('Se abriría WhatsApp', `Hola, Cafeína. Soy ${d.get('nombre')}. ${d.get('mensaje')}`); });
let tt; const toast = $('.toast'); $$('[data-copia]').forEach(b => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copia); toast.textContent = 'Dirección copiada'; } catch { toast.textContent = b.dataset.copia; } toast.classList.add('si'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('si'), 2200); }));
})();
