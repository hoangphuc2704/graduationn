/* ===== Thư mời của Hoàng Phúc — hiệu ứng ===== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var INK = '#0F172A', PRIMARY = '#F26F21', WHITE = '#FFFFFF';
  var PCOLORS = ['#F26F21', '#38BDF8', '#FFFFFF', '#FB923C', '#94A3B8'];
  var NAME_FONT = '"Baloo 2","Nunito",ui-rounded,system-ui,sans-serif';
  var LINES = [{ t: 'Nguyễn Bùi ', s: 124, y: 150 }, { t: 'Hoàng Phúc', s: 150, y: 310 }];
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  var hero = $('#top'), table = $('#table'), deckEl = $('#deck'), portrait = $('#portrait'),
    logoWrap = $('#logoWrap'), welcome = $('#welcome'), after = $('#after'), floatWrap = $('#floaters');

  /* ---------- bộ bài trên sách ---------- */
  var DECK = [
    { x: '19%', y: '17%', r: -15 }, { x: '34.5%', y: '9%', r: -7 }, { x: '50%', y: '6%', r: 0 },
    { x: '65.5%', y: '1%', r: 7, glow: true }, { x: '81%', y: '14%', r: 15 }
  ];
  deckEl.innerHTML = DECK.map(function (d, i) {
    return '<button type="button" class="tcard deck-card' + (d.glow ? ' glow' : '') + '" style="--i:' + i + ';--x:' + d.x + ';--y:' + d.y + ';--r:' + d.r + 'deg"' +
      ' aria-label="Khám phá thẻ số ' + (i + 1) + '"><svg viewBox="0 0 200 330" aria-hidden="true"><use href="#cardBack"/></svg></button>';
  }).join('');
  var deckCards = $$('.deck-card', deckEl);

  /* ---------- khung ảnh: bấm để thử ảnh (không lưu lại, tải lại trang là mất; xóa ảnh thử cũ đã lưu) ---------- */
  var CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.6"/></svg>';
  function store(key, val) { try { if (val == null) localStorage.removeItem(key); else localStorage.setItem(key, val); return true; } catch (e) { return false; } }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function shrink(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1100 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Không đọc được ảnh')); };
      img.src = url;
    });
  }
  $$('.photo-slot').forEach(function (slot) {
    var id = 'ph-' + slot.dataset.slot, label = slot.dataset.label, key = 'tm-photo:' + slot.dataset.slot;
    store(key, null);
    if (slot.dataset.src) {
      /* khung đã có ảnh chính thức: hiển thị cố định, không cho đổi */
      var box = document.createElement('span'); box.className = slot.className + ' has-img fixed';
      Array.prototype.forEach.call(slot.attributes, function (a) { if (a.name !== 'class' && a.name !== 'for') box.setAttribute(a.name, a.value); });
      var pic = new Image(); pic.alt = label; pic.decoding = 'async';
      if (slot.dataset.slot !== 'chan-dung') pic.loading = 'lazy';
      if (slot.dataset.pos) pic.style.objectPosition = slot.dataset.pos;
      pic.onload = function () { pic.classList.add('ok'); };
      pic.src = slot.dataset.src;
      box.appendChild(pic);
      slot.parentNode.replaceChild(box, slot);
      return;
    }
    slot.innerHTML = '<input type="file" accept="image/*" id="' + id + '" aria-label="Chọn ' + label + '">' +
      '<span class="ph-empty">' + CAM + '<b>Thêm ảnh</b><small>' + label + '</small></span>' +
      '<img alt="' + label + '" hidden><span class="ph-change" aria-hidden="true">Đổi ảnh</span>';
    var input = slot.querySelector('input'), img = slot.querySelector('img');
    function show(src) { img.src = src; img.hidden = false; slot.classList.add('has-img'); }
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (!f) return;
      shrink(f).then(function (data) { show(data); }).catch(function () { });
      input.value = '';
    });
  });

  /* ---------- canvas ---------- */
  var sky = $('#sky'), sctx = sky.getContext('2d'), fx = $('#fx'), fctx = fx.getContext('2d');
  var W = 0, H = 0, DPR = 1, stars = [], skyParts = [], fxParts = [], meteor = null, nextMeteor = 4000;
  var smooth = window.scrollY, prevSmooth = smooth, vel = 0;

  function makeStars() {
    var count = clamp(Math.round(W * H / 5200), 70, 380);
    stars = [];
    for (var i = 0; i < count; i++) {
      var big = Math.random() < 0.12;
      stars.push({
        x: Math.random() * W, y: Math.random() * H, r: big ? rand(3, 6) : rand(0.6, 1.8), big: big,
        ph: Math.random() * 6.28, sp: rand(0.6, 2.2), d: rand(0.02, 0.12), c: big && Math.random() < 0.5 ? '#F26F21' : '#FFFFFF'
      });
    }
  }
  function sparkPath(ctx, x, y, r) {
    var k = r * 0.2;
    ctx.beginPath(); ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x + k, y - k, x + r, y); ctx.quadraticCurveTo(x + k, y + k, x, y + r);
    ctx.quadraticCurveTo(x - k, y + k, x - r, y); ctx.quadraticCurveTo(x - k, y - k, x, y - r); ctx.closePath();
  }
  function addPart(list, x, y, opt) {
    if (list.length > 700) list.shift();
    opt = opt || {};
    var a = opt.a != null ? opt.a : Math.random() * 6.28, sp = opt.sp != null ? opt.sp : rand(0.2, 1.4);
    list.push({
      x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opt.up || 0), g: opt.g != null ? opt.g : 0.02,
      life: 0, max: opt.max || rand(500, 1000), r: opt.r || rand(2, 5), c: opt.c || PCOLORS[(Math.random() * PCOLORS.length) | 0]
    });
  }
  function stepParts(ctx, list, dt, offY) {
    for (var i = list.length - 1; i >= 0; i--) {
      var p = list[i];
      p.life += dt;
      if (p.life >= p.max) { list.splice(i, 1); continue; }
      var f = dt / 16.67;
      p.x += p.vx * f; p.y += p.vy * f; p.vy += p.g * f; p.vx *= 0.985;
      var t = p.life / p.max, s = p.r * (t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8 * 0.9);
      var y = p.y - offY;
      if (y < -20 || y > H + 20) continue;
      ctx.globalAlpha = 1 - t * t;
      ctx.fillStyle = p.c;
      sparkPath(ctx, p.x, y, Math.max(0.3, s));
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* hạt sáng vàng (bokeh) */
  var glowImg = document.createElement('canvas'); glowImg.width = glowImg.height = 64;
  (function () {
    var g = glowImg.getContext('2d'), rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.25, 'rgba(242,111,33,.85)');
    rg.addColorStop(0.65, 'rgba(242,111,33,.2)'); rg.addColorStop(1, 'rgba(242,111,33,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
  })();
  var glows = [];
  function addGlow(x, y, opt) {
    if (reduce || glows.length > 380) return;
    opt = opt || {};
    var a = opt.a != null ? opt.a : rand(0, 6.283), sp = opt.sp != null ? opt.sp : rand(0.05, 0.4);
    glows.push({
      x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opt.up != null ? opt.up : 0.35), life: -(opt.delay || 0),
      max: opt.max || rand(1800, 3600), r: opt.r || rand(6, 16)
    });
  }
  function drawGlows(dt) {
    var sy0 = window.scrollY;
    fctx.globalCompositeOperation = 'lighter';
    for (var i = glows.length - 1; i >= 0; i--) {
      var p = glows[i];
      p.life += dt;
      if (p.life < 0) continue;
      if (p.life >= p.max) { glows.splice(i, 1); continue; }
      var f = dt / 16.67; p.x += p.vx * f; p.y += p.vy * f; p.vx *= 0.995;
      var t = p.life / p.max, y = p.y - sy0;
      if (y < -40 || y > H + 40) continue;
      fctx.globalAlpha = Math.sin(Math.PI * t) * 0.9;
      var r = p.r * (0.7 + 0.3 * Math.sin(p.life / 300));
      fctx.drawImage(glowImg, (p.x - r) * DPR, (y - r) * DPR, r * 2 * DPR, r * 2 * DPR);
    }
    fctx.globalAlpha = 1; fctx.globalCompositeOperation = 'source-over';
  }
  function cardOrigins() {
    return deckCards.map(function (c) {
      var r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY, w: r.width, h: r.height };
    });
  }

  function resize() {
    var nw = window.innerWidth, nh = window.innerHeight, widthChanged = nw !== W, bigH = Math.abs(nh - H) > 140;
    W = nw; H = nh; DPR = Math.min(2, window.devicePixelRatio || 1);
    [sky, fx].forEach(function (c) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
    if (widthChanged || bigH || !stars.length) makeStars();
    if (widthChanged) {
      buildFloaters();
      if (state !== 'idle' && state !== 'arming') { layoutName(); finishFlight(); }
    }
  }

  function drawSky(t, dt) {
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    sctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], y = ((s.y - smooth * s.d) % H + H) % H;
      var a = reduce ? 0.8 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
      sctx.globalAlpha = a; sctx.fillStyle = s.c;
      if (s.big) { sparkPath(sctx, s.x, y, s.r * (0.65 + 0.35 * a)); sctx.fill(); }
      else { sctx.beginPath(); sctx.arc(s.x, y, s.r, 0, 6.283); sctx.fill(); }
    }
    sctx.globalAlpha = 1;
    if (!reduce) {
      nextMeteor -= dt;
      if (!meteor && nextMeteor <= 0) {
        var dir = Math.random() < 0.5 ? -1 : 1;
        meteor = { x: rand(W * 0.2, W * 0.8), y: rand(10, H * 0.35), vx: dir * rand(9, 13), vy: rand(3.5, 5.5), life: 0, max: 900 };
        nextMeteor = rand(5000, 11000);
      }
      if (meteor) {
        meteor.life += dt;
        var f = dt / 16.67; meteor.x += meteor.vx * f; meteor.y += meteor.vy * f;
        var tl = 1 - meteor.life / meteor.max;
        var g = sctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 12, meteor.y - meteor.vy * 12);
        g.addColorStop(0, 'rgba(255,255,255,' + (0.95 * tl) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
        sctx.strokeStyle = g; sctx.lineWidth = 3; sctx.lineCap = 'round';
        sctx.beginPath(); sctx.moveTo(meteor.x, meteor.y); sctx.lineTo(meteor.x - meteor.vx * 12, meteor.y - meteor.vy * 12); sctx.stroke();
        if (meteor.life > meteor.max) meteor = null;
      }
    }
    stepParts(sctx, skyParts, dt, 0);
  }

  /* ---------- thẻ bay theo cuộn ---------- */
  var floaters = [];
  function buildFloaters() {
    var count = W < 640 ? 4 : W < 1024 ? 6 : 8;
    if (floaters.length !== count) {
      floatWrap.textContent = ''; floaters = [];
      var fronts = ['cardStar', 'cardSun', 'cardMagician'];
      for (var i = 0; i < count; i++) {
        var el = document.createElement('div');
        el.className = 'floater';
        el.innerHTML = '<div class="flip"><div class="face back"><svg viewBox="0 0 200 330"><use href="#cardBack"/></svg></div>' +
          '<div class="face front"><svg viewBox="0 0 200 330"><use href="#' + fronts[i % 3] + '"/></svg></div></div>';
        floatWrap.appendChild(el);
        floaters.push({
          el: el, flip: el.firstChild, side: i % 2 ? 1 : -1, y0: (i + 0.5) / count + rand(-0.05, 0.05),
          speed: rand(0.12, 0.42), ph: Math.random() * 6.28, fs: rand(0.5, 1), r0: rand(-22, 22), ry0: rand(0, 360),
          lag: 0, k: rand(5, 11), sc: rand(0.82, 1.12)
        });
      }
    }
    var lane = Math.max(0, (W - 1120) / 2);
    floaters.forEach(function (f) {
      f.w = f.el.offsetWidth || 70; f.h = f.el.offsetHeight || 115;
      var x;
      if (lane > f.w + 24) x = rand(10, lane - f.w - 10);
      else x = -f.w * rand(0.25, 0.45);
      f.x0 = f.side < 0 ? x : W - f.w - x;
    });
  }
  function updateFloaters(t) {
    var appear = reduce ? 0 : clamp((window.scrollY - H * 0.3) / (H * 0.5), 0, 1);
    floatWrap.style.opacity = (appear * (W < 640 ? 0.6 : 0.9)).toFixed(3);
    if (appear <= 0) return;
    var v = clamp(vel, -60, 60);
    for (var i = 0; i < floaters.length; i++) {
      var f = floaters[i], span = H + f.h * 2 + 40;
      f.lag += (v * f.k - f.lag) * 0.06;
      var y = ((f.y0 * span - smooth * f.speed) % span + span) % span - f.h - 20 + clamp(f.lag, -140, 140);
      var x = f.x0 + Math.sin(t * f.fs + f.ph) * (8 + Math.min(36, Math.abs(v) * 1.6)) * f.side;
      var rot = f.r0 + Math.sin(t * f.fs * 0.8 + f.ph) * 6 + clamp(v * 1.3, -32, 32) * f.side;
      var ry = f.ry0 + smooth * f.speed * 0.45;
      f.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(1) + 'deg) scale(' + f.sc + ')';
      f.flip.style.transform = 'rotateY(' + (ry % 360).toFixed(1) + 'deg)';
      if (Math.abs(v) > 2.5 && Math.random() < Math.min(0.9, Math.abs(v) * 0.04)) {
        addPart(skyParts, x + f.w / 2 + rand(-f.w * 0.4, f.w * 0.4), y + f.h / 2 + rand(-f.h * 0.4, f.h * 0.4),
          { sp: rand(0.2, 0.8), a: v > 0 ? -Math.PI / 2 + rand(-0.6, 0.6) : Math.PI / 2 + rand(-0.6, 0.6), g: 0, max: rand(450, 850), r: rand(2, 4.5) });
      }
    }
  }

  /* ---------- tên được xếp từ lá bài ---------- */
  var state = 'idle', L = null, minis = [], flyStart = 0, flyEnd = 0, settleStart = 0, nameAlpha = 0;
  var measure = document.createElement('canvas').getContext('2d');
  function fontAt(s) { return '800 ' + s + 'px ' + NAME_FONT; }
  function fitLines() {
    return LINES.map(function (l, i) {
      measure.font = fontAt(100);
      var w = measure.measureText(l.t).width / 100;
      var s = Math.min(l.s, (i ? 930 : 900) / w);
      return { t: l.t, s: s, y: l.y };
    });
  }
  function paintName(ctx, lines, mode) {
    ctx.save();
    ctx.translate(500, 180); ctx.rotate(-5 * Math.PI / 180); ctx.translate(-500, -180);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
    lines.forEach(function (l) {
      ctx.font = fontAt(l.s);
      if (mode === 'mask') {
        ctx.fillStyle = ctx.strokeStyle = '#fff'; ctx.lineWidth = 26;
        ctx.strokeText(l.t, 500, l.y); ctx.fillText(l.t, 500, l.y);
      } else if (mode === 'fill') {
        ctx.fillStyle = '#fff'; ctx.fillText(l.t, 500, l.y);
      } else {
        ctx.fillStyle = ctx.strokeStyle = INK; ctx.lineWidth = 26;
        ctx.strokeText(l.t, 500, l.y + 12); ctx.fillText(l.t, 500, l.y + 12);
      }
    });
    if (mode === 'art') {
      lines.forEach(function (l) {
        ctx.font = fontAt(l.s);
        ctx.strokeStyle = INK; ctx.lineWidth = 24; ctx.strokeText(l.t, 500, l.y);
        var g = ctx.createLinearGradient(0, l.y - l.s * 0.8, 0, l.y + l.s * 0.1);
        g.addColorStop(0, '#F26F21'); g.addColorStop(0.48, '#FFFFFF'); g.addColorStop(1, '#38BDF8');
        ctx.fillStyle = g; ctx.fillText(l.t, 500, l.y);
      });
    }
    ctx.restore();
  }
  function layoutName() {
    var r = logoWrap.getBoundingClientRect(), k = r.width / 1000, pad = 70;
    var lines = fitLines();
    var cw = Math.ceil((1000 + pad * 2) * k), ch = Math.ceil((360 + pad * 2) * k);
    var art = document.createElement('canvas'); art.width = Math.ceil(cw * DPR); art.height = Math.ceil(ch * DPR);
    var actx = art.getContext('2d'); actx.setTransform(k * DPR, 0, 0, k * DPR, pad * k * DPR, pad * k * DPR);
    paintName(actx, lines, 'art');
    var fill = document.createElement('canvas'); fill.width = art.width; fill.height = art.height;
    var flctx = fill.getContext('2d'); flctx.setTransform(k * DPR, 0, 0, k * DPR, pad * k * DPR, pad * k * DPR);
    paintName(flctx, lines, 'fill');
    var sheen = document.createElement('canvas'); sheen.width = art.width; sheen.height = art.height;
    var mask = document.createElement('canvas'); mask.width = cw; mask.height = ch;
    var mctx = mask.getContext('2d'); mctx.setTransform(k, 0, 0, k, pad * k, pad * k);
    paintName(mctx, lines, 'mask');
    var data = mctx.getImageData(0, 0, cw, ch).data;
    var left = r.left - pad * k, top = r.top + window.scrollY - pad * k;
    var step = clamp(lines[1].s * k * 0.058, 3.4, 9), pts = [];
    for (var pass = 0; pass < 4; pass++) {
      pts = [];
      for (var y = step / 2, row = 0; y < ch; y += step, row++) {
        for (var x = (row % 2 ? step / 2 : 0) + step / 4; x < cw; x += step) {
          var ix = x | 0, iy = y | 0;
          if (data[(iy * cw + ix) * 4 + 3] > 128) pts.push({ x: left + x + rand(-step * 0.2, step * 0.2), y: top + y + rand(-step * 0.2, step * 0.2) });
        }
      }
      if (pts.length <= 1700) break;
      step *= Math.sqrt(pts.length / 1650);
    }
    L = { left: left, top: top, cw: cw, ch: ch, art: art, fill: fill, sheen: sheen, pts: pts, step: step };
  }
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  function startFlight(origins, now) {
    var minX = Infinity, maxX = -Infinity;
    L.pts.forEach(function (p) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; });
    var spanX = Math.max(1, maxX - minX), R = Math.min(W, H);
    minis = L.pts.map(function (p) {
      var o = origins[(Math.random() * origins.length) | 0];
      var sx = o.x + rand(-o.w * 0.35, o.w * 0.35), sy = o.y + rand(-o.h * 0.35, o.h * 0.35);
      var a = rand(-Math.PI, 0), rr = rand(0.18, 0.5) * R, a2 = a + (Math.random() < 0.5 ? -1 : 1) * rand(1, 2);
      return {
        sx: sx, sy: sy, c1x: sx + Math.cos(a) * rr, c1y: sy + Math.sin(a) * rr, c2x: p.x + Math.cos(a2) * rr * 0.5, c2y: p.y + Math.sin(a2) * rr * 0.5,
        tx: p.x, ty: p.y, delay: 80 + (p.x - minX) / spanX * 700 + rand(0, 380), dur: rand(950, 1500),
        spin: rand(-12, 12), rf: rand(-0.25, 0.25), fp: rand(0, 6.28), yel: Math.random() < 0.18, landed: false
      };
    });
    flyStart = now;
    flyEnd = now + minis.reduce(function (m, q) { return Math.max(m, q.delay + q.dur); }, 0);
    state = 'flying';
  }
  function finishFlight() {
    minis = [];
    state = 'done'; nameAlpha = 1;
    revealAfter();
  }
  function revealAfter() {
    if (!after.hidden) return;
    welcome.hidden = true; after.hidden = false;
  }
  function drawMinis(now, alpha) {
    var mw = Math.max(3, L.step * 0.95), mh = mw * 1.5, sy0 = window.scrollY;
    for (var i = 0; i < minis.length; i++) {
      var m = minis[i], t = (now - flyStart - m.delay) / m.dur;
      if (t <= 0) continue;
      if (t > 1) t = 1;
      var e = easeOut(t), u = 1 - e;
      var x = u * u * u * m.sx + 3 * u * u * e * m.c1x + 3 * u * e * e * m.c2x + e * e * e * m.tx;
      var y = u * u * u * m.sy + 3 * u * u * e * m.c1y + 3 * u * e * e * m.c2y + e * e * e * m.ty;
      var rot = m.rf + u * m.spin, flip = t < 1 ? Math.cos(m.fp + e * Math.PI * 5) : 1, sc = 1 + Math.sin(Math.PI * e) * 1.1;
      var fxs = Math.max(0.15, Math.abs(flip)), c = Math.cos(rot), s = Math.sin(rot), kk = DPR * sc;
      fctx.setTransform(c * kk * fxs, s * kk * fxs, -s * kk, c * kk, DPR * x, DPR * (y - sy0));
      fctx.globalAlpha = alpha * Math.min(1, t * 5);
      fctx.fillStyle = flip < 0 || m.yel ? '#F26F21' : '#1E293B';
      fctx.fillRect(-mw / 2, -mh / 2, mw, mh);
      fctx.lineWidth = Math.max(0.6, mw * 0.16); fctx.strokeStyle = flip < 0 || m.yel ? INK : '#F26F21';
      fctx.strokeRect(-mw / 2, -mh / 2, mw, mh);
      if (t < 1 && Math.random() < 0.08) addPart(fxParts, x, y, { sp: rand(0.1, 0.6), g: 0.01, max: rand(380, 700), r: rand(1.6, 3.6) });
      if (t === 1 && !m.landed) { m.landed = true; if (Math.random() < 0.12) addPart(fxParts, x, y, { sp: 0.3, g: 0, max: 420, r: rand(3, 5), c: '#FFFFFF' }); }
    }
    fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.globalAlpha = 1;
  }
  function drawName(now, alpha) {
    var y = L.top - window.scrollY;
    if (y > H || y + L.ch < 0) return;
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.globalAlpha = alpha;
    fctx.drawImage(L.art, L.left * DPR, y * DPR);
    if (!reduce) {
      var sc = L.sheen.getContext('2d'), w = L.sheen.width, h = L.sheen.height;
      sc.globalCompositeOperation = 'source-over'; sc.clearRect(0, 0, w, h); sc.drawImage(L.fill, 0, 0);
      sc.globalCompositeOperation = 'source-in';
      var ph = (now % 4200) / 4200, bx = -0.3 * w + ph * 1.8 * w, bw = w * 0.12;
      var g = sc.createLinearGradient(bx - bw, 0, bx + bw, h * 0.6);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      sc.fillStyle = g; sc.fillRect(0, 0, w, h);
      fctx.globalAlpha = alpha * 0.75;
      fctx.drawImage(L.sheen, L.left * DPR, y * DPR);
      if (alpha >= 1 && Math.random() < 0.3 && L.pts.length) {
        var p = L.pts[(Math.random() * L.pts.length) | 0];
        addPart(fxParts, p.x, p.y, { sp: rand(0, 0.3), g: 0, max: rand(500, 900), r: rand(2.5, 5.5), c: Math.random() < 0.6 ? '#FFFFFF' : '#FFE27A' });
      }
    }
    fctx.globalAlpha = 1;
  }

  /* ---------- màn mở thẻ: bay ra giữa, nạp sáng, lóe sáng, lật ảnh ---------- */
  var stage = $('#stage'), stageCard = $('#stageCard'), scShake = $('.sc-shake', stage), scFlip = $('.sc-flip', stage),
    scBack = $('.sc-back', stage), scFront = $('.sc-front', stage), scLightB = $('.sc-back .sc-light', stage), scLightF = $('.sc-front .sc-light', stage),
    stDim = $('.stage-dim', stage), stRays = $('.stage-rays', stage), stRing = $('.stage-ring', stage), stFlash = $('.stage-flash', stage), stCap = $('.stage-caption', stage);
  var portraitCard = $('.tcard', portrait), stageAnims = [], charge = false, runId = 0;
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function anim(el, kf, opt) { var a = el.animate(kf, Object.assign({ fill: 'forwards' }, opt)); stageAnims.push(a); return a; }
  function closeStage() {
    charge = false;
    stageAnims.forEach(function (a) { try { a.cancel(); } catch (e) { } });
    stageAnims = [];
    if (portraitCard.parentNode !== portrait) portrait.appendChild(portraitCard);
    stage.hidden = true; stage.classList.remove('spin'); scBack.hidden = false; scFront.hidden = true;
  }
  function portraitCenter() {
    var tr = table.getBoundingClientRect();
    return { x: tr.left + portrait.offsetLeft, y: tr.top + portrait.offsetTop + portrait.offsetHeight / 2, w: portrait.offsetWidth };
  }
  function burstAt(x, y, nParts, nGlows) {
    var dy = window.scrollY;
    for (var i = 0; i < nParts; i++) addPart(fxParts, x, y + dy, { a: i / nParts * 6.283 + rand(-0.15, 0.15), sp: rand(3, 8), g: 0.04, max: rand(700, 1200), r: rand(3, 7) });
    for (var j = 0; j < nGlows; j++) addGlow(x + rand(-40, 40), y + dy + rand(-60, 60), { sp: rand(1, 4.5), up: 0.2, r: rand(8, 22), max: rand(900, 1800) });
  }
  function chargeGlows() {
    var k = Math.random() < 0.5 ? 2 : 3;
    while (k--) {
      var a = rand(0, 6.283), d = rand(0.28, 0.55) * Math.min(W, H), life = rand(650, 950);
      addGlow(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d + window.scrollY, { a: a + Math.PI, sp: d / (life / 16.67) * 1.05, up: 0, max: life, r: rand(5, 13) });
    }
  }
  function cinematic(chosen, id) {
    var r = chosen.getBoundingClientRect(), rot = parseFloat(chosen.style.getPropertyValue('--r')) || 0;
    var Wc = Math.min(Math.min(H * 0.62, 540) * 200 / 330, W * 0.66);
    stage.style.setProperty('--scw', Wc + 'px');
    var s0 = chosen.offsetWidth / Wc, dx0 = r.left + r.width / 2 - W / 2, dy0 = r.top + r.height / 2 - H / 2;
    scFront.insertBefore(portraitCard, scLightF);
    scBack.hidden = false; scFront.hidden = true;
    stage.classList.add('spin');
    stage.hidden = false;
    chosen.classList.add('taken');
    anim(stDim, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    var fly = anim(stageCard, [
      { transform: 'translate(' + dx0 + 'px,' + dy0 + 'px) rotate(' + rot + 'deg) scale(' + s0 + ')' },
      { transform: 'translate(0px,-20px) rotate(-6deg) scale(1.06)', offset: 0.7 },
      { transform: 'translate(0px,0px) rotate(0deg) scale(1)' }], { duration: 760, easing: 'cubic-bezier(.25,.8,.35,1)' });
    anim(scFlip, [{ transform: 'perspective(1400px) rotateY(0deg)' }, { transform: 'perspective(1400px) rotateY(720deg)' }], { duration: 950, easing: 'cubic-bezier(.3,.6,.25,1)' });
    return fly.finished.then(function () {
      if (id !== runId) throw 0;
      anim(stRays, [{ opacity: 0 }, { opacity: 1 }], { duration: 900 });
      anim(stCap, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450 });
      anim(scLightB, [{ opacity: 0 }, { opacity: 0.97 }], { duration: 1200, easing: 'ease-in' });
      anim(scShake, [
        { transform: 'rotate(0deg) scale(1)', filter: 'drop-shadow(0 0 0px rgba(242,111,33,0))' },
        { transform: 'rotate(-1.5deg) scale(1.01)', offset: 0.2 }, { transform: 'rotate(1.5deg) scale(1.02)', offset: 0.34 },
        { transform: 'rotate(-2.5deg) scale(1.03)', offset: 0.48 }, { transform: 'rotate(2.5deg) scale(1.04)', offset: 0.6 },
        { transform: 'rotate(-3deg) scale(1.05)', offset: 0.72 }, { transform: 'rotate(3deg) scale(1.06)', offset: 0.84 },
        { transform: 'rotate(0deg) scale(1.08)', filter: 'drop-shadow(0 0 36px rgba(242,111,33,1)) drop-shadow(0 0 90px rgba(56,189,248,.8))' }],
        { duration: 1200, easing: 'ease-in' });
      charge = true;
      return sleep(1200);
    }).then(function () {
      if (id !== runId) throw 0;
      charge = false;
      anim(stFlash, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
      anim(stCap, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
      return sleep(80);
    }).then(function () {
      if (id !== runId) throw 0;
      stage.classList.remove('spin'); scFront.hidden = false;
      anim(scFlip, [{ transform: 'perspective(1400px) rotateY(720deg) scale(1)' }, { transform: 'perspective(1400px) rotateY(1120deg) scale(1.1)', offset: 0.55 },
      { transform: 'perspective(1400px) rotateY(1260deg) scale(1)' }], { duration: 1200, easing: 'cubic-bezier(.2,.7,.25,1)' });
      anim(scLightF, [{ opacity: 0.97 }, { opacity: 0 }], { duration: 950, easing: 'ease-out' });
      anim(stRing, [{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(3.6)', opacity: 0 }], { duration: 950, easing: 'cubic-bezier(.2,.7,.3,1)' });
      anim(scShake, [{ transform: 'scale(1.08)', filter: 'drop-shadow(0 0 36px rgba(242,111,33,1)) drop-shadow(0 0 90px rgba(56,189,248,.8))' },
      { transform: 'scale(1)', filter: 'drop-shadow(0 0 26px rgba(242,111,33,.95))' }], { duration: 800, easing: 'ease-out' });
      burstAt(W / 2, H / 2, 44, 50);
      return sleep(1700);
    }).then(function () {
      if (id !== runId) throw 0;
      var pc = portraitCenter(), s1 = pc.w / Wc;
      anim(stDim, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 });
      anim(stRays, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 });
      return anim(stageCard, [{ transform: 'translate(0px,0px) rotate(0deg) scale(1)' },
      { transform: 'translate(' + (pc.x - W / 2) + 'px,' + (pc.y - H / 2) + 'px) rotate(0deg) scale(' + s1 + ')' }],
        { duration: 680, easing: 'cubic-bezier(.5,0,.3,1)' }).finished;
    }).then(function () {
      if (id !== runId) throw 0;
      portrait.classList.add('instant', 'show'); portrait.setAttribute('aria-hidden', 'false');
      closeStage();
      requestAnimationFrame(function () { requestAnimationFrame(function () { portrait.classList.remove('instant'); }); });
    });
  }
  function burstOthers(chosen) {
    var tr = table.getBoundingClientRect(), origins = [];
    deckCards.forEach(function (c) {
      if (c === chosen) return;
      var r = c.getBoundingClientRect();
      origins.push({ x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY, w: r.width, h: r.height });
      var ccx = c.offsetLeft + c.offsetWidth / 2, dirX = (ccx - tr.width / 2) / (tr.width / 2);
      c.style.setProperty('--bx', (dirX * W * 0.6 + rand(-120, 120)) + 'px');
      c.style.setProperty('--by', (-rand(0.45, 0.9) * H) + 'px');
      c.style.setProperty('--br', rand(-540, 540) + 'deg');
      c.classList.add('fly');
    });
    if (!reduce) origins.forEach(function (o) {
      for (var j = 0; j < 14; j++) addPart(fxParts, o.x, o.y, { sp: rand(1.5, 5), up: 1.2, g: 0.06, max: rand(600, 1100), r: rand(2.5, 6) });
      for (var k = 0; k < 6; k++) addGlow(o.x + rand(-o.w / 2, o.w / 2), o.y + rand(-o.h / 2, o.h / 2), { sp: rand(0.4, 1.5), r: rand(6, 14), max: rand(900, 1600) });
    });
    return origins;
  }
  function openDeck(chosen) {
    if (state !== 'idle') return;
    state = 'arming';
    var id = ++runId;
    hero.classList.add('opened');
    deckCards.forEach(function (c) { c.tabIndex = -1; });
    $('#heroTitle').textContent = 'Nguyễn Bùi Hoàng Phúc — Thư mời tốt nghiệp';
    var ready = (document.fonts && document.fonts.load) ? Promise.race([document.fonts.load(fontAt(80), 'Nguyễn Bùi Hoàng Phúc'), sleep(1200)]) : Promise.resolve();
    var co = cardOrigins()[deckCards.indexOf(chosen)];
    for (var gi = 0; gi < 30; gi++) addGlow(co.x + rand(-co.w * 0.6, co.w * 0.6), co.y + rand(-co.h * 0.6, co.h * 0.6), { sp: rand(0.3, 1.6), up: 0.5, r: rand(7, 18), max: rand(1200, 2400), delay: rand(0, 300) });
    var seq = reduce ? Promise.resolve().then(function () {
      chosen.classList.add('taken');
      portrait.classList.add('instant', 'show'); portrait.setAttribute('aria-hidden', 'false');
    }) : cinematic(chosen, id);
    seq.then(function () {
      if (id !== runId) return;
      var origins = burstOthers(chosen);
      return ready.catch(function () { }).then(function () {
        if (id !== runId) return;
        layoutName();
        if (reduce) { finishFlight(); return; }
        startFlight(origins, performance.now() + 60);
      });
    }).catch(function () { });
  }
  function reshuffle() {
    runId++;
    closeStage();
    state = 'idle'; minis = []; nameAlpha = 0; L = null;
    hero.classList.remove('opened');
    portrait.classList.remove('show', 'instant'); portrait.setAttribute('aria-hidden', 'true');
    deckCards.forEach(function (c) { c.classList.remove('fly', 'chosen', 'taken'); c.tabIndex = 0; });
    after.hidden = true; welcome.hidden = false;
    $('#heroTitle').textContent = 'Thư mời tốt nghiệp Nguyễn Bùi Hoàng Phúc';
    deckCards[3].focus({ preventScroll: true });
  }
  deckCards.forEach(function (c) { c.addEventListener('click', function () { openDeck(c); }); });
  $('#reshuffle').addEventListener('click', reshuffle);

  function drawFx(now, dt) {
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.clearRect(0, 0, fx.width, fx.height);
    if (L && state !== 'idle' && state !== 'arming') {
      if (state === 'flying') {
        drawMinis(now, 1);
        if (now >= flyEnd) { state = 'settle'; settleStart = now; }
      } else if (state === 'settle') {
        var p = clamp((now - settleStart) / 800, 0, 1);
        nameAlpha = p;
        drawMinis(now, 1 - p);
        if (p >= 1) { minis = []; state = 'done'; revealAfter(); }
      }
      if (nameAlpha > 0) drawName(now, nameAlpha);
    }
    drawGlows(dt);
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    stepParts(fctx, fxParts, dt, window.scrollY);
    fctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  /* hạt sáng bay quanh quyển sách khi trang chủ đang hiện */
  function ambientGlows(dt) {
    if (reduce || window.scrollY > hero.offsetHeight) return;
    if (Math.random() < dt / 16.67 * 0.12) {
      var r = table.getBoundingClientRect();
      addGlow(r.left + rand(0.05, 0.95) * r.width, r.top + window.scrollY + rand(0.1, 0.95) * r.height, { sp: rand(0.05, 0.25), up: rand(0.15, 0.45) });
    }
  }
  /* lúc mở trang: lá bài hiện dần kèm ánh sáng */
  setTimeout(function () {
    cardOrigins().forEach(function (o, i) {
      for (var j = 0; j < 9; j++) addGlow(o.x + rand(-o.w * 0.5, o.w * 0.5), o.y + rand(-o.h * 0.5, o.h * 0.5), { delay: 250 + i * 140 + rand(0, 300), sp: rand(0.1, 0.6), r: rand(6, 15), max: rand(1200, 2400) });
    });
  }, 60);

  /* ---------- con trỏ lấp lánh, bấm tung sao ---------- */
  if (!reduce) {
    var lastX = 0, lastY = 0, acc = 0;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      acc += Math.hypot(e.clientX - lastX, e.clientY - lastY); lastX = e.clientX; lastY = e.clientY;
      if (acc > 16) { acc = 0; addPart(fxParts, e.clientX, e.clientY + window.scrollY, { sp: rand(0.2, 0.9), g: 0.03, max: rand(450, 800), r: rand(2, 4.2) }); }
    }, { passive: true });
    window.addEventListener('pointerdown', function (e) {

      for (var i = 0; i < 12; i++) addPart(fxParts, e.clientX, e.clientY + window.scrollY, { a: i / 12 * 6.283 + rand(-0.2, 0.2), sp: rand(2, 4), g: 0.05, max: rand(500, 800), r: rand(2.5, 5) });
    }, { passive: true });
  }

  /* ---------- đếm ngược tới 07.11.2026 (giờ Việt Nam) ---------- */
  var EV_START = Date.UTC(2026, 10, 7, 5, 30, 0), EV_END = Date.UTC(2026, 10, 7, 10, 0, 0); // khách đến từ 12h30 đến 17h00 giờ Việt Nam
  function vnDay(t) { return new Date(t + 7 * 3600e3).toISOString().slice(0, 10); }
  function eventState() {
    var now = Date.now();
    if (now < EV_START) {
      var days = Math.round((Date.parse(vnDay(EV_START)) - Date.parse(vnDay(now))) / 86400e3);
      return days > 0 ? { pre: 'Còn', num: String(days), post: 'ngày' } : { pre: '', num: 'Hôm nay', post: 'lúc 12h30!' };
    }
    if (now < EV_END) return { pre: '', num: '', post: 'Mình đang chờ bạn ở trường!' };
    return { pre: '', num: '', post: 'Cảm ơn bạn đã đến chung vui!' };
  }
  function countdown() {
    var st = eventState();
    $('#cdPre').textContent = st.pre; $('#cdNum').textContent = st.num; $('#cdPost').textContent = st.post;
  }
  countdown(); setInterval(countdown, 60000);

  /* ---------- phong bì bật dấu sáp khi cuộn tới ---------- */
  var env = $('#envelope');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          env.classList.add('in-view');
          if (!reduce) { var r = $('.seal').getBoundingClientRect(); for (var i = 0; i < 18; i++) addPart(fxParts, r.left + r.width / 2, r.top + r.height / 2 + window.scrollY, { sp: rand(1.5, 4), up: 1, g: 0.05, max: rand(600, 1000), r: rand(2.5, 5.5) }); }
          io.disconnect();
        }
      });
    }, { threshold: 0.45 });
    io.observe(env);
  }

  /* ---------- chiều sâu theo chuột ---------- */
  var scene = $('#scene'), pmx = 0, pmy = 0, pmChanged = false;
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) { pmx = (e.clientX / W - 0.5) * 2; pmy = (e.clientY / H - 0.5) * 2; pmChanged = true; }, { passive: true });
  }

  /* ---------- vòng lặp ---------- */
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(50, now - last); last = now;

    var t = now / 1000;
    smooth += (window.scrollY - smooth) * Math.min(1, dt / 1000 * 7.5);
    vel = (smooth - prevSmooth) * (16.67 / Math.max(1, dt)); prevSmooth = smooth;
    drawSky(t, dt);
    updateFloaters(t);
    ambientGlows(dt);
    if (charge) chargeGlows();
    if (pmChanged && window.scrollY < hero.offsetHeight) {
      pmChanged = false;
      scene.style.setProperty('--mx', (-pmx).toFixed(3)); scene.style.setProperty('--my', (-pmy).toFixed(3));
    }
    drawFx(now, dt);
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
