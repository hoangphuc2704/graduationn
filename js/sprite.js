/* ===== Bộ hình SVG: Thư mời tốt nghiệp Kỹ sư Phần mềm (Cam FPT & Xanh Navy) ===== */
(function () {
  'use strict';
  var INK = '#0F172A',
    NAVY = '#0F172A',
    NAVY_SURFACE = '#1E293B',
    NAVY_DEEP = '#0A0F1D',
    PURPLE = '#1E293B',
    PURPLE_D = '#0A0F1D',
    LAV = '#38BDF8',
    LAV_L = '#BAE6FD',
    CREAM = '#F8FAFC',
    YEL = '#F26F21', // FPT Orange
    SUN = '#EA580C',
    ORA = '#F26F21',
    PINK = '#F26F21',
    PINK_L = '#FFEDD5',
    TEAL = '#0EA5E9',
    TEAL_L = '#E0F2FE',
    WHITE = '#FFFFFF',
    GRAY = '#94A3B8';

  var DEFS = [];
  function n(v) { return Math.round(v * 10) / 10; }

  function spark(x, y, r, fill, sw, st) {
    fill = fill || YEL; sw = sw == null ? 1.6 : sw;
    var k = r * 0.22;
    return '<path d="M' + n(x) + ' ' + n(y - r) + 'Q' + n(x + k) + ' ' + n(y - k) + ' ' + n(x + r) + ' ' + n(y) +
      'Q' + n(x + k) + ' ' + n(y + k) + ' ' + n(x) + ' ' + n(y + r) + 'Q' + n(x - k) + ' ' + n(y + k) + ' ' + n(x - r) + ' ' + n(y) +
      'Q' + n(x - k) + ' ' + n(y - k) + ' ' + n(x) + ' ' + n(y - r) + 'Z" fill="' + fill + '" stroke="' + (st || INK) + '" stroke-width="' + sw + '" stroke-linejoin="round"/>';
  }

  function starPts(cx, cy, k, R, r, rot) {
    rot = rot == null ? -Math.PI / 2 : rot;
    var p = [];
    for (var i = 0; i < k * 2; i++) {
      var rr = i % 2 ? r : R, a = rot + i * Math.PI / k;
      p.push(n(cx + Math.cos(a) * rr) + ',' + n(cy + Math.sin(a) * rr));
    }
    return p.join(' ');
  }

  function diamond(x, y, w, h, fill, sw) {
    return '<path d="M' + x + ' ' + (y - h) + 'L' + (x + w) + ' ' + y + 'L' + x + ' ' + (y + h) + 'L' + (x - w) + ' ' + y + 'Z" fill="' + (fill || YEL) +
      '" stroke="' + INK + '" stroke-width="' + (sw || 1.6) + '" stroke-linejoin="round"/>';
  }

  function arc(cx, cy, r, a1, a2, color, w) {
    var t1 = a1 * Math.PI / 180, t2 = a2 * Math.PI / 180;
    return '<path d="M' + n(cx + Math.cos(t1) * r) + ' ' + n(cy + Math.sin(t1) * r) + 'A' + r + ' ' + r + ' 0 0 1 ' + n(cx + Math.cos(t2) * r) + ' ' + n(cy + Math.sin(t2) * r) +
      '" fill="none" stroke="' + (color || WHITE) + '" stroke-width="' + (w || 3.5) + '" stroke-linecap="round"/>';
  }

  /* Nón cử nhân (Mortarboard) */
  function mortar(cx, cy, s) {
    s = s || 1;
    var w = 18 * s, h = 10 * s, capY = cy - 2 * s;
    return '<g stroke="' + INK + '" stroke-width="' + (1.4 * s) + '" stroke-linejoin="round">' +
      '<path d="M' + (cx - 7 * s) + ' ' + (cy + 2 * s) + 'V' + (cy + 7 * s) + 'Q' + cx + ' ' + (cy + 11 * s) + ' ' + (cx + 7 * s) + ' ' + (cy + 7 * s) + 'V' + (cy + 2 * s) + 'Z" fill="' + NAVY_DEEP + '"/>' +
      '<polygon points="' + cx + ',' + (capY - h) + ' ' + (cx + w) + ',' + capY + ' ' + cx + ',' + (capY + h) + ' ' + (cx - w) + ',' + capY + '" fill="' + NAVY_SURFACE + '"/>' +
      '<path d="M' + cx + ' ' + capY + 'L' + (cx + 12 * s) + ' ' + (capY + 4 * s) + 'V' + (capY + 12 * s) + '" fill="none" stroke="' + YEL + '" stroke-width="' + (1.6 * s) + '" stroke-linecap="round"/>' +
      '<circle cx="' + (cx + 12 * s) + '" cy="' + (capY + 13 * s) + '" r="' + (2 * s) + '" fill="' + YEL + '"/>' +
      '<circle cx="' + cx + '" cy="' + capY + '" r="' + (2 * s) + '" fill="' + YEL + '"/>' +
      '</g>';
  }

  /* Khung thẻ cử nhân (Developer Badge) */
  var FRAME = 'M40 38 H80 C88 38 92 34 100 27 C108 34 112 38 120 38 H160 A10 10 0 0 1 170 48 V274 A10 10 0 0 1 160 284 H120 C112 284 108 288 100 295 C92 288 88 284 80 284 H40 A10 10 0 0 1 30 274 V48 A10 10 0 0 1 40 38 Z';
  var RIBBON = '<path d="M30 256 H12 L19 268 L12 280 H30 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M170 256 H188 L181 268 L188 280 H170 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<rect x="24" y="250" width="152" height="34" rx="8" fill="' + WHITE + '" stroke="' + INK + '" stroke-width="3.2"/>';

  function base(panel, ribbon) {
    return '<rect x="6" y="10" width="188" height="318" rx="20" fill="' + INK + '"/>' +
      '<rect x="6" y="4" width="188" height="318" rx="20" fill="' + NAVY_SURFACE + '" stroke="' + INK + '" stroke-width="4.5"/>' +
      '<rect x="14" y="12" width="172" height="302" rx="14" fill="none" stroke="' + YEL + '" stroke-width="1.8" opacity=".85"/>' +
      spark(18.5, 18.5, 4.5, YEL) + spark(181.5, 18.5, 4.5, YEL) + spark(18.5, 307.5, 4.5, YEL) + spark(181.5, 307.5, 4.5, YEL) +
      '<rect x="24" y="24" width="152" height="276" rx="10" fill="' + panel + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="' + FRAME + '" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="' + FRAME + '" fill="none" stroke="' + YEL + '" stroke-width="2" stroke-linejoin="round"/>' +
      (ribbon ? RIBBON : '');
  }

  /* 01 · Thẻ Thời Sinh Viên (Hành trình Đại học FPT) */
  var starArt =
    '<rect x="44" y="58" width="112" height="136" rx="12" fill="' + NAVY_DEEP + '" stroke="' + INK + '" stroke-width="3.5"/>' +
    '<rect x="52" y="66" width="96" height="18" rx="5" fill="' + NAVY_SURFACE + '"/>' +
    '<circle cx="62" cy="75" r="3.5" fill="#EF4444"/><circle cx="72" cy="75" r="3.5" fill="' + YEL + '"/><circle cx="82" cy="75" r="3.5" fill="#10B981"/>' +
    '<text x="100" y="120" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="800" font-size="28" fill="' + YEL + '">&lt;FPTU/&gt;</text>' +
    '<text x="100" y="142" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="700" font-size="11" fill="' + LAV + '" letter-spacing="1">SOFTWARE ENG.</text>' +
    '<path d="M54 162 H146" stroke="#334155" stroke-width="2" stroke-linecap="round"/>' +
    '<text x="100" y="178" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="700" font-size="10" fill="' + GRAY + '">BATCH 2022 - 2026</text>' +
    mortar(100, 222, 1.3) +
    spark(46, 214, 5, YEL) + spark(154, 214, 5, YEL);

  /* 02 · Thẻ Ngày Tốt Nghiệp */
  var sunArt =
    '<circle cx="100" cy="120" r="54" fill="' + NAVY_DEEP + '" stroke="' + INK + '" stroke-width="3.5"/>' +
    '<circle cx="100" cy="120" r="48" fill="none" stroke="' + YEL + '" stroke-width="2" stroke-dasharray="6 4"/>' +
    mortar(100, 114, 1.8) +
    '<rect x="62" y="160" width="76" height="26" rx="6" fill="' + YEL + '" stroke="' + INK + '" stroke-width="2.5"/>' +
    '<text x="100" y="177" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="800" font-size="13" fill="' + WHITE + '">07.11.2026</text>' +
    '<text x="100" y="218" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="800" font-size="12" fill="' + NAVY + '">GRADUATION DAY</text>' +
    '<path d="M60 228 H140" stroke="' + YEL + '" stroke-width="2.5" stroke-linecap="round"/>' +
    spark(48, 86, 6, YEL) + spark(152, 86, 6, YEL);

  /* 03 · Thẻ Kỹ Sư Phần Mềm */
  var magicArt =
    '<rect x="46" y="60" width="108" height="74" rx="8" fill="' + NAVY_DEEP + '" stroke="' + INK + '" stroke-width="3.5"/>' +
    '<rect x="52" y="66" width="96" height="62" rx="4" fill="' + NAVY_SURFACE + '"/>' +
    '<text x="60" y="86" font-family="monospace" font-weight="800" font-size="12" fill="' + YEL + '">$ dev.build()</text>' +
    '<text x="60" y="104" font-family="monospace" font-weight="700" font-size="11" fill="' + LAV + '">&gt; Success: 100%</text>' +
    '<path d="M36 142 H164 L170 152 Q171 155 166 155 H34 Q29 155 30 152 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round"/>' +
    '<rect x="88" y="145" width="24" height="3" rx="1.5" fill="' + INK + '" opacity=".5"/>' +
    '<circle cx="100" cy="198" r="28" fill="' + NAVY_DEEP + '" stroke="' + INK + '" stroke-width="3"/>' +
    '<text x="100" y="205" text-anchor="middle" font-family="\'Baloo 2\',Nunito,sans-serif" font-weight="800" font-size="20" fill="' + YEL + '">&lt;/&gt;</text>' +
    '<text x="100" y="238" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="800" font-size="11" fill="' + NAVY + '">SOFTWARE ENGINEER</text>' +
    spark(46, 186, 5, YEL) + spark(154, 186, 5, YEL);

  /* Sticker cho thẻ ảnh */
  var stickerStar =
    '<circle cx="30" cy="30" r="26" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3"/>' +
    mortar(30, 28, 0.95);

  var stickerSun =
    '<circle cx="30" cy="30" r="26" fill="' + NAVY_SURFACE + '" stroke="' + YEL + '" stroke-width="3"/>' +
    '<text x="30" y="36" text-anchor="middle" font-family="\'Baloo 2\',Nunito,sans-serif" font-weight="800" font-size="16" fill="' + YEL + '">&lt;/&gt;</text>';

  /* Nón cử nhân header (thay thế bút lông) */
  var quill =
    '<g stroke="' + INK + '" stroke-width="4.5" stroke-linejoin="round">' +
    '<path d="M131 22 L246 64 L131 102 L16 64 Z" fill="' + NAVY_SURFACE + '"/>' +
    '<path d="M72 74 V102 Q131 130 190 102 V74" fill="' + NAVY_DEEP + '"/>' +
    '<path d="M131 64 L216 92 V118" fill="none" stroke="' + YEL + '" stroke-width="4.5" stroke-linecap="round"/>' +
    '<circle cx="216" cy="120" r="7" fill="' + YEL + '"/>' +
    '<circle cx="131" cy="64" r="5" fill="' + YEL + '"/>' +
    '</g>';

  /* Mặt sau thẻ: Developer Graduation Badge */
  function luxBack() {
    var dots = '';
    for (var i = 0; i < 24; i++) {
      var dx = 38 + (i % 6) * 24, dy = 50 + Math.floor(i / 6) * 56;
      dots += '<circle cx="' + dx + '" cy="' + dy + '" r="1.5" fill="' + YEL + '" opacity=".4"/>';
    }
    return '<rect x="6" y="10" width="188" height="318" rx="20" fill="' + INK + '"/>' +
      '<rect x="6" y="4" width="188" height="318" rx="20" fill="' + NAVY_SURFACE + '" stroke="' + INK + '" stroke-width="4.5"/>' +
      '<rect x="14" y="12" width="172" height="302" rx="14" fill="none" stroke="' + YEL + '" stroke-width="2" opacity=".9"/>' +
      spark(18.5, 18.5, 4.5, YEL) + spark(181.5, 18.5, 4.5, YEL) + spark(18.5, 307.5, 4.5, YEL) + spark(181.5, 307.5, 4.5, YEL) +
      '<rect x="24" y="24" width="152" height="276" rx="10" fill="' + NAVY_DEEP + '" stroke="' + INK + '" stroke-width="3"/>' +
      dots +
      '<path d="' + FRAME + '" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="' + FRAME + '" fill="none" stroke="' + YEL + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="100" cy="160" r="54" fill="' + NAVY_SURFACE + '" stroke="' + INK + '" stroke-width="7"/>' +
      '<circle cx="100" cy="160" r="54" fill="none" stroke="' + YEL + '" stroke-width="3"/>' +
      '<circle cx="100" cy="160" r="44" fill="none" stroke="' + LAV + '" stroke-width="1.4" stroke-dasharray="5 3"/>' +
      mortar(100, 154, 1.8) +
      '<rect x="44" y="52" width="112" height="22" rx="6" fill="' + NAVY_SURFACE + '" stroke="' + YEL + '" stroke-width="1.8"/>' +
      '<text x="100" y="67" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="800" font-size="11" fill="' + YEL + '" letter-spacing="1.5">FPT UNIVERSITY</text>' +
      '<rect x="44" y="250" width="112" height="22" rx="6" fill="' + NAVY_SURFACE + '" stroke="' + YEL + '" stroke-width="1.8"/>' +
      '<text x="100" y="265" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="800" font-size="11" fill="' + WHITE + '" letter-spacing="1">GRADUATION 2026</text>' +
      spark(42, 160, 4.5, YEL) + spark(158, 160, 4.5, YEL);
  }

  /* Bệ đỡ hiện đại (thay thế quyển sách phép) */
  var book =
    '<defs>' +
    '<linearGradient id="dockGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E293B"/><stop offset="1" stop-color="#0A0F1D"/></linearGradient>' +
    '<linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#38BDF8" stop-opacity="0"/><stop offset="0.5" stop-color="#F26F21"/><stop offset="1" stop-color="#38BDF8" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    '<rect x="20" y="80" width="960" height="330" rx="36" fill="' + INK + '" opacity=".55"/>' +
    '<rect x="20" y="65" width="960" height="330" rx="36" fill="url(#dockGrad)" stroke="' + INK + '" stroke-width="6"/>' +
    '<rect x="36" y="81" width="928" height="298" rx="24" fill="none" stroke="#334155" stroke-width="2.5"/>' +
    '<path d="M80 66 H920" stroke="url(#accentLine)" stroke-width="5" stroke-linecap="round"/>' +
    '<rect x="430" y="360" width="140" height="6" rx="3" fill="' + YEL + '" opacity=".8"/>' +
    '<text x="500" y="348" text-anchor="middle" font-family="\'Nunito\',sans-serif" font-weight="800" font-size="14" fill="#64748B" letter-spacing="2">SOFTWARE ENGINEERING · CLASS OF 2026</text>';

  /* Dải sóng công nghệ nền */
  var cloudBand =
    '<path d="M0 120 Q360 70 720 120 T1440 120 V200 H0 Z" fill="' + NAVY_SURFACE + '" opacity=".7"/>' +
    '<path d="M0 140 Q360 100 720 140 T1440 140 V200 H0 Z" fill="' + NAVY_DEEP + '"/>' +
    '<path d="M0 120 Q360 70 720 120 T1440 120" fill="none" stroke="' + YEL + '" stroke-width="3" opacity=".7"/>';

  var emptySymbol = '<g></g>';

  var symbols = {
    cloudBand: ['0 0 1440 200', cloudBand, 'xMidYMax slice'],
    cardBack: ['0 0 200 330', luxBack()],
    cardStar: ['0 0 200 330', base(CREAM, true) + starArt],
    cardSun: ['0 0 200 330', base(CREAM, true) + sunArt],
    cardMagician: ['0 0 200 330', base(CREAM, true) + magicArt],
    cardPhoto: ['0 0 200 330', base(CREAM, true)],
    stickerStar: ['0 0 60 60', stickerStar],
    stickerSun: ['0 0 60 60', stickerSun],
    quill: ['0 0 262 120', quill],
    book: ['0 0 1000 432', book],
    spark: ['0 0 40 40', spark(20, 20, 17, YEL, 2.6)],
    sparkW: ['0 0 40 40', spark(20, 20, 17, WHITE, 2.6)],
    heart: ['0 0 40 40', '<path d="M20 34 C8 25 4 18 6 12 C8 6 16 5 20 12 C24 5 32 6 34 12 C36 18 32 25 20 34 Z" fill="' + YEL + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'],
    // Giữ các symbol rỗng để tương thích an toàn nếu có thẻ SVG gọi tới:
    bramble: ['0 0 360 900', emptySymbol],
    cat: ['0 -10 170 180', emptySymbol],
    vine: ['0 0 220 440', emptySymbol],
    potion: ['0 0 90 108', emptySymbol],
    crystal: ['0 0 110 108', emptySymbol],
    moonBig: ['0 0 260 260', emptySymbol],
    hat: ['0 0 240 220', emptySymbol]
  };

  var html = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>';
  var body = '';
  Object.keys(symbols).forEach(function (k) {
    body += '<symbol id="' + k + '" viewBox="' + symbols[k][0] + '"' + (symbols[k][2] ? ' preserveAspectRatio="' + symbols[k][2] + '"' : '') + '>' + symbols[k][1] + '</symbol>';
  });
  html += DEFS.join('') + '</defs>' + body + '</svg>';
  var holder = document.createElement('div');
  holder.innerHTML = html;
  document.body.insertBefore(holder.firstChild, document.body.firstChild);
})();
