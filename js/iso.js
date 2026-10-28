/* ===== Bản đồ hành trình phép thuật — kiểu 2.5D (2D góc nghiêng, đổ bóng) ===== */
(function () {
  'use strict';
  var K = 0.8660254, S = 0.5, OUT = '#2E2080';
  function P(x, y, z) { return [(x - z) * K, (x + z) * S - y]; }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function hex(c) { var n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) { var A = hex(a), B = hex(b); return '#' + A.map(function (v, i) { return ('0' + Math.round(v + (B[i] - v) * t).toString(16)).slice(-2); }).join(''); }
  function lit(c, t) { return mix(c, '#FFFFFF', t); }
  function dk(c, t) { return mix(c, OUT, t); }
  function face(p, fill, sheen, sw) {
    return '<polygon points="' + pts(p) + '" fill="' + fill + '" stroke="' + OUT + '" stroke-width="' + (sw || 2.2) + '" stroke-linejoin="round"/>' +
      (sheen ? '<polygon points="' + pts(p) + '" fill="url(#' + sheen + ')"/>' : '');
  }
  function plain(p, fill, op) { return '<polygon points="' + pts(p) + '" fill="' + fill + '"' + (op ? ' opacity="' + op + '"' : '') + '/>'; }

  /* ---------- khối cơ bản ---------- */
  function box(x, y, z, w, h, d, col, o) {
    o = o || {};
    var X1 = x + w, Y1 = y + h, Z1 = z + d;
    var L = [P(x, Y1, Z1), P(X1, Y1, Z1), P(X1, y, Z1), P(x, y, Z1)];
    var R = [P(X1, Y1, z), P(X1, Y1, Z1), P(X1, y, Z1), P(X1, y, z)];
    var T = [P(x, Y1, z), P(X1, Y1, z), P(X1, Y1, Z1), P(x, Y1, Z1)];
    return face(L, col, 'shL') + face(R, dk(col, 0.22), 'shR') + (o.noTop ? '' : face(T, lit(col, 0.2)));
  }
  function onZ(Z, a) { return a.map(function (q) { return P(q[0], q[1], Z); }); }
  function onX(X, a) { return a.map(function (q) { return P(X, q[1], q[0]); }); }
  function arch(u0, v0, w, h) {
    var r = w / 2, a = [[u0, v0], [u0, v0 + h - r]];
    for (var i = 0; i <= 10; i++) { var t = Math.PI - i * Math.PI / 10; a.push([u0 + r + r * Math.cos(t), v0 + h - r + r * Math.sin(t)]); }
    a.push([u0 + w, v0]); return a;
  }
  function rect(u0, v0, w, h) { return [[u0, v0], [u0 + w, v0], [u0 + w, v0 + h], [u0, v0 + h]]; }
  function win(p) { return face(p, '#FFD54A', 'glowFace', 2); }
  function door(p) { return face(p, '#4B37B8', null, 2.2); }

  function ell(cx, y, cz, r) { var c = P(cx, y, cz); return { x: c[0], y: c[1], rx: r * 1.2247, ry: r * 0.7071 }; }
  function cylinder(cx, cz, r, y0, y1, col, o) {
    o = o || {};
    var b = ell(cx, y0, cz, r), t = ell(cx, y1, cz, r);
    var d = 'M' + (t.x - t.rx) + ' ' + t.y + 'L' + (b.x - b.rx) + ' ' + b.y + 'A' + b.rx + ' ' + b.ry + ' 0 0 0 ' + (b.x + b.rx) + ' ' + b.y +
      'L' + (t.x + t.rx) + ' ' + t.y + 'A' + t.rx + ' ' + t.ry + ' 0 0 1 ' + (t.x - t.rx) + ' ' + t.y + 'Z';
    return '<path d="' + d + '" fill="' + col + '" stroke="' + OUT + '" stroke-width="2.2" stroke-linejoin="round"/><path d="' + d + '" fill="url(#cyl)"/>' +
      (o.noTop ? '' : '<ellipse cx="' + t.x + '" cy="' + t.y + '" rx="' + t.rx + '" ry="' + t.ry + '" fill="' + lit(col, 0.22) + '" stroke="' + OUT + '" stroke-width="2.2"/>');
  }
  function cone(cx, cz, r, y0, h, col) {
    var b = ell(cx, y0, cz, r), A = P(cx, y0 + h, cz);
    var d = 'M' + (b.x - b.rx) + ' ' + b.y + 'L' + A[0] + ' ' + A[1] + 'L' + (b.x + b.rx) + ' ' + b.y + 'A' + b.rx + ' ' + b.ry + ' 0 0 1 ' + (b.x - b.rx) + ' ' + b.y + 'Z';
    return '<path d="' + d + '" fill="' + col + '" stroke="' + OUT + '" stroke-width="2.2" stroke-linejoin="round"/><path d="' + d + '" fill="url(#cyl)"/>' +
      '<path d="M' + (A[0] - 2) + ' ' + (A[1] + 8) + 'L' + (b.x - b.rx * 0.45) + ' ' + (b.y - 2) + '" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>';
  }
  function stripedCone(cx, cz, r, y0, h, c1, c2, n) {
    var A = P(cx, y0 + h, cz), f = [];
    for (var i = 0; i < n; i++) {
      var a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
      if (Math.cos(am) + Math.sin(am) < -0.35) continue;
      f.push({ dpt: Math.cos(am) + Math.sin(am), p: [A, P(cx + Math.cos(a0) * r, y0, cz + Math.sin(a0) * r), P(cx + Math.cos(a1) * r, y0, cz + Math.sin(a1) * r)], c: i % 2 ? c1 : c2, k: (Math.cos(am) - Math.sin(am)) });
    }
    f.sort(function (a, b) { return a.dpt - b.dpt; });
    return f.map(function (q) { return face(q.p, q.k > 0.3 ? dk(q.c, 0.14) : q.c, null, 2); }).join('');
  }
  function dome(cx, cz, r, y0, col) {
    var e = ell(cx, y0, cz, r), H = r * 1.0;
    var d = 'M' + (e.x - e.rx) + ' ' + e.y + 'A' + e.rx + ' ' + H + ' 0 0 1 ' + (e.x + e.rx) + ' ' + e.y + 'A' + e.rx + ' ' + e.ry + ' 0 0 1 ' + (e.x - e.rx) + ' ' + e.y + 'Z';
    return '<path d="' + d + '" fill="' + col + '" stroke="' + OUT + '" stroke-width="2.2"/><path d="' + d + '" fill="url(#domeHi)"/>';
  }
  function hipRoof(x0, x1, z0, z1, y, rh, o, col) {
    var A = P((x0 + x1) / 2, y + rh, (z0 + z1) / 2), a = P(x0 - o, y, z0 - o), b = P(x1 + o, y, z0 - o), c = P(x1 + o, y, z1 + o), d = P(x0 - o, y, z1 + o);
    return face([a, b, A], dk(col, 0.3)) + face([d, a, A], dk(col, 0.3)) + face([b, c, A], dk(col, 0.2), 'shR') + face([d, c, A], col, 'shL');
  }
  function gableX(x0, x1, z0, z1, y, rh, o, col, wall) {
    var zm = (z0 + z1) / 2;
    var back = [P(x0 - o, y, z0 - o), P(x1 + o, y, z0 - o), P(x1 + o, y + rh, zm), P(x0 - o, y + rh, zm)];
    var tri = [P(x1, y, z0), P(x1, y + rh * (zm - z0) / (zm - z0 + o), zm), P(x1, y, z1)];
    var front = [P(x0 - o, y + rh, zm), P(x1 + o, y + rh, zm), P(x1 + o, y, z1 + o), P(x0 - o, y, z1 + o)];
    var edge = [P(x1 + o, y, z0 - o), P(x1 + o, y + rh, zm), P(x1 + o, y, z1 + o)];
    return face(back, dk(col, 0.28)) + face(tri, dk(wall, 0.22), 'shR') +
      '<polyline points="' + pts(edge) + '" fill="none" stroke="' + OUT + '" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<polyline points="' + pts(edge) + '" fill="none" stroke="' + dk(col, 0.12) + '" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      face(front, col, 'shL') +
      '<polyline points="' + pts([P(x0 - o + 6, y + rh - 4, zm + 4), P(x1 + o - 10, y + rh - 4, zm + 4)]) + '" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>';
  }
  function shadow(rx, ry, dx) { return '<ellipse cx="' + (dx || 10) + '" cy="6" rx="' + rx + '" ry="' + ry + '" fill="#1B0F5C" opacity=".28" filter="url(#soft)"/>'; }
  function spark(x, y, r, fill) {
    var k = r * 0.22;
    return '<path d="M' + x + ' ' + (y - r) + 'Q' + (x + k) + ' ' + (y - k) + ' ' + (x + r) + ' ' + y + 'Q' + (x + k) + ' ' + (y + k) + ' ' + x + ' ' + (y + r) + 'Q' + (x - k) + ' ' + (y + k) + ' ' + (x - r) + ' ' + y + 'Q' + (x - k) + ' ' + (y - k) + ' ' + x + ' ' + (y - r) + 'Z" fill="' + (fill || '#fff') + '" stroke="' + OUT + '" stroke-width="1.6" stroke-linejoin="round"/>';
  }
  function puff(x, y, r, col) {
    return '<g fill="' + OUT + '"><circle cx="' + x + '" cy="' + y + '" r="' + (r + 2) + '"/><circle cx="' + (x + r * 0.7) + '" cy="' + (y - r * 0.9) + '" r="' + (r * 0.8 + 2) + '"/></g>' +
      '<g fill="' + col + '"><circle cx="' + x + '" cy="' + y + '" r="' + r + '"/><circle cx="' + (x + r * 0.7) + '" cy="' + (y - r * 0.9) + '" r="' + (r * 0.8) + '"/></g>';
  }

  /* ---------- công trình (gốc = tâm chân đế) ---------- */
  var CREAM = '#FFF1D6', PURP = '#7357EE', LAV = '#B3A4FA', STONE = '#C2B5EF', YEL = '#FFC93C', ORA = '#FF9A3C', PINK = '#FF8FCB';
  function cottage() {
    return shadow(78, 26) +
      box(-36, 0, -30, 72, 52, 60, CREAM) +
      win(onZ(30, rect(-24, 18, 16, 16))) + door(onZ(30, arch(2, 0, 16, 30))) + win(onX(36, rect(-14, 20, 14, 14))) +
      box(14, 62, -16, 12, 34, 12, '#B9A6F7') + puff(P(20, 108, -10)[0], P(20, 108, -10)[1], 8, '#fff') +
      gableX(-36, 36, -30, 30, 52, 40, 9, PURP, CREAM) +
      '<g transform="translate(' + P(52, 0, 36)[0] + ' ' + P(52, 0, 36)[1] + ')"><path d="M0 0 V-38" stroke="' + OUT + '" stroke-width="3"/><path d="M0 -38 L24 -32 L0 -25Z" fill="' + PINK + '" stroke="' + OUT + '" stroke-width="2" stroke-linejoin="round"/></g>' +
      box(-70, 0, 40, 4, 16, 4, '#B57A45') + box(-56, 0, 40, 4, 16, 4, '#B57A45') + box(-42, 0, 40, 4, 16, 4, '#B57A45') + box(-72, 10, 40, 34, 3, 3, '#C98B4A');
  }
  function library() {
    var s = shadow(108, 34) + box(-62, 0, -36, 124, 8, 82, '#D8D0FF') + box(-54, 8, -34, 108, 50, 62, CREAM, { noTop: true });
    s += dome(0, -6, 30, 72, LAV);
    s += '<path d="M' + P(0, 112, -6).join(' ') + 'V' + (P(0, 128, -6)[1]) + '" transform="translate(0 0)" stroke="' + OUT + '" stroke-width="3"/>' + spark(P(0, 132, -6)[0], P(0, 132, -6)[1], 8, YEL);
    s += door(onZ(28, arch(-9, 8, 18, 30)));
    [-46, -28, 12, 30].forEach(function (x) { s += cylinder(x + 8, 34, 5, 8, 58, '#FFFFFF', { noTop: true }); });
    s += box(-58, 58, -38, 116, 6, 76, '#EDE4FF');
    s += gableX(-58, 58, -38, 38, 64, 30, 4, PURP, CREAM);
    var b = P(-14, 74, 22); s += '<g transform="translate(' + b[0] + ' ' + b[1] + ') skewY(30)"><path d="M0 0 Q7 -4 14 1 Q21 -4 28 0 V12 Q21 8 14 13 Q7 8 0 12Z" fill="' + CREAM + '" stroke="' + OUT + '" stroke-width="2"/></g>';
    return s;
  }
  function alchemy() {
    var s = shadow(100, 32, 18) + cylinder(0, 0, 40, 0, 60, STONE);
    s += '<path d="M' + P(-30, 20, 26).join(' ') + 'l14 -2 M' + P(10, 38, 38).join(' ') + 'l14 -4 M' + P(-10, 48, 38).join(' ') + 'l12 -2" stroke="' + dk(STONE, 0.2) + '" stroke-width="4" stroke-linecap="round"/>';
    s += door(onZ(39, arch(-10, 0, 20, 30)).map(function (p, i) { return p; }));
    s += win([P(28, 34, 28), P(36, 34, 18), P(36, 46, 18), P(28, 46, 28)]);
    s += cylinder(18, -20, 7, 60, 104, '#8D7BD1') + puff(P(20, 116, -20)[0], P(20, 116, -20)[1], 8, '#9BF0BE') + puff(P(26, 136, -20)[0] + 6, P(26, 136, -20)[1], 6, '#9BF0BE');
    s += cone(0, 0, 54, 56, 78, ORA);
    var c = P(70, 0, 30);
    s += '<g transform="translate(' + c[0] + ' ' + c[1] + ')">' + shadow(30, 9, 4) +
      '<path d="M-24 -26 Q-24 2 0 2 Q24 2 24 -26Z" fill="#3A2E7A" stroke="' + OUT + '" stroke-width="2.2"/><path d="M-24 -26 Q-24 2 0 2 Q24 2 24 -26Z" fill="url(#cyl)"/>' +
      '<ellipse cx="0" cy="-26" rx="26" ry="9" fill="#4B3D95" stroke="' + OUT + '" stroke-width="2.2"/><ellipse cx="0" cy="-26" rx="20" ry="6" fill="#7CE3A4"/>' +
      '<circle cx="-6" cy="-40" r="6" fill="#A8F5C4" stroke="' + OUT + '" stroke-width="2"/><circle cx="8" cy="-52" r="4.5" fill="#A8F5C4" stroke="' + OUT + '" stroke-width="2"/><circle cx="0" cy="-64" r="3" fill="#A8F5C4" stroke="' + OUT + '" stroke-width="1.6"/>' +
      '<path d="M-12 4 l5 -12 l5 12Z M4 4 l5 -14 l5 14Z" fill="' + ORA + '" stroke="' + OUT + '" stroke-width="1.6" stroke-linejoin="round"/></g>';
    return s;
  }
  function crystalCol(x, z, w, h, col) {
    var X1 = x + w, Z1 = z + w, tip = P(x + w / 2, h + w * 1.1, z + w / 2);
    return box(x, 0, z, w, h, w, col, { noTop: true }) +
      face([P(x, h, Z1), P(X1, h, Z1), tip], lit(col, 0.15), 'shL') + face([P(X1, h, z), P(X1, h, Z1), tip], dk(col, 0.12), 'shR') +
      '<path d="M' + P(x + 3, h - 6, Z1)[0] + ' ' + P(x + 3, h - 6, Z1)[1] + 'L' + P(x + 3, h * 0.35, Z1)[0] + ' ' + P(x + 3, h * 0.35, Z1)[1] + '" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>';
  }
  function crystals() {
    var e = ell(0, 0, 10, 58);
    return shadow(90, 28) + '<ellipse cx="' + e.x + '" cy="' + e.y + '" rx="' + e.rx + '" ry="' + e.ry + '" fill="#8FD9F2" stroke="' + OUT + '" stroke-width="2.2"/>' +
      '<ellipse cx="' + (e.x - 12) + '" cy="' + (e.y - 4) + '" rx="' + (e.rx * 0.5) + '" ry="' + (e.ry * 0.3) + '" fill="#fff" opacity=".55"/>' +
      crystalCol(-26, -30, 22, 74, '#C9B8FF') + crystalCol(-6, -26, 26, 110, '#8FE6FF') + crystalCol(20, -20, 20, 70, '#FFA8DA') +
      crystalCol(-30, 4, 18, 44, '#8FE6FF') + crystalCol(8, 12, 16, 38, '#FFE08A') +
      spark(-60, -100, 7) + spark(52, -116, 8, YEL) + spark(70, -40, 5);
  }
  function tent() {
    var s = shadow(96, 30) + cylinder(0, 0, 46, 0, 40, CREAM, { noTop: true });
    s += door([P(30, 0, 34), P(40, 0, 24), P(36, 34, 22), P(30, 34, 28)].map(function (p) { return p; }));
    s += stripedCone(0, 0, 60, 36, 74, PINK, '#FFFFFF', 12);
    var A = P(0, 110, 0);
    s += '<path d="M' + A[0] + ' ' + A[1] + 'V' + (A[1] - 26) + '" stroke="' + OUT + '" stroke-width="3"/><path d="M' + A[0] + ' ' + (A[1] - 26) + 'l26 7l-26 8Z" fill="' + YEL + '" stroke="' + OUT + '" stroke-width="2" stroke-linejoin="round"/>';
    var e = P(76, 0, 40);
    s += '<g transform="translate(' + e[0] + ' ' + e[1] + ')">' + cobot() + '</g>';
    var pl = P(-62, 0, 44);
    s += '<g transform="translate(' + pl[0] + ' ' + pl[1] + ')"><ellipse cx="0" cy="0" rx="20" ry="10" fill="#F2D3A0" stroke="' + OUT + '" stroke-width="2.2"/><circle cx="-8" cy="-2" r="3.4" fill="' + PINK + '"/><circle cx="2" cy="-4" r="3.4" fill="#36CFC0"/><circle cx="10" cy="0" r="3.4" fill="' + YEL + '"/></g>';
    return s;
  }
  function cobot() {
    var seg = function (d, w) { return '<path d="' + d + '" stroke="' + OUT + '" stroke-width="' + (w + 4.5) + '" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="#F4F2FB" stroke-width="' + w + '" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="#fff" stroke-width="' + (w * 0.3) + '" stroke-linecap="round" fill="none" opacity=".9" transform="translate(-' + (w * 0.22) + ' -' + (w * 0.22) + ')"/>'; };
    var joint = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#F4F2FB" stroke="' + OUT + '" stroke-width="2.2"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.62) + '" fill="none" stroke="#FF6B3D" stroke-width="' + (r * 0.42) + '"/>'; };
    return '<ellipse cx="2" cy="2" rx="22" ry="8" fill="#1B0F5C" opacity=".22"/>' +
      '<ellipse cx="0" cy="0" rx="17" ry="7" fill="#3A2E7A" stroke="' + OUT + '" stroke-width="2.2"/>' +
      '<rect x="-10" y="-16" width="20" height="16" rx="4" fill="#E2DEF2" stroke="' + OUT + '" stroke-width="2.2"/>' +
      seg('M0 -16 L-8 -52', 11) + seg('M-8 -52 L22 -70', 10) + seg('M22 -70 L30 -48', 8) +
      joint(0, -16, 7) + joint(-8, -52, 7.5) + joint(22, -70, 6.5) + joint(30, -48, 5) +
      '<path d="M26 -44 v8 M34 -44 v8" stroke="' + OUT + '" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="31" cy="-28" rx="11" ry="4" fill="#fff" stroke="' + OUT + '" stroke-width="2"/><path d="M22 -30 Q31 -40 40 -30" fill="#FFB36B" stroke="' + OUT + '" stroke-width="2"/>' +
      '<rect x="26" y="-38" width="6" height="6" fill="#2E2080"/><rect x="27.5" y="-36.5" width="1.5" height="1.5" fill="#fff"/><rect x="29.8" y="-34.8" width="1.5" height="1.5" fill="#fff"/>';
  }
  function observatory() {
    var s = shadow(72, 24) + cylinder(0, 0, 36, 0, 104, '#CFC3F8', { noTop: true });
    s += '<path d="M' + P(-22, 30, 30).join(' ') + 'l14 -2 M' + P(16, 64, 34).join(' ') + 'l12 -4 M' + P(-6, 84, 36).join(' ') + 'l12 -2" stroke="#A797E6" stroke-width="4" stroke-linecap="round"/>';
    s += win(onZ(35, arch(-8, 54, 16, 22))) + door(onZ(35, arch(-10, 0, 20, 28)));
    s += cylinder(0, 0, 42, 104, 114, '#5843D6');
    var t = P(16, 150, 14);
    s += '<g transform="translate(' + t[0] + ' ' + t[1] + ') rotate(-34)"><rect x="0" y="-9" width="74" height="18" rx="5" fill="' + YEL + '" stroke="' + OUT + '" stroke-width="2.2"/><rect x="64" y="-13" width="14" height="26" rx="4" fill="' + ORA + '" stroke="' + OUT + '" stroke-width="2.2"/></g>';
    s += dome(0, 0, 38, 114, LAV);
    s += face([P(-6, 116, 34), P(6, 116, 34), P(6, 146, 18), P(-6, 146, 18)], '#4B37B8');
    s += spark(-58, -150, 8, YEL) + spark(64, -96, 6);
    return s;
  }
  function owlTower() {
    var s = shadow(56, 18) + cylinder(0, 0, 24, 0, 140, CREAM, { noTop: true });
    s += win(onZ(23, arch(-8, 84, 16, 22))) + door(onZ(23, arch(-9, 0, 18, 26)));
    s += cone(0, 0, 34, 136, 60, PURP);
    var o = P(0, 206, 0);
    s += '<g transform="translate(' + o[0] + ' ' + o[1] + ')"><path d="M-12 -14 L-8 -24 L-3 -15 M12 -14 L8 -24 L3 -15" fill="#8E6BC9" stroke="' + OUT + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<ellipse cx="0" cy="0" rx="15" ry="17" fill="#8E6BC9" stroke="' + OUT + '" stroke-width="2.4"/><ellipse cx="0" cy="6" rx="8" ry="9" fill="#DAD3FF"/>' +
      '<circle cx="-6" cy="-5" r="5.5" fill="#fff" stroke="' + OUT + '" stroke-width="2"/><circle cx="6" cy="-5" r="5.5" fill="#fff" stroke="' + OUT + '" stroke-width="2"/>' +
      '<circle cx="-5" cy="-5" r="2.4" fill="' + OUT + '"/><circle cx="5" cy="-5" r="2.4" fill="' + OUT + '"/><path d="M-3 1 L0 6 L3 1Z" fill="' + ORA + '"/></g>';
    [[44, -170, -14], [62, -132, 10], [-46, -150, 8]].forEach(function (l) {
      s += '<g transform="translate(' + l[0] + ' ' + l[1] + ') rotate(' + l[2] + ')"><rect x="-11" y="-7" width="22" height="15" rx="2" fill="#fff" stroke="' + OUT + '" stroke-width="2"/><path d="M-11 -7 L0 2 L11 -7" fill="none" stroke="' + OUT + '" stroke-width="2"/></g>';
    });
    return s;
  }
  function flag(x, y, z, col) {
    var p = P(x, y, z);
    return '<path d="M' + p[0] + ' ' + p[1] + 'v-30" stroke="' + OUT + '" stroke-width="3"/><path d="M' + p[0] + ' ' + (p[1] - 30) + 'l30 7l-30 8Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="2" stroke-linejoin="round"/>';
  }
  function castle() {
    var s = '<ellipse cx="0" cy="-120" rx="190" ry="170" fill="url(#castleGlow)"/>';
    var isl = ell(0, 0, 0, 132);
    s += '<ellipse cx="' + isl.x + '" cy="' + (isl.y + 10) + '" rx="' + isl.rx + '" ry="' + (isl.ry + 4) + '" fill="#8C6B4A" stroke="' + OUT + '" stroke-width="2.2"/>' +
      '<ellipse cx="' + isl.x + '" cy="' + isl.y + '" rx="' + isl.rx + '" ry="' + isl.ry + '" fill="#BFE6A6" stroke="' + OUT + '" stroke-width="2.2"/>' + shadow(150, 46, 20);
    var TW = '#EDE4FF';
    // tháp sau
    s += cylinder(-62, -62, 22, 0, 100, TW) + cone(-62, -62, 28, 100, 62, PURP) + flag(-62, 166, -62, YEL);
    s += cylinder(62, -62, 22, 0, 100, TW) + cone(62, -62, 28, 100, 62, PURP);
    // thân lâu đài
    s += box(-56, 0, -56, 112, 104, 112, CREAM);
    for (var i = 0; i < 6; i++) { s += box(-56 + i * 20, 104, 44, 12, 12, 12, CREAM); }
    for (var j = 0; j < 5; j++) { s += box(44, 104, -56 + j * 20, 12, 12, 12, CREAM); }
    // tháp giữa
    s += cylinder(0, 0, 30, 104, 176, TW) + cone(0, 0, 40, 176, 92, PURP) + flag(0, 270, 0, PINK);
    s += win(onZ(26, arch(-8, 130, 16, 24)));
    // cổng, cửa sổ
    s += door(onZ(56, arch(-20, 0, 40, 56)));
    s += '<g stroke="' + OUT + '" stroke-width="2" opacity=".55">' + [-12, 0, 12].map(function (u) { var a = P(u, 2, 56), b = P(u, u === 0 ? 52 : 44, 56); return '<path d="M' + a.join(' ') + 'L' + b.join(' ') + '"/>'; }).join('') + '</g>';
    s += win(onZ(56, arch(-46, 52, 14, 22))) + win(onZ(56, arch(32, 52, 14, 22))) + win(onX(56, arch(-30, 52, 14, 22))) + win(onX(56, arch(10, 52, 14, 22)));
    // tháp trước
    s += cylinder(-62, 62, 24, 0, 112, TW) + cone(-62, 62, 30, 112, 66, PURP) + flag(-62, 180, 62, YEL);
    s += cylinder(62, 62, 24, 0, 112, TW) + cone(62, 62, 30, 112, 66, PURP) + flag(62, 180, 62, YEL);
    s += cylinder(62, -62, 0.01, 0, 0, TW, { noTop: true });
    s += win(onZ(84, arch(-70, 60, 14, 22))) + win(onX(84, arch(56, 60, 14, 22)));
    s += spark(-170, -230, 10, YEL) + spark(170, -250, 9) + spark(-80, -320, 7) + spark(100, -340, 7, YEL);
    return s;
  }

  /* ---------- cây, đá, hoa ---------- */
  function tree(x, y, s, col) {
    var d = dk(col, 0.25), l = lit(col, 0.3);
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + shadow(26, 8, 8) +
      '<path d="M-5 0 L-4 -26 L4 -26 L5 0Z" fill="#A86E45" stroke="' + OUT + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<g fill="' + OUT + '"><circle cx="-14" cy="-34" r="18"/><circle cx="14" cy="-34" r="18"/><circle cx="0" cy="-52" r="21"/></g>' +
      '<g fill="' + d + '"><circle cx="-14" cy="-34" r="16"/><circle cx="14" cy="-34" r="16"/><circle cx="0" cy="-52" r="19"/></g>' +
      '<g fill="' + col + '"><circle cx="-16" cy="-37" r="12"/><circle cx="11" cy="-38" r="11"/><circle cx="-3" cy="-55" r="15"/></g>' +
      '<circle cx="-8" cy="-60" r="6" fill="' + l + '"/><circle cx="-19" cy="-40" r="3.5" fill="' + l + '"/></g>';
  }
  function pine(x, y, s, col) {
    var d = dk(col, 0.22);
    var tier = function (ty, w, h) { return '<path d="M0 ' + (ty - h) + ' L' + w + ' ' + ty + ' Q0 ' + (ty + 7) + ' -' + w + ' ' + ty + 'Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M0 ' + (ty - h) + ' L' + w + ' ' + ty + ' Q' + (w * 0.4) + ' ' + (ty + 5) + ' 0 ' + (ty + 4) + 'Z" fill="' + d + '"/>'; };
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + shadow(20, 6, 6) + '<rect x="-4" y="-12" width="8" height="12" fill="#A86E45" stroke="' + OUT + '" stroke-width="2"/>' +
      tier(-10, 22, 30) + tier(-30, 17, 26) + tier(-48, 12, 22) + '</g>';
  }
  function spire(x, y, s, col) {
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + shadow(40, 12, 10);
    g += '<path d="M-34 0 C-30 -40 -22 -80 -10 -130 C-6 -150 6 -150 10 -128 C18 -90 26 -50 34 0Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="2.4" stroke-linejoin="round"/>';
    g += '<path d="M2 -140 C10 -100 16 -50 22 0 L34 0 C26 -50 18 -90 10 -128 C8 -136 6 -142 2 -140Z" fill="' + dk(col, 0.22) + '"/>';
    g += '<path d="M-20 -40 C-16 -60 -12 -80 -6 -110" stroke="' + lit(col, 0.45) + '" stroke-width="5" stroke-linecap="round" fill="none"/>';
    g += '<path d="M-26 -30 Q-10 -40 6 -34 M-18 -76 Q-4 -84 12 -80" stroke="' + dk(col, 0.25) + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    g += '<path d="M-30 -12 Q-14 -24 2 -16 Q12 -12 20 -22" stroke="' + OUT + '" stroke-width="0" fill="none"/>';
    g += '<g fill="#57D2B6" stroke="' + OUT + '" stroke-width="2"><ellipse cx="-22" cy="-62" rx="12" ry="6"/><ellipse cx="14" cy="-100" rx="10" ry="5"/><ellipse cx="-4" cy="-8" rx="16" ry="6"/></g>';
    return g + '</g>';
  }
  function flower(x, y, r, col) {
    var c = col || '#FFD3EC', s = '<g transform="translate(' + x + ' ' + y + ')">';
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      s += '<ellipse cx="' + (Math.cos(a) * r * 0.62).toFixed(1) + '" cy="' + (Math.sin(a) * r * 0.62).toFixed(1) + '" rx="' + (r * 0.5).toFixed(1) + '" ry="' + (r * 0.62).toFixed(1) + '" transform="rotate(' + (a * 180 / Math.PI + 90).toFixed(0) + ' ' + (Math.cos(a) * r * 0.62).toFixed(1) + ' ' + (Math.sin(a) * r * 0.62).toFixed(1) + ')" fill="' + c + '" stroke="' + OUT + '" stroke-width="2"/>';
    }
    s += '<circle r="' + (r * 0.32) + '" fill="#FFE27A" stroke="' + OUT + '" stroke-width="1.6"/><circle r="' + (r * 0.75) + '" fill="url(#petalHi)"/></g>';
    return s;
  }
  function leaf(x, y, r, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><path d="M0 0 Q' + r * 0.5 + ' -' + r * 0.45 + ' ' + r + ' 0 Q' + r * 0.5 + ' ' + r * 0.45 + ' 0 0Z" fill="#4FC9A8" stroke="' + OUT + '" stroke-width="2"/><path d="M2 0 H' + (r - 4) + '" stroke="#2E9C82" stroke-width="1.6"/></g>';
  }
  function branch(d, flowers, leaves) {
    var s = '<path d="' + d + '" fill="none" stroke="' + OUT + '" stroke-width="20" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#5B3FA8" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#7E62D0" stroke-width="4" stroke-linecap="round" transform="translate(-3 -3)" opacity=".8"/>';
    leaves.forEach(function (l) { s += leaf(l[0], l[1], l[2], l[3]); });
    flowers.forEach(function (f) { s += flower(f[0], f[1], f[2], f[3]); });
    return s;
  }
  function mushroom(x, y, s, col) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse cx="0" cy="-2" rx="34" ry="22" fill="url(#mushGlow)"/>' +
      '<path d="M-7 0 Q-9 -18 -5 -26 H5 Q9 -18 7 0Z" fill="#FFF4E0" stroke="' + OUT + '" stroke-width="2.2"/>' +
      '<path d="M-24 -24 Q-22 -48 0 -50 Q22 -48 24 -24 Q0 -18 -24 -24Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="2.2"/>' +
      '<circle cx="-9" cy="-36" r="4" fill="#fff" opacity=".9"/><circle cx="8" cy="-40" r="3" fill="#fff" opacity=".9"/><circle cx="12" cy="-30" r="2.4" fill="#fff" opacity=".9"/></g>';
  }

  /* ---------- dữ liệu ---------- */
  var LOC = [
    { id: 'home', n: 1, name: 'Làng Khởi Đầu', cat: 'Về mình', x: 330, y: 830, draw: cottage, top: 112, sc: 1 },
    { id: 'library', n: 2, name: 'Thư Viện Cổ', cat: 'Học vấn', x: 470, y: 612, draw: library, top: 150, sc: 1 },
    { id: 'alchemy', n: 3, name: 'Xưởng Giả Kim', cat: 'Kinh nghiệm', x: 330, y: 380, draw: alchemy, top: 150, sc: 1 },
    { id: 'crystal', n: 4, name: 'Vườn Pha Lê', cat: 'Dự án .NET', x: 600, y: 330, draw: crystals, top: 150, sc: 1 },
    { id: 'tent', n: 5, name: 'Lều Người Máy', cat: 'Đồ án tốt nghiệp', x: 1010, y: 340, draw: tent, top: 148, sc: 1 },
    { id: 'observatory', n: 6, name: 'Đài Thiên Văn', cat: 'Kỹ năng', x: 1270, y: 470, draw: observatory, top: 168, sc: 1 },
    { id: 'owl', n: 7, name: 'Tháp Cú Thư', cat: 'Liên hệ', x: 1210, y: 812, draw: owlTower, top: 236, sc: 1 },
    { id: 'castle', n: 8, name: 'Lâu Đài Tốt Nghiệp', cat: 'Thư mời 07.11', x: 800, y: 660, draw: castle, top: 300, sc: 0.95 }
  ];
  var PATH = [[330, 872], [400, 770], [474, 650], [392, 520], [330, 414], [460, 382], [570, 372], [650, 300], [726, 250], [860, 254], [944, 366], [1010, 382],
    [1150, 430], [1268, 504], [1340, 640], [1214, 852], [1090, 812], [1036, 712], [988, 700], [920, 690]];
  var VISITED_UPTO = 7;
  function catmullPts(pts, step) {
    var out = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (var t = 0; t < 1; t += 0.02) {
        var t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(function (k) { return 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3); }).concat([i]));
      }
    }
    var res = [out[0]], acc = 0;
    for (var j = 1; j < out.length; j++) { acc += Math.hypot(out[j][0] - out[j - 1][0], out[j][1] - out[j - 1][1]); if (acc >= step) { res.push(out[j]); acc = 0; } }
    return res;
  }

  function defs() {
    return '<defs>' +
      '<linearGradient id="shL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2E2080" stop-opacity=".1"/></linearGradient>' +
      '<linearGradient id="shR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#2E2080" stop-opacity=".16"/></linearGradient>' +
      '<linearGradient id="cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".22" stop-color="#fff" stop-opacity=".34"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2E2080" stop-opacity=".3"/></linearGradient>' +
      '<radialGradient id="domeHi" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2E2080" stop-opacity=".25"/></radialGradient>' +
      '<linearGradient id="glowFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".9"/><stop offset="1" stop-color="#FFB020" stop-opacity=".3"/></linearGradient>' +
      '<radialGradient id="castleGlow"><stop offset="0" stop-color="#FFE38A" stop-opacity=".7"/><stop offset=".6" stop-color="#FFD25A" stop-opacity=".15"/><stop offset="1" stop-color="#FFD25A" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hoverGlow"><stop offset="0" stop-color="#FFE38A" stop-opacity=".95"/><stop offset="1" stop-color="#FFE38A" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="mushGlow"><stop offset="0" stop-color="#9FF3FF" stop-opacity=".75"/><stop offset="1" stop-color="#9FF3FF" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="petalHi" cx=".4" cy=".35" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7EACB"/><stop offset=".55" stop-color="#F1E1B6"/><stop offset="1" stop-color="#E9D4A0"/></linearGradient>' +
      '<radialGradient id="vign" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#140A45" stop-opacity="0"/><stop offset="1" stop-color="#140A45" stop-opacity=".55"/></radialGradient>' +
      '<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<filter id="fogBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>' +
      '<filter id="sheetSh" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="4" dy="10" stdDeviation="8" flood-color="#120848" flood-opacity=".5"/></filter>' +
      '<filter id="goldEdge" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/><feFlood flood-color="#FFD54A"/><feComposite in2="d" operator="in" result="o"/><feGaussianBlur in="o" stdDeviation="3" result="ob"/><feMerge><feMergeNode in="ob"/><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>';
  }
  function desk() {
    var s = '<rect width="1600" height="1000" fill="#3A2A7E"/>';
    for (var i = 0; i < 9; i++) {
      var y = i * 118 - 20;
      s += '<rect x="-10" y="' + y + '" width="1620" height="114" fill="' + (i % 2 ? '#43318C' : '#3D2C84') + '"/>';
      s += '<path d="M0 ' + (y + 30) + ' C300 ' + (y + 20) + ' 600 ' + (y + 44) + ' 900 ' + (y + 30) + ' S1400 ' + (y + 22) + ' 1600 ' + (y + 36) + '" stroke="#5A45A8" stroke-width="2" fill="none" opacity=".6"/>' +
        '<path d="M0 ' + (y + 74) + ' C400 ' + (y + 84) + ' 800 ' + (y + 64) + ' 1200 ' + (y + 78) + ' S1500 ' + (y + 86) + ' 1600 ' + (y + 72) + '" stroke="#30226E" stroke-width="2" fill="none" opacity=".7"/>' +
        '<rect x="-10" y="' + (y + 112) + '" width="1620" height="4" fill="#24185E"/>';
    }
    return s;
  }
  function sheet(x, y, w, h, rot, content) {
    return '<g transform="rotate(' + rot + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"><g filter="url(#sheetSh)"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="url(#paper)" stroke="#CDB67E" stroke-width="2"/></g>' + (content || '') + '</g>';
  }
  function roads(list) {
    var a = '', b = '';
    list.forEach(function (d) { a += '<path d="' + d[0] + '" stroke-width="' + (d[1] + 6) + '"/>'; b += '<path d="' + d[0] + '" stroke-width="' + d[1] + '"/>'; });
    return '<g fill="none" stroke="#DCC690" stroke-linecap="round" stroke-linejoin="round">' + a + '</g><g fill="none" stroke="#FBF2D9" stroke-linecap="round" stroke-linejoin="round">' + b + '</g>';
  }
  function blocks(list) { return list.map(function (b) { return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="5" fill="#E6D3A0" opacity=".85"/>'; }).join(''); }

  var mctx = document.createElement('canvas').getContext('2d');
  function plaque(L, state, ax, ay) {
    mctx.font = '800 20px "Baloo 2"'; var tw = mctx.measureText(L.name).width, w = tw + 50, h = 38;
    mctx.font = '800 12.5px Nunito'; var cw = mctx.measureText(L.cat).width + 24;
    var fill = state === 'cur' || state === 'hov' ? '#FFE7A0' : '#FFF4DC';
    var g = '<g transform="translate(' + ax + ' ' + ay + ')"' + (state === 'fog' ? ' opacity=".62"' : '') + '>';
    if (state === 'cur' || state === 'hov') g += '<rect x="' + (-w / 2 - 8) + '" y="' + (-h - 22) + '" width="' + (w + 16) + '" height="' + (h + 16) + '" rx="20" fill="#FFC93C" opacity=".5" filter="url(#soft)"/>';
    g += '<path d="M-2 -6 V0 M2 -6 V0" stroke="' + OUT + '" stroke-width="3"/>' +
      '<rect x="' + (-w / 2) + '" y="' + (-h - 10) + '" width="' + w + '" height="' + h + '" rx="13" fill="' + OUT + '"/>' +
      '<rect x="' + (-w / 2) + '" y="' + (-h - 14) + '" width="' + w + '" height="' + h + '" rx="13" fill="' + fill + '" stroke="' + OUT + '" stroke-width="3.2"/>' +
      '<path d="M' + (-w / 2 + 6) + ' ' + (-h - 9) + ' H' + (w / 2 - 6) + '" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>' +
      '<text x="5" y="' + (-h / 2 - 7.5) + '" text-anchor="middle" font-family="\'Baloo 2\',Nunito,ui-rounded,system-ui,sans-serif" font-weight="800" font-size="20" fill="' + OUT + '">' + L.name + '</text>' +
      '<circle cx="' + (-w / 2 + 2) + '" cy="' + (-h / 2 - 14) + '" r="15" fill="' + (state === 'fog' ? '#DAD3FF' : '#FFC93C') + '" stroke="' + OUT + '" stroke-width="3"/>' +
      '<text x="' + (-w / 2 + 2) + '" y="' + (-h / 2 - 8) + '" text-anchor="middle" font-family="\'Baloo 2\',Nunito,ui-rounded,system-ui,sans-serif" font-weight="800" font-size="17" fill="' + OUT + '">' + L.n + '</text>' +
      '<rect x="' + (-cw / 2) + '" y="' + (-18) + '" width="' + cw + '" height="22" rx="11" fill="#6E56F0" stroke="' + OUT + '" stroke-width="2.6"/>' +
      '<text x="0" y="-3" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="800" font-size="12.5" fill="#fff">' + L.cat + '</text>';
    if (state === 'done') g += spark(w / 2 - 4, -h - 12, 11, '#FFC93C');
    return g + '</g>';
  }

  function scene(opt) {
    opt = opt || {};
    var s = defs() + desk();
    // các tấm bản đồ phụ
    s += sheet(1080, 40, 520, 340, 6, roads([['M1100 140 Q1250 110 1380 170 T1590 150', 16], ['M1130 280 Q1260 240 1400 300', 14], ['M1300 60 Q1320 200 1280 360', 12]]) + blocks([[1150, 180, 60, 40], [1420, 210, 70, 50], [1200, 300, 50, 30]]));
    s += sheet(20, 620, 480, 360, -8, roads([['M40 700 Q200 660 320 740 T500 720', 16], ['M80 860 Q220 820 380 880', 14]]) + blocks([[120, 760, 60, 40], [300, 800, 70, 40]]));
    s += sheet(40, 40, 380, 260, -5, roads([['M60 120 Q180 90 300 140 T420 120', 14], ['M120 260 Q200 180 280 220', 12]]));
    s += sheet(1180, 640, 420, 340, 5, roads([['M1200 720 Q1320 690 1420 740 T1600 720', 14], ['M1240 880 Q1340 840 1480 900', 12]]));
    // bản đồ chính
    var g = '<g transform="rotate(-1.2 800 500)"><g filter="url(#sheetSh)"><rect x="166" y="108" width="1268" height="788" rx="8" fill="url(#paper)" stroke="#CDB67E" stroke-width="2.5"/></g>';
    g += '<rect x="184" y="126" width="1232" height="752" rx="6" fill="none" stroke="#D2BB82" stroke-width="2.5" stroke-dasharray="12 9"/>';
    g += roads([['M170 300 Q320 260 430 300 T640 260', 18], ['M170 560 Q300 520 380 560 T560 600', 16], ['M560 180 Q600 300 560 420 T620 700 T560 900', 14],
      ['M900 120 Q960 260 1080 300 T1420 260', 16], ['M1000 520 Q1120 480 1220 560 T1430 600', 18], ['M1060 700 Q1100 800 1040 900', 14], ['M200 720 Q300 700 360 760', 12], ['M1140 140 Q1180 220 1260 240', 10]]);
    g += blocks([[200, 180, 70, 44], [420, 200, 54, 36], [250, 470, 60, 40], [640, 140, 46, 30], [1120, 170, 70, 40], [1300, 300, 60, 46], [1350, 720, 54, 40], [430, 820, 70, 40], [980, 560, 50, 34], [700, 820, 46, 30]]);
    var river = 'M720 108 C690 200 760 250 735 330 S780 470 790 580', river2 = 'M870 770 C890 820 840 850 880 896';
    g += '<g fill="none" stroke-linecap="round"><path d="' + river + '" stroke="#5FA9D6" stroke-width="40"/><path d="' + river2 + '" stroke="#5FA9D6" stroke-width="40"/></g>' +
      '<ellipse cx="800" cy="684" rx="236" ry="120" fill="#5FA9D6"/><ellipse cx="800" cy="680" rx="230" ry="114" fill="#9ED6F2"/>' +
      '<g fill="none" stroke-linecap="round"><path d="' + river + '" stroke="#9ED6F2" stroke-width="32"/><path d="' + river2 + '" stroke="#9ED6F2" stroke-width="32"/>' +
      '<path d="M712 150 C700 200 742 240 730 300 M620 640 Q660 620 700 626 M900 770 Q950 760 980 740" stroke="#fff" stroke-width="4" opacity=".8"/></g>';
    // la bàn
    g += '<g transform="translate(1366 818)"><circle r="42" fill="#FFF4DC" stroke="#CDB67E" stroke-width="3"/><circle r="32" fill="none" stroke="#D9C08A" stroke-width="2" stroke-dasharray="4 5"/>' +
      '<polygon points="0,-36 7,-7 36,0 7,7 0,36 -7,7 -36,0 -7,-7" fill="#B3A4FA" stroke="' + OUT + '" stroke-width="2.2"/><polygon points="0,-36 7,-7 0,0 -7,-7" fill="#FF8FCB"/>' +
      '<text y="-48" text-anchor="middle" font-family="\'Baloo 2\',Nunito,ui-rounded,system-ui,sans-serif" font-weight="800" font-size="16" fill="' + OUT + '">B</text></g>';
    // đường đá
    var stones = catmullPts(PATH, 25);
    stones.forEach(function (p, i) {
      var vis = p[2] < VISITED_UPTO;
      g += '<ellipse cx="' + (p[0] + 1.5).toFixed(1) + '" cy="' + (p[1] + 3).toFixed(1) + '" rx="8.5" ry="6" fill="#8C7A50" opacity=".45"/>' +
        '<ellipse cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" rx="8.5" ry="6.2" fill="' + (vis ? '#FFD866' : '#FFFDF5') + '" stroke="' + (vis ? '#C99A2E' : '#B9A87A') + '" stroke-width="2.2"/>' +
        '<ellipse cx="' + (p[0] - 2).toFixed(1) + '" cy="' + (p[1] - 2).toFixed(1) + '" rx="3.5" ry="2" fill="#fff" opacity=".8"/>';
    });
    // cầu (góc nghiêng)
    [[730, 252, -8], [986, 696, 8]].forEach(function (b) {
      g += '<g transform="translate(' + b[0] + ' ' + b[1] + ') rotate(' + b[2] + ')">' +
        '<rect x="-44" y="-12" width="88" height="24" rx="4" fill="#B57A45" stroke="' + OUT + '" stroke-width="2.2"/><rect x="-44" y="10" width="88" height="7" rx="3" fill="#8A5A3C" stroke="' + OUT + '" stroke-width="2.2"/>' +
        [-30, -15, 0, 15, 30].map(function (x) { return '<path d="M' + x + ' -12 V12" stroke="#8A5A3C" stroke-width="2"/>'; }).join('') +
        '<path d="M-44 -14 H44 M-44 -26 H44" stroke="' + OUT + '" stroke-width="5" stroke-linecap="round"/><path d="M-44 -14 H44 M-44 -26 H44" stroke="#C98B4A" stroke-width="2.6" stroke-linecap="round"/>' +
        [-40, 0, 40].map(function (x) { return '<rect x="' + (x - 3) + '" y="-30" width="6" height="20" fill="#C98B4A" stroke="' + OUT + '" stroke-width="2"/>'; }).join('') + '</g>';
    });
    // vật thể đứng (sắp theo chiều sâu)
    var items = [];
    LOC.forEach(function (L) {
      var hov = opt.hover === L.id;
      var body = '';
      if (hov) body += '<ellipse cx="0" cy="0" rx="150" ry="58" fill="url(#hoverGlow)"/><ellipse cx="0" cy="2" rx="124" ry="40" fill="none" stroke="#FFC93C" stroke-width="5" stroke-dasharray="14 10"/>';
      body += '<g' + (hov ? ' filter="url(#goldEdge)" transform="scale(1.08)"' : '') + '>' + L.draw() + '</g>';
      items.push({ y: L.y, svg: '<g transform="translate(' + L.x + ' ' + L.y + ') scale(' + L.sc + ')">' + body + '</g>' });
    });
    [[214, 330, 0.9, '#B9ABEE'], [190, 250, 0.7, '#A898E8'], [1150, 236, 0.85, '#B9ABEE'], [1218, 250, 0.65, '#A898E8'], [1400, 540, 0.75, '#B9ABEE']].forEach(function (m) {
      items.push({ y: m[1], svg: spire(m[0], m[1], m[2], m[3]) });
    });
    [[206, 650, 't', '#57D2B6', 1], [244, 700, 'p', '#9C7CF0', 1], [200, 760, 't', '#B28CFF', 0.85], [560, 810, 't', '#57D2B6', 0.95], [612, 846, 'p', '#9C7CF0', 0.9],
      [516, 862, 't', '#F7A8D8', 0.8], [664, 470, 'p', '#57D2B6', 0.9], [626, 530, 't', '#B28CFF', 0.85], [1000, 520, 't', '#57D2B6', 0.9], [1044, 560, 'p', '#9C7CF0', 0.85],
      [1090, 760, 't', '#F7A8D8', 0.9], [1392, 700, 't', '#57D2B6', 0.9], [1404, 770, 'p', '#B28CFF', 0.85], [860, 176, 't', '#57D2B6', 0.75], [896, 182, 'p', '#9C7CF0', 0.75],
      [470, 210, 't', '#F7A8D8', 0.75], [1110, 580, 'p', '#57D2B6', 0.75], [534, 476, 'p', '#57D2B6', 0.7], [1170, 690, 't', '#B28CFF', 0.7], [370, 520, 't', '#F7A8D8', 0.6]].forEach(function (t) {
      items.push({ y: t[1], svg: t[2] === 't' ? tree(t[0], t[1], t[4], t[3]) : pine(t[0], t[1], t[4], t[3]) });
    });
    items.sort(function (a, b) { return a.y - b.y; }).forEach(function (it) { g += it.svg; });
    // sương mờ
    (opt.fog || []).forEach(function (id) {
      var L = LOC.filter(function (q) { return q.id === id; })[0];
      g += '<g filter="url(#fogBlur)" opacity=".55">' + [[-70, -40, 46], [-10, -70, 56], [60, -40, 48], [10, -10, 50], [-60, 0, 34], [70, 6, 34]].map(function (c) { return '<circle cx="' + (L.x + c[0]) + '" cy="' + (L.y + c[1]) + '" r="' + c[2] + '" fill="#F5F1FF"/>'; }).join('') + '</g>';
    });
    // biển tên
    LOC.forEach(function (L) { g += plaque(L, (opt.states && opt.states[L.id]) || '', L.x, L.y - L.top * L.sc * (opt.hover === L.id ? 1.08 : 1)); });
    // mèo
    if (opt.cat) {
      var c = opt.cat;
      g += '<ellipse cx="' + (c.x + 4) + '" cy="' + (c.y + 2) + '" rx="26" ry="8" fill="#1B0F5C" opacity=".3" filter="url(#soft)"/><use href="#cat" x="' + (c.x - 34) + '" y="' + (c.y - 68) + '" width="68" height="72"/>';
      if (c.say) {
        mctx.font = '800 15px Nunito'; var bw = mctx.measureText(c.say).width + 26;
        g += '<g transform="translate(' + c.x + ' ' + (c.y - 88) + ')"><rect x="' + (-bw / 2) + '" y="-17" width="' + bw + '" height="32" rx="16" fill="#fff" stroke="' + OUT + '" stroke-width="3"/>' +
          '<path d="M-7 14 L0 24 L7 14" fill="#fff" stroke="' + OUT + '" stroke-width="3" stroke-linejoin="round"/><rect x="-6" y="11" width="12" height="5" fill="#fff"/>' +
          '<text y="5" text-anchor="middle" font-family="Nunito,ui-rounded,system-ui,sans-serif" font-weight="800" font-size="15" fill="' + OUT + '">' + c.say + '</text></g>';
      }
    }
    if (opt.pointer) g += '<g transform="translate(' + opt.pointer[0] + ' ' + opt.pointer[1] + ') rotate(-12)"><path d="M0 0 L0 34 L9 26 L16 42 L23 39 L16 23 L28 23 Z" fill="#fff" stroke="' + OUT + '" stroke-width="3.2" stroke-linejoin="round"/></g>';
    g += '</g>';
    s += g;
    // tiền cảnh: cành hoa, trụ đá, nấm
    s += branch('M-20 26 C50 36 100 64 150 84 S206 112 234 104', [[58, 44, 20], [116, 74, 24], [168, 92, 18, '#FFE6F4'], [222, 100, 17], [22, 22, 18, '#FFE6F4'], [92, 112, 15]],
      [[70, 64, 30, 40], [140, 60, 28, -30], [196, 112, 28, 60], [20, 52, 28, 70], [110, 100, 24, 110]]);
    s += spire(70, 1010, 1.25, '#9D8BE6') + spire(150, 1020, 0.9, '#B9ABEE') + spire(20, 900, 0.8, '#A898E8');
    s += mushroom(1440, 990, 1.3, '#FF8FCB') + mushroom(1520, 1000, 1.0, '#B28CFF') + mushroom(1380, 1010, 0.8, '#57D2B6');
    s += branch('M1630 980 C1560 930 1520 870 1480 820', [[1560, 920, 22], [1500, 860, 20, '#FFE6F4'], [1590, 880, 18]], [[1540, 950, 30, 200], [1490, 840, 28, 150], [1600, 900, 26, 230]]);
    s += spire(1560, 300, 0.9, '#9D8BE6');
    s += '<rect width="1600" height="1000" fill="url(#vign)" pointer-events="none"/>';
    return s;
  }


  /* ---------- dựng bản đồ tương tác (tách lớp) ---------- */
  var PIDX = { home: 0, library: 2, alchemy: 4, crystal: 6, tent: 11, observatory: 13, owl: 15, castle: 19 };
  function stripGlow(str) { return str.replace(/<ellipse cx="0" cy="-120" rx="190" ry="170" fill="url\(#castleGlow\)"\/>/, ''); }
  function world() {
    var back = '';
    back += sheet(1080, 40, 520, 340, 6, roads([['M1100 140 Q1250 110 1380 170 T1590 150', 16], ['M1130 280 Q1260 240 1400 300', 14], ['M1300 60 Q1320 200 1280 360', 12]]) + blocks([[1150, 180, 60, 40], [1420, 210, 70, 50], [1200, 300, 50, 30]]));
    back += sheet(20, 620, 480, 360, -8, roads([['M40 700 Q200 660 320 740 T500 720', 16], ['M80 860 Q220 820 380 880', 14]]) + blocks([[120, 760, 60, 40], [300, 800, 70, 40]]));
    back += sheet(40, 40, 380, 260, -5, roads([['M60 120 Q180 90 300 140 T420 120', 14], ['M120 260 Q200 180 280 220', 12]]));
    back += sheet(1180, 640, 420, 340, 5, roads([['M1200 720 Q1320 690 1420 740 T1600 720', 14], ['M1240 880 Q1340 840 1480 900', 12]]));
    var base = '<g filter="url(#sheetSh)"><rect x="166" y="108" width="1268" height="788" rx="8" fill="url(#paper)" stroke="#CDB67E" stroke-width="2.5"/></g>' +
      '<rect x="184" y="126" width="1232" height="752" rx="6" fill="none" stroke="#D2BB82" stroke-width="2.5" stroke-dasharray="12 9"/>';
    base += roads([['M170 300 Q320 260 430 300 T640 260', 18], ['M170 560 Q300 520 380 560 T560 600', 16], ['M560 180 Q600 300 560 420 T620 700 T560 900', 14],
      ['M900 120 Q960 260 1080 300 T1420 260', 16], ['M1000 520 Q1120 480 1220 560 T1430 600', 18], ['M1060 700 Q1100 800 1040 900', 14], ['M200 720 Q300 700 360 760', 12], ['M1140 140 Q1180 220 1260 240', 10]]);
    base += blocks([[200, 180, 70, 44], [420, 200, 54, 36], [250, 470, 60, 40], [640, 140, 46, 30], [1120, 170, 70, 40], [1300, 300, 60, 46], [1350, 720, 54, 40], [430, 820, 70, 40], [980, 560, 50, 34], [700, 820, 46, 30]]);
    var river = 'M720 108 C690 200 760 250 735 330 S780 470 790 580', river2 = 'M870 770 C890 820 840 850 880 896';
    base += '<g fill="none" stroke-linecap="round"><path d="' + river + '" stroke="#5FA9D6" stroke-width="40"/><path d="' + river2 + '" stroke="#5FA9D6" stroke-width="40"/></g>' +
      '<ellipse cx="800" cy="684" rx="236" ry="120" fill="#5FA9D6"/><ellipse cx="800" cy="680" rx="230" ry="114" fill="#9ED6F2"/>' +
      '<g fill="none" stroke-linecap="round"><path d="' + river + '" stroke="#9ED6F2" stroke-width="32"/><path d="' + river2 + '" stroke="#9ED6F2" stroke-width="32"/>' +
      '<g class="water-hi" stroke="#fff" stroke-width="4" opacity=".85"><path d="M712 150 C700 200 742 240 730 300 S760 420 770 520"/><path d="M620 640 Q660 620 700 626"/><path d="M900 770 Q950 760 980 740"/><path d="M880 600 Q930 610 960 640"/></g></g>';
    base += '<g transform="translate(1366 818)"><circle r="42" fill="#FFF4DC" stroke="#CDB67E" stroke-width="3"/><circle r="32" fill="none" stroke="#D9C08A" stroke-width="2" stroke-dasharray="4 5"/>' +
      '<g class="compass-n"><polygon points="0,-36 7,-7 36,0 7,7 0,36 -7,7 -36,0 -7,-7" fill="#B3A4FA" stroke="' + OUT + '" stroke-width="2.2"/><polygon points="0,-36 7,-7 0,0 -7,-7" fill="#FF8FCB"/></g>' +
      '<text y="-48" text-anchor="middle" font-family="\'Baloo 2\',Nunito,ui-rounded,system-ui,sans-serif" font-weight="800" font-size="16" fill="' + OUT + '">B</text></g>';
    var bridges = '';
    [[730, 252, -8], [986, 696, 8]].forEach(function (b) {
      bridges += '<g transform="translate(' + b[0] + ' ' + b[1] + ') rotate(' + b[2] + ')">' +
        '<rect x="-44" y="-12" width="88" height="24" rx="4" fill="#B57A45" stroke="' + OUT + '" stroke-width="2.2"/><rect x="-44" y="10" width="88" height="7" rx="3" fill="#8A5A3C" stroke="' + OUT + '" stroke-width="2.2"/>' +
        [-30, -15, 0, 15, 30].map(function (x) { return '<path d="M' + x + ' -12 V12" stroke="#8A5A3C" stroke-width="2"/>'; }).join('') +
        '<path d="M-44 -14 H44 M-44 -26 H44" stroke="' + OUT + '" stroke-width="5" stroke-linecap="round"/><path d="M-44 -14 H44 M-44 -26 H44" stroke="#C98B4A" stroke-width="2.6" stroke-linecap="round"/>' +
        [-40, 0, 40].map(function (x) { return '<rect x="' + (x - 3) + '" y="-30" width="6" height="20" fill="#C98B4A" stroke="' + OUT + '" stroke-width="2"/>'; }).join('') + '</g>';
    });
    var items = [];
    LOC.forEach(function (L, i) {
      var top = L.top * 0.92;
      var body = '<g class="pop" style="--d:' + i + '">' +
        (L.id === 'castle' ? '<ellipse cx="0" cy="-120" rx="190" ry="170" fill="url(#castleGlow)"/>' : '') +
        '<g class="ring"><ellipse cx="0" cy="0" rx="150" ry="58" fill="url(#hoverGlow)"/><ellipse class="ring-dash" cx="0" cy="2" rx="124" ry="40" fill="none" stroke="#FFC93C" stroke-width="5" stroke-dasharray="14 10"/></g>' +
        '<g class="lift">' + stripGlow(L.draw()) + '</g>' +
        '<rect class="hit" x="-96" y="' + (-top) + '" width="192" height="' + (top + 34) + '" fill="transparent"/></g>';
      items.push({ y: L.y, svg: '<g class="loc" data-loc="' + L.id + '" tabindex="0" role="button" aria-label="' + L.n + '. ' + L.name + ', ' + L.cat + '" transform="translate(' + L.x + ' ' + L.y + ') scale(' + L.sc + ')">' + body + '</g>' });
    });
    [[214, 330, 0.9, '#B9ABEE'], [190, 250, 0.7, '#A898E8'], [1150, 236, 0.85, '#B9ABEE'], [1218, 250, 0.65, '#A898E8'], [1400, 540, 0.75, '#B9ABEE']].forEach(function (m) {
      items.push({ y: m[1], svg: '<g class="deco">' + spire(m[0], m[1], m[2], m[3]) + '</g>' });
    });
    [[206, 650, 't', '#57D2B6', 1], [244, 700, 'p', '#9C7CF0', 1], [200, 760, 't', '#B28CFF', 0.85], [560, 810, 't', '#57D2B6', 0.95], [612, 846, 'p', '#9C7CF0', 0.9],
      [516, 862, 't', '#F7A8D8', 0.8], [664, 470, 'p', '#57D2B6', 0.9], [626, 530, 't', '#B28CFF', 0.85], [1000, 520, 't', '#57D2B6', 0.9], [1044, 560, 'p', '#9C7CF0', 0.85],
      [1090, 760, 't', '#F7A8D8', 0.9], [1392, 700, 't', '#57D2B6', 0.9], [1404, 770, 'p', '#B28CFF', 0.85], [860, 176, 't', '#57D2B6', 0.75], [896, 182, 'p', '#9C7CF0', 0.75],
      [470, 210, 't', '#F7A8D8', 0.75], [1110, 580, 'p', '#57D2B6', 0.75], [534, 476, 'p', '#57D2B6', 0.7], [1170, 690, 't', '#B28CFF', 0.7], [370, 520, 't', '#F7A8D8', 0.6]].forEach(function (t, k) {
      items.push({ y: t[1], svg: '<g class="deco tree" style="--k:' + k + '">' + (t[2] === 't' ? tree(t[0], t[1], t[4], t[3]) : pine(t[0], t[1], t[4], t[3])) + '</g>' });
    });
    items.sort(function (a, b) { return a.y - b.y; });
    function fog(id) {
      var L = LOC.filter(function (q) { return q.id === id; })[0];
      return '<g class="fog" data-fog="' + id + '"><g filter="url(#fogBlur)" opacity=".6">' + [[-70, -40, 46], [-10, -70, 56], [60, -40, 48], [10, -10, 50], [-60, 0, 34], [70, 6, 34], [0, -120, 40]].map(function (c) {
        return '<circle cx="' + (L.x + c[0]) + '" cy="' + (L.y + c[1]) + '" r="' + c[2] + '" fill="#F5F1FF"/>'; }).join('') + '</g></g>';
    }
    var stones = catmullPts(PATH, 25).map(function (p) { return { x: p[0], y: p[1], seg: p[2] }; });
    var dense = catmullPts(PATH, 4).map(function (p) { return { x: p[0], y: p[1], seg: p[2] }; });
    dense.push({ x: PATH[PATH.length - 1][0], y: PATH[PATH.length - 1][1], seg: PATH.length - 1 });
    var fg = {
      tl: branch('M-20 26 C50 36 100 64 150 84 S206 112 234 104', [[58, 44, 20], [116, 74, 24], [168, 92, 18, '#FFE6F4'], [222, 100, 17], [22, 22, 18, '#FFE6F4'], [92, 112, 15]],
        [[70, 64, 30, 40], [140, 60, 28, -30], [196, 112, 28, 60], [20, 52, 28, 70], [110, 100, 24, 110]]),
      bl: spire(70, 1010, 1.25, '#9D8BE6') + spire(150, 1020, 0.9, '#B9ABEE') + spire(20, 900, 0.8, '#A898E8'),
      br: '<g class="glowm">' + mushroom(1440, 990, 1.3, '#FF8FCB') + mushroom(1520, 1000, 1.0, '#B28CFF') + mushroom(1380, 1010, 0.8, '#57D2B6') + '</g>' +
        branch('M1630 980 C1560 930 1520 870 1480 820', [[1560, 920, 22], [1500, 860, 20, '#FFE6F4'], [1590, 880, 18]], [[1540, 950, 30, 200], [1490, 840, 28, 150], [1600, 900, 26, 230]])
    };
    return { back: back, base: base, bridges: bridges, items: items.map(function (it) { return it.svg; }).join(''), fog: fog, stones: stones, dense: dense, fg: fg };
  }

  window.Iso = { scene: scene, world: world, LOC: LOC, PATH: PATH, PIDX: PIDX, P: P, plaque: plaque, defs: defs, spark: spark, tree: tree, pine: pine, stripGlow: stripGlow, cobot: cobot, OUT: OUT };
})();
