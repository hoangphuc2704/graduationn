/* ===== Bản đồ hành trình — tương tác ===== */
(function () {
  'use strict';
  var I = window.Iso;
  if (!I) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var NS = 'http://www.w3.org/2000/svg';
  var LOC = I.LOC, byId = {};
  LOC.forEach(function (L) { byId[L.id] = L; });
  var ORDER = LOC.map(function (L) { return L.id; });

  /* gradient, filter dùng chung */
  (function () {
    var h = document.createElement('div');
    h.innerHTML = '<svg xmlns="' + NS + '" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">' + I.defs() + '</svg>';
    document.body.insertBefore(h.firstChild, document.body.firstChild);
  })();

  /* ---------- nội dung từng địa điểm ---------- */
  var INFO = {
    home: { desc: 'Nơi bắt đầu hành trình: mình là ai và đang hướng tới điều gì.', kind: 'about' },
    library: { desc: 'Những năm học Kỹ thuật Phần mềm tại Đại học FPT và các cột mốc đáng nhớ.', kind: 'timeline' },
    alchemy: { desc: 'Nơi mình luyện nghề: kỳ thực tập Backend tại FPT Software.', kind: 'experience' },
    crystal: { desc: 'Các dự án .NET của mình, nổi bật là nền tảng 5 microservice đang chạy thật.', kind: 'projects' },
    tent: { desc: 'SmartCanteen: hệ thống robot phục vụ món ăn, đồ án tốt nghiệp của mình.', kind: 'capstone' },
    observatory: { desc: 'Bản đồ sao các kỹ năng và công nghệ mình dùng hằng ngày.', kind: 'skills' },
    owl: { desc: 'Muốn trò chuyện hoặc cùng làm dự án? Cú đưa thư luôn sẵn sàng.', kind: 'contact' },
    castle: { desc: 'Đích đến của hành trình: lễ tốt nghiệp ngày 07.11.2026.', kind: 'invite' }
  };
  var PROJECTS = [
    {
      title: '360Retail', sub: 'Nền tảng SaaS quản lý bán lẻ · nhóm 5 người', time: '08/2025 – nay', art: 'crystal',
      tags: ['.NET 8', 'PostgreSQL', 'Redis', 'Ocelot', 'Docker', 'GitHub Actions'],
      stats: [['5', 'microservice'], ['8', 'container Docker'], ['29', 'bài test tự động mỗi build']],
      points: ['Thiết kế và xây dựng 5 microservice (Identity, Subscription/Payment, POS/Sales, HR, CRM), đã chạy production.',
        'Định tuyến các service qua Ocelot API Gateway, xác thực JWT và phân quyền theo vai trò.',
        'Tích hợp thanh toán VNPay và SePay (QR) với IPN webhook để tự động xác nhận giao dịch.',
        'Module POS tự trừ tồn kho, xuất báo cáo Excel; tăng tốc đọc dữ liệu bằng Redis cache.',
        'Chuyển yêu cầu nghiệp vụ (gói thuê bao, giới hạn tính năng) thành API contract và mô hình dữ liệu.',
        'Docker Compose 8 container, CI/CD bằng GitHub Actions chạy 29 bài test tự động mỗi lần build.'],
      diagram: 'retail', links: [['Xem sản phẩm', 'https://360retail-cortexa.online']]
    },
    {
      title: 'TreeShop', sub: 'REST API backend quản lý cửa hàng', time: '', art: 'tree',
      tags: ['ASP.NET Core 8', 'SQL Server 2022', 'Docker', 'JWT', 'Swagger'],
      points: ['REST API quản lý cửa hàng với xác thực JWT, SQL Server 2022 và tài liệu Swagger.',
        'Đóng gói bằng Docker Compose, tự khởi tạo cơ sở dữ liệu; cấu hình CORS cho client Flutter và React.'],
      links: [['Mã nguồn trên GitHub', 'https://github.com/TranMinh0903/TreeShop']]
    }
  ];
  var ICO = {
    mail: '<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>',
    gh: '<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6.2 0C6.6 2.8 5.6 3.1 5.6 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.2 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    li: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  function ico(k, cls) { return '<svg class="' + (cls || 'mp-i') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[k] + '</svg>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tags(list) { return '<span class="mp-tags">' + list.map(function (t) { return '<i>' + esc(t) + '</i>'; }).join('') + '</span>'; }
  function bullets(list) { return '<ul class="mp-ul">' + list.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'; }
  function artSVG(kind) {
    if (kind === 'crystal') return '<svg viewBox="-110 -170 220 200" aria-hidden="true">' + I.stripGlow(byId.crystal.draw()) + '</svg>';
    if (kind === 'tree') return '<svg viewBox="-90 -120 180 140" aria-hidden="true">' + I.tree(-30, 10, 1.35, '#57D2B6') + I.tree(34, 14, 1, '#F7A8D8') + I.pine(70, 4, 0.8, '#9C7CF0') + '</svg>';
    return '';
  }
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
  function countdownText() {
    var st = eventState();
    return [st.pre, st.num, st.post].filter(Boolean).join(' ');
  }
  function bodyFor(id) {
    var inf = INFO[id], h = '';
    if (inf.kind === 'about') {
      h = '<div class="mp-char"><div class="mp-charcard"><svg viewBox="0 0 200 330" aria-hidden="true"><use href="#cardBack"/></svg></div>' +
        '<dl class="mp-stats">' + [['Tên nhân vật', 'Nguyễn Bùi Hoàng Phúc'], ['Lớp', 'Backend Developer · C# / .NET'], ['Học viện', 'Đại học FPT TP.HCM'],
        ['Thành tích', '4 kỳ Sinh viên xuất sắc (Dean’s List)'], ['Nhiệm vụ', 'Tìm vị trí Graduate / Fresher Developer']].map(function (r) {
          return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
        }).join('') + '</dl></div>' +
        '<p class="mp-bio mp-anim" style="--i:1">Mình là sinh viên năm cuối ngành Kỹ thuật Phần mềm tại Đại học FPT (đã hoàn thành toàn bộ chương trình học), tập trung vào phát triển backend với C#, .NET 8 và ASP.NET Core. Mình đã thực tập Backend tại FPT Software và cùng nhóm xây dựng nền tảng microservices gồm 5 service đang chạy thực tế. Mình đang tìm vị trí Graduate / Fresher Software Developer trong một đội Agile.</p>';
    } else if (inf.kind === 'timeline') {
      var tl = [['09/2022', 'Nhập học Đại học FPT TP.HCM', 'Ngành Kỹ thuật Phần mềm (B.E.).'],
      ['2024', 'Chứng chỉ Software Development Lifecycle', 'University of Minnesota, học trên Coursera.'],
      ['2024 – 2026', 'Dean’s List · Sinh viên xuất sắc', 'Summer 2024, Fall 2024, Fall 2025 và Spring 2026.'],
      ['05 – 09/2025', 'Thực tập (OJT) tại FPT Software', 'Backend Developer Intern, dự án đặt vé xem phim trực tuyến.'],
      ['2026', 'Đồ án tốt nghiệp SmartCanteen', 'Hệ thống robot phục vụ món ăn.'],
      ['07.11.2026', 'Lễ tốt nghiệp', 'Chính thức trở thành tân cử nhân Kỹ thuật Phần mềm.']];
      h = '<ol class="mp-tl">' + tl.map(function (t, i) {
        return '<li class="mp-anim" style="--i:' + i + '"><span class="mp-tl-dot"></span><b>' + t[0] + '</b><h4>' + t[1] + '</h4><p>' + t[2] + '</p></li>';
      }).join('') + '</ol>' +
        '<div class="mp-box mp-anim" style="--i:6"><h4>Môn học tiêu biểu</h4>' + tags(['PRN222 · .NET', 'PRN232 · .NET', 'PRM393 · Flutter', 'EXE101 · Khởi nghiệp']) + '</div>';
    } else if (inf.kind === 'experience') {
      h = '<article class="mp-xp mp-anim" style="--i:0"><div class="mp-xp-head"><span class="mp-xp-ico">' + ico('ticket') + '</span>' +
        '<div><h4>Backend Developer Intern</h4><p>FPT Software · TP.HCM</p></div><span class="mp-xp-time">05/2025 – 09/2025</span></div>' +
        '<p class="mp-xp-proj">Dự án: Hệ thống đặt vé xem phim trực tuyến</p>' +
        bullets(['Xây dựng các REST API cốt lõi (phim, suất chiếu, ghế, đặt vé, thanh toán) với ASP.NET Core và SQL Server.',
          'Cập nhật ghế theo thời gian thực bằng SignalR, khóa ghế để tránh đặt trùng.',
          'Thiết kế vòng đời vé (đặt → thanh toán → xuất vé) và tính năng quản lý vé của người dùng.',
          'Làm việc trong nhóm Agile với quy trình Git và code review thường xuyên.']) +
        tags(['ASP.NET Core', 'SQL Server', 'SignalR', 'REST API', 'Git', 'Agile']) + '</article>' +
        '<div class="mp-flowline mp-anim" style="--i:1" aria-label="Vòng đời vé"><span>Đặt vé</span><i>→</i><span>Thanh toán</span><i>→</i><span>Xuất vé</span></div>';
    } else if (inf.kind === 'projects') {
      h = '<div class="mp-grid">' + PROJECTS.map(function (p, i) {
        return '<button type="button" class="mp-card mp-anim" data-proj="' + i + '" style="--i:' + i + '"><span class="mp-art-th">' + artSVG(p.art) + '</span>' +
          '<h4>' + esc(p.title) + '</h4><p>' + esc(p.sub) + '</p>' + tags(p.tags.slice(0, 4)) + '<span class="mp-more">Xem chi tiết →</span></button>';
      }).join('') + '</div>';
    } else if (inf.kind === 'capstone') {
      h = '<div class="mp-cap mp-anim" style="--i:0"><span class="mp-cap-art"><svg viewBox="-60 -90 120 100" aria-hidden="true">' + I.cobot() + '</svg></span>' +
        '<div><h4>SmartCanteen</h4><p>Robotic Food-Serving System · đồ án tốt nghiệp 2026</p>' + tags(['Python', 'FastAPI', 'SignalR', 'Computer Vision', 'Unity (C#)']) + '</div></div>' +
        '<div class="mp-arch mp-anim" style="--i:1"><div class="mp-arch-row"><span class="n">Camera · DataMatrix</span><i>→</i><span class="n hl">Robot edge service<small>Python / FastAPI</small></span><i>→</i><span class="n">Cobot FAIRINO FR3<small>XML-RPC</small></span></div>' +
        '<div class="mp-arch-row"><span class="n">Backend .NET</span><i>⇄</i><span class="n">SignalR<small>trạng thái công việc</small></span><i>·</i><span class="n">Unity digital twin</span></div></div>' +
        bullets(['Xây dựng dịch vụ edge cho robot (Python/FastAPI) điều khiển cobot FAIRINO FR3 qua XML-RPC.',
          'Kiểm tra món ăn bằng thị giác máy tính (mã DataMatrix), gửi trạng thái công việc về backend .NET qua SignalR.',
          'Phát triển digital twin bằng Unity mô phỏng cánh tay robot để giám sát và thử nghiệm.']) +
        '<p class="mp-note">Kho mã: SmartCanteen-RobotService</p>';
    } else if (inf.kind === 'skills') {
      var groups = [['Ngôn ngữ', ['C#*', 'SQL', 'JavaScript / TypeScript', 'Python (cơ bản)']],
      ['Backend', ['ASP.NET Core Web API*', 'Entity Framework Core*', 'RESTful API', 'SignalR', 'OOP', 'Dependency Injection']],
      ['Kiến trúc', ['Microservices*', 'API Gateway (Ocelot)', 'JWT / OAuth 2.0', 'Phân quyền theo vai trò']],
      ['Cơ sở dữ liệu', ['SQL Server*', 'PostgreSQL', 'Redis']],
      ['DevOps & công cụ', ['Docker*', 'Docker Compose', 'GitHub Actions (CI/CD)', 'Git', 'Agile', 'Claude Code']],
      ['Phân tích', ['Phân tích yêu cầu', 'Mô hình dữ liệu', 'Sơ đồ hệ thống / sequence / activity (draw.io)']]];
      h = '<div class="mp-skills">' + groups.map(function (g, i) {
        return '<div class="mp-skg mp-anim" style="--i:' + i + '"><h4><svg viewBox="0 0 40 40" aria-hidden="true"><use href="#spark"/></svg>' + g[0] + '</h4><div class="mp-chips">' +
          g[1].map(function (c) { var hi = c.slice(-1) === '*'; return '<i' + (hi ? ' class="hi"' : '') + '>' + esc(hi ? c.slice(0, -1) : c) + '</i>'; }).join('') + '</div></div>';
      }).join('') + '</div><p class="mp-note mp-anim" style="--i:6"><b>Tiếng Anh:</b> Upper-intermediate, đọc tài liệu kỹ thuật và giao tiếp hằng ngày trong nhóm.</p>';
    } else if (inf.kind === 'contact') {
      h = '<div class="mp-contact">' +
        '<div class="mp-crow mp-anim" style="--i:0"><span class="mp-cico">' + ico('mail') + '</span><b>Email</b><span class="mp-cval"><span class="sel">tranhoangminhbla123@gmail.com</span><button type="button" class="mp-copy" data-copy="tranhoangminhbla123@gmail.com">Chép</button></span></div>' +
        '<div class="mp-crow mp-anim" style="--i:1"><span class="mp-cico">' + ico('gh') + '</span><b>GitHub</b><a class="mp-cval" href="https://github.com/TranMinh0903" target="_blank" rel="noopener">github.com/TranMinh0903' + ico('ext', 'mp-i sm') + '</a></div>' +
        '<div class="mp-crow mp-anim" style="--i:2"><span class="mp-cico">' + ico('li') + '</span><b>LinkedIn</b><a class="mp-cval" href="https://www.linkedin.com/in/tranhoangtuanminh" target="_blank" rel="noopener">linkedin.com/in/tranhoangtuanminh' + ico('ext', 'mp-i sm') + '</a></div>' +
        '</div><p class="mp-note mp-anim" style="--i:3">Mình đang tìm vị trí Graduate / Fresher Software Developer (C# / .NET) tại TP.HCM.</p>';
    } else if (inf.kind === 'invite') {
      h = '<div class="mp-inv mp-anim" style="--i:0"><p class="mp-inv-cd">' + countdownText() + '</p>' +
        '<p class="mp-inv-date">Thứ Bảy, 07.11.2026</p><p class="mp-inv-time">Từ 12h30</p><p class="mp-inv-place">Trường Đại học FPT TP.HCM<span>Lô E2a-7, Đường D1, Khu Công nghệ cao, TP.HCM</span></p>' +
        '<div class="mp-actions"><button type="button" class="btn btn-yellow" id="mpToInvite">Mở thư mời</button>' +
        '<a class="btn btn-white" href="https://www.google.com/maps/search/?api=1&amp;query=FPT+University+Ho+Chi+Minh+City" target="_blank" rel="noopener">Xem đường đi</a></div></div>';
    }
    return h;
  }
  function bookHTML(id) {
    var L = byId[id], inf = INFO[id];
    return '<div class="mp-tab">' + L.name + '</div>' +
      '<div class="mp-bhead"><span class="mp-num">' + L.n + '</span><span class="mp-pill">' + L.cat + '</span></div>' +
      '<p class="mp-lead">' + inf.desc + '</p><div class="mp-scroll" id="mpScroll">' + bodyFor(id) + '</div>';
  }
  function projectDetail(i) {
    var p = PROJECTS[i], h = '<div class="mp-detail"><button type="button" class="mp-btn mp-dback" id="mpDback">← Tất cả dự án</button>' +
      '<div class="mp-dhead"><span class="mp-art-th sm">' + artSVG(p.art) + '</span><div><h3>' + esc(p.title) + '</h3><p>' + esc(p.sub) + (p.time ? ' · ' + p.time : '') + '</p></div></div>';
    if (p.stats) h += '<div class="mp-statrow">' + p.stats.map(function (s) { return '<div><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('') + '</div>';
    if (p.diagram === 'retail') h += '<div class="mp-arch"><div class="mp-arch-row"><span class="n">Web / POS client</span></div><div class="mp-arch-down">↓</div>' +
      '<div class="mp-arch-row"><span class="n hl">Ocelot API Gateway<small>JWT · phân quyền theo vai trò</small></span></div><div class="mp-arch-down">↓</div>' +
      '<div class="mp-arch-row svc">' + ['Identity', 'Subscription / Payment', 'POS / Sales', 'HR', 'CRM'].map(function (x) { return '<span class="n gem">' + x + '</span>'; }).join('') + '</div><div class="mp-arch-down">↓</div>' +
      '<div class="mp-arch-row"><span class="n">PostgreSQL</span><span class="n">Redis cache</span><span class="n">VNPay · SePay (IPN)</span></div></div>';
    h += bullets(p.points) + tags(p.tags);
    if (p.links) h += '<div class="mp-actions">' + p.links.map(function (l) { return '<a class="btn btn-yellow" href="' + l[1] + '" target="_blank" rel="noopener">' + l[0] + ' ↗</a>'; }).join('') + '</div>';
    return h + '</div>';
  }

  /* ---------- trạng thái ---------- */
  var visited = new Set();
  try { (JSON.parse(localStorage.getItem('tm-map-visited') || '[]') || []).forEach(function (id) { if (byId[id]) visited.add(id); }); } catch (e) { }
  function saveVisited() { try { localStorage.setItem('tm-map-visited', JSON.stringify(Array.from(visited))); } catch (e) { } }
  var FOGGED = ['observatory', 'owl'];

  /* ---------- phần tử ---------- */
  var map = $('#map'), vp = $('#mpVp'), worldEl = $('#mpWorld'), cloudsEl = $('#mpClouds'), fxC = $('#mpFx'), fx = fxC.getContext('2d'),
    fgEl = $('#mpFg'), tip = $('#mpTip'), panel = $('#mpPanel'), book = $('#mpBook'), dais = $('#mpDais'), say = $('#mpSay'),
    listEl = $('#mpList'), listBtn = $('#mpListBtn'), toast = $('#mpToast');
  var W = 0, H = 0, DPR = 1, built = false, isOpen = false, opener = null;
  var cam = { x: 800, y: 505, s: 1 }, tween = null, inertia = null, idleT = 0;
  var svg, gRot, plqG, stoneEls = [], dense = [], locEls = {}, plqEls = {}, fogEls = {};
  var hoverId = null, curId = null, panelId = null, pending = [];
  var RA = -1.2 * Math.PI / 180, RC = Math.cos(RA), RS = Math.sin(RA);
  function rot(x, y) { var dx = x - 800, dy = y - 500; return [800 + dx * RC - dy * RS, 500 + dx * RS + dy * RC]; }
  function toScreen(wx, wy) { return [(wx - cam.x) * cam.s + W / 2, (wy - cam.y) * cam.s + H / 2]; }
  function locTop(L) { return L.top * L.sc; }

  function build() {
    var w = I.world();
    dense = w.dense;
    var s = '<svg xmlns="' + NS + '" viewBox="0 0 1600 1000" width="1600" height="1000">' + w.back +
      '<g transform="rotate(-1.2 800 500)">' + w.base + '<g id="mpStones"></g>' + w.bridges + w.items +
      '<g id="mpFogs">' + FOGGED.map(w.fog).join('') + '</g><g id="mpCat"></g><g id="mpPlq"></g></g></svg>';
    worldEl.innerHTML = s;
    svg = worldEl.firstChild;
    var stG = $('#mpStones', svg);
    stoneEls = w.stones.map(function (p) {
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'stn'); g.dataset.seg = p.seg;
      g.innerHTML = '<ellipse cx="' + (p.x + 1.5).toFixed(1) + '" cy="' + (p.y + 3).toFixed(1) + '" rx="8.5" ry="6" fill="#8C7A50" opacity=".45"/>' +
        '<ellipse class="stn-m" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" rx="8.5" ry="6.2" fill="#FFFDF5" stroke="#B9A87A" stroke-width="2.2"/>' +
        '<ellipse cx="' + (p.x - 2).toFixed(1) + '" cy="' + (p.y - 2).toFixed(1) + '" rx="3.5" ry="2" fill="#fff" opacity=".8"/>';
      stG.appendChild(g); return { el: g, seg: p.seg, x: p.x, y: p.y };
    });
    $$('.loc', svg).forEach(function (g) { locEls[g.dataset.loc] = g; });
    $$('.fog', svg).forEach(function (g) { fogEls[g.dataset.fog] = g; });
    plqG = $('#mpPlq', svg);
    LOC.forEach(function (L, i) {
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'plq'); g.dataset.loc = L.id; g.style.setProperty('--d', i);
      plqG.appendChild(g); plqEls[L.id] = g;
    });
    $('#mpCat', svg).innerHTML = '<g id="mpCatG"><ellipse cx="4" cy="2" rx="24" ry="7" fill="#1B0F5C" opacity=".3" filter="url(#soft)"/><g id="mpCatB"><use href="#cat" x="-33" y="-66" width="66" height="70"/></g></g>';
    fgEl.innerHTML =
      '<svg class="mp-fg-tl" viewBox="-20 0 280 160" preserveAspectRatio="xMinYMin meet">' + w.fg.tl + '</svg>' +
      '<svg class="mp-fg-bl" viewBox="-60 790 280 240" preserveAspectRatio="xMinYMax meet">' + w.fg.bl + '</svg>' +
      '<svg class="mp-fg-br" viewBox="1340 790 280 240" preserveAspectRatio="xMaxYMax meet">' + w.fg.br + '</svg>';
    cloudsEl.innerHTML = [[200, 520, 90, -10], [420, 360, 120, -60], [700, 300, 105, -35], [140, 760, 140, -95]].map(function (c) {
      return '<svg class="mp-cloud" viewBox="0 0 300 140" style="top:' + c[0] + 'px;--w:' + c[1] + 'px;--t:' + c[2] + 's;--dl:' + c[3] + 's" aria-hidden="true">' +
        '<g fill="#1B0F5C" opacity=".14" transform="translate(30 70)"><circle cx="70" cy="60" r="40"/><circle cx="130" cy="44" r="54"/><circle cx="200" cy="62" r="40"/><rect x="40" y="62" width="200" height="40" rx="20"/></g>' +
        '<g fill="#fff"><circle cx="70" cy="60" r="40"/><circle cx="130" cy="44" r="54"/><circle cx="200" cy="62" r="40"/><rect x="40" y="62" width="200" height="40" rx="20"/></g></svg>';
    }).join('');
    // danh sách địa điểm
    listEl.innerHTML = '<p class="mp-list-h">Các địa điểm</p>' + LOC.map(function (L) {
      return '<button type="button" class="mp-li" data-go="' + L.id + '"><b>' + L.n + '</b><span>' + L.name + '<small>' + L.cat + '</small></span><i class="mp-li-star"></i></button>';
    }).join('') + '<button type="button" class="mp-reset" id="mpReset">Chơi lại từ đầu</button>';
    built = true;
    refreshAll(false);
  }

  function maxIdx() { var m = -1; visited.forEach(function (id) { m = Math.max(m, I.PIDX[id]); }); return m; }
  function plqState(id) { if (hoverId === id) return 'hov'; if (fogEls[id] && !fogEls[id].classList.contains('gone') && !visited.has(id)) return 'fog'; if (visited.has(id)) return 'done'; if (curId === id) return 'cur'; return ''; }
  function renderPlaque(id) {
    var L = byId[id], ax = L.x, ay = L.y - locTop(L) * (hoverId === id ? 1.07 : 1) - (hoverId === id ? 6 : 0);
    plqEls[id].innerHTML = '<g class="plq-in">' + I.plaque(L, plqState(id), ax, ay) + '</g>';
  }
  function refreshAll() {
    var m = maxIdx();
    stoneEls.forEach(function (s) { s.el.classList.toggle('on', s.seg < m); });
    FOGGED.forEach(function (id) { fogEls[id].classList.toggle('gone', visited.has(id)); });
    LOC.forEach(function (L) { renderPlaque(L.id); });
    updateQuest(false);
    $$('.mp-li', listEl).forEach(function (b) { b.classList.toggle('done', visited.has(b.dataset.go)); });
  }
  function updateQuest(popNew) {
    $('#mpCount').textContent = visited.size;
    var stars = $$('#mpStars i');
    stars.forEach(function (st, i) {
      var on = i < visited.size;
      if (on && !st.classList.contains('on') && popNew) { st.classList.add('pop'); setTimeout(function () { st.classList.remove('pop'); }, 700); }
      st.classList.toggle('on', on);
    });
  }

  /* ---------- camera ---------- */
  function limits() {
    var fitAll = Math.min(W / 1360, H / 900), def = W < 700 ? Math.max(fitAll, Math.min(0.75, H / 1150)) : fitAll;
    return { min: Math.min(fitAll * 0.9, def), max: 2.4, def: def };
  }
  function clampCam(c) {
    var lim = limits(); c.s = clamp(c.s, lim.min, lim.max);
    var hw = W / 2 / c.s, hh = H / 2 / c.s, x0 = 90, x1 = 1510, y0 = 40, y1 = 975;
    c.x = (x1 - x0 < hw * 2) ? 800 : clamp(c.x, x0 + hw, x1 - hw);
    c.y = (y1 - y0 < hh * 2) ? 505 : clamp(c.y, y0 + hh, y1 - hh);
    return c;
  }
  function applyCam() {
    var tx = W / 2 - cam.x * cam.s, ty = H / 2 - cam.y * cam.s;
    var t = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + cam.s.toFixed(4) + ')';
    worldEl.style.transform = t; cloudsEl.style.transform = t;
    var ds = cam.s * 0.97;
    vp.style.backgroundSize = '100% ' + (228 * ds).toFixed(1) + 'px';
    vp.style.backgroundPosition = '0 ' + (H / 2 - (505 + (cam.y - 505) * 0.9) * ds).toFixed(1) + 'px';
    fgEl.style.transform = 'translate(' + clamp(-(cam.x - 800) * 0.05, -26, 26).toFixed(1) + 'px,' + clamp(-(cam.y - 505) * 0.05, -18, 18).toFixed(1) + 'px)';
    if (hoverId) placeTip(hoverId);
  }
  function moving() {
    worldEl.style.willChange = 'transform';
    clearTimeout(idleT);
    idleT = setTimeout(function () { worldEl.style.willChange = 'auto'; }, 260);
  }
  function setCam(x, y, s) { cam.x = x; cam.y = y; cam.s = s; clampCam(cam); applyCam(); moving(); }
  function flyTo(x, y, s, dur, cb) {
    var to = clampCam({ x: x, y: y, s: s });
    inertia = null;
    if (reduce || !dur) { setCam(to.x, to.y, to.s); if (cb) cb(); return; }
    tween = { from: { x: cam.x, y: cam.y, s: cam.s }, to: to, t0: performance.now(), dur: dur, cb: cb };
  }
  function zoomAt(sx, sy, ns) {
    var wx = cam.x + (sx - W / 2) / cam.s, wy = cam.y + (sy - H / 2) / cam.s, lim = limits();
    ns = clamp(ns, lim.min, lim.max);
    setCam(wx - (sx - W / 2) / ns, wy - (sy - H / 2) / ns, ns);
  }
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ---------- mèo dẫn đường ---------- */
  var catI = 0, catTarget = 0, catEl, catBody, catAcc = 0;
  function denseIdx(id) {
    var k = I.PIDX[id];
    if (k >= I.PATH.length - 1) return dense.length - 1;
    for (var i = 0; i < dense.length; i++) if (dense[i].seg >= k) return i;
    return dense.length - 1;
  }
  function catWalkTo(id) { catTarget = denseIdx(id); curId = id; }
  function catPos() {
    var i0 = Math.floor(catI), i1 = Math.min(dense.length - 1, i0 + 1), f = catI - i0;
    return [dense[i0].x + (dense[i1].x - dense[i0].x) * f, dense[i0].y + (dense[i1].y - dense[i0].y) * f];
  }
  function updateCat(now, dt) {
    if (!catEl) { catEl = $('#mpCatG', svg); catBody = $('#mpCatB', svg); }
    var walking = Math.abs(catTarget - catI) > 0.01;
    if (walking) {
      var step = (reduce ? 999 : 0.085) * dt, dir = catTarget > catI ? 1 : -1;
      catI += dir * Math.min(step, Math.abs(catTarget - catI));
      catAcc += step * 4;
      if (catAcc > 34) { catAcc = 0; var cp = catPos(), r = rot(cp[0], cp[1]); addP(r[0], r[1] - 4, { world: true, sp: rand(0.2, 0.6), up: 0.4, r: rand(2, 3.6), max: 600 }); }
    }
    var p = catPos();
    var hop = walking ? Math.abs(Math.sin(now / 75)) * 8 : Math.sin(now / 650) * 1.5, tilt = walking ? Math.sin(now / 75) * 7 : 0;
    catEl.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
    catBody.setAttribute('transform', 'translate(0 ' + (-hop).toFixed(1) + ') rotate(' + tilt.toFixed(1) + ')');
    if (!say.hidden) {
      var r2 = rot(p[0], p[1] - 80), sp = toScreen(r2[0], r2[1]), bw = say.offsetWidth || 220;
      var off = sp[0] < -20 || sp[0] > W + 20 || sp[1] < 60 || sp[1] > H + 40;
      say.style.visibility = off ? 'hidden' : 'visible';
      say.style.transform = 'translate(' + clamp(sp[0] - bw / 2, 8, W - bw - 8).toFixed(0) + 'px,' + sp[1].toFixed(0) + 'px) translateY(-100%)';
    }
  }

  /* ---------- hiệu ứng trên canvas ---------- */
  var parts = [], motes = [];
  function addP(x, y, o) {
    if (reduce || parts.length > 500) return;
    o = o || {};
    var a = o.a != null ? o.a : rand(0, 6.283), sp = o.sp != null ? o.sp : rand(0.3, 1.6);
    parts.push({ x: x, y: y, world: !!o.world, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), g: o.g != null ? o.g : 0.02, life: 0, max: o.max || rand(500, 1000), r: o.r || rand(2, 5), c: o.c || ['#FFD54A', '#FFFFFF', '#FFB0DC', '#CFC6FF'][(Math.random() * 4) | 0] });
  }
  function burstWorld(x, y, n, spd) { for (var i = 0; i < n; i++) addP(x, y, { world: true, a: i / n * 6.283 + rand(-0.2, 0.2), sp: rand(1, spd || 3.5), g: 0.03, max: rand(600, 1100), r: rand(2.5, 5.5) }); }
  function burstScreen(x, y, n, spd) { for (var i = 0; i < n; i++) addP(x, y, { a: i / n * 6.283 + rand(-0.2, 0.2), sp: rand(1.5, spd || 5), g: 0.05, max: rand(700, 1200), r: rand(3, 6.5) }); }
  function sparkPath(x, y, r) {
    var k = r * 0.2;
    fx.beginPath(); fx.moveTo(x, y - r); fx.quadraticCurveTo(x + k, y - k, x + r, y); fx.quadraticCurveTo(x + k, y + k, x, y + r);
    fx.quadraticCurveTo(x - k, y + k, x - r, y); fx.quadraticCurveTo(x - k, y - k, x, y - r); fx.closePath();
  }
  function initMotes() {
    motes = [];
    var n = clamp(Math.round(W * H / 26000), 16, 60);
    for (var i = 0; i < n; i++) motes.push({ x: rand(0, W), y: rand(0, H), r: rand(1.2, 3.2), sp: rand(0.08, 0.3), ph: rand(0, 6.28), c: Math.random() < 0.7 ? '255,214,90' : '255,255,255' });
  }
  function drawFx(now, dt) {
    fx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fx.clearRect(0, 0, W, H);
    fx.globalCompositeOperation = 'lighter';
    // quầng sáng lâu đài
    var c = rot(800, 560), cs = toScreen(c[0], c[1]), cr = 230 * cam.s, a = reduce ? 0.18 : 0.16 + 0.1 * Math.sin(now / 900);
    var g = fx.createRadialGradient(cs[0], cs[1], 0, cs[0], cs[1], cr);
    g.addColorStop(0, 'rgba(255,214,110,' + a + ')'); g.addColorStop(1, 'rgba(255,214,110,0)');
    fx.fillStyle = g; fx.fillRect(cs[0] - cr, cs[1] - cr, cr * 2, cr * 2);
    // bụi sáng bay lơ lửng
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      if (!reduce) { m.y -= m.sp * dt / 16.67; m.x += Math.sin(now / 1400 + m.ph) * 0.2; if (m.y < -10) { m.y = H + 10; m.x = rand(0, W); } }
      var tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now / 500 + m.ph));
      fx.fillStyle = 'rgba(' + m.c + ',' + (tw * 0.85).toFixed(3) + ')';
      fx.beginPath(); fx.arc(m.x, m.y, m.r, 0, 6.283); fx.fill();
    }
    fx.globalCompositeOperation = 'source-over';
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j];
      p.life += dt;
      if (p.life >= p.max) { parts.splice(j, 1); continue; }
      var f = dt / 16.67; p.x += p.vx * f; p.y += p.vy * f; p.vy += p.g * f; p.vx *= 0.985;
      var t = p.life / p.max, r = p.r * (t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8 * 0.9);
      var q = p.world ? toScreen(p.x, p.y) : [p.x, p.y], rr = p.world ? r * clamp(cam.s, 0.6, 1.6) : r;
      fx.globalAlpha = 1 - t * t; fx.fillStyle = p.c; sparkPath(q[0], q[1], Math.max(0.3, rr)); fx.fill();
    }
    fx.globalAlpha = 1;
    if (hoverId && !reduce && Math.random() < dt / 16.67 * 0.25) {
      var L = byId[hoverId], hp = rot(L.x + rand(-80, 80), L.y - rand(0, locTop(L)));
      addP(hp[0], hp[1], { world: true, sp: rand(0.1, 0.5), up: 0.5, g: 0, max: rand(500, 900), r: rand(2, 4.5), c: Math.random() < 0.6 ? '#FFD54A' : '#FFFFFF' });
    }
  }

  /* ---------- vòng lặp ---------- */
  var last = 0;
  function loop(now) {
    if (!isOpen) return;
    var dt = Math.min(50, now - (last || now)); last = now;
    if (tween) {
      var tp = clamp((now - tween.t0) / tween.dur, 0, 1), e = ease(tp);
      cam.x = tween.from.x + (tween.to.x - tween.from.x) * e;
      cam.y = tween.from.y + (tween.to.y - tween.from.y) * e;
      cam.s = tween.from.s * Math.pow(tween.to.s / tween.from.s, e);
      applyCam(); moving();
      if (tp >= 1) { var cb = tween.cb; tween = null; if (cb) cb(); }
    } else if (inertia) {
      cam.x -= inertia.vx * dt; cam.y -= inertia.vy * dt;
      var k = Math.pow(0.9, dt / 16.67); inertia.vx *= k; inertia.vy *= k;
      clampCam(cam); applyCam(); moving();
      if (Math.abs(inertia.vx) + Math.abs(inertia.vy) < 0.004) inertia = null;
    }
    updateCat(now, dt);
    drawFx(now, dt);
    requestAnimationFrame(loop);
  }

  /* ---------- tooltip ---------- */
  function placeTip(id) {
    if (tip.hidden || !fine) return;
    var L = byId[id], p = rot(L.x, L.y - locTop(L) * 0.55), sp = toScreen(p[0], p[1]);
    var off = 110 * cam.s * L.sc + 14, tw = tip.offsetWidth || 260, th = tip.offsetHeight || 150, x = sp[0] + off, right = true;
    if (x + tw > W - 16) { x = sp[0] - off - tw; right = false; }
    var y = clamp(sp[1] - th / 2, 70, H - th - 70);
    tip.style.transform = 'translate(' + Math.round(clamp(x, 12, W - tw - 12)) + 'px,' + Math.round(y) + 'px)';
    tip.classList.toggle('left', !right);
  }
  function setHover(id) {
    if (hoverId === id) return;
    var prev = hoverId; hoverId = id;
    if (prev && locEls[prev]) { locEls[prev].classList.remove('hov'); renderPlaque(prev); }
    if (id) {
      locEls[id].classList.add('hov'); renderPlaque(id);
      if (fine) {
        var L = byId[id];
        tip.innerHTML = '<h3>' + L.name + '</h3><span class="mp-pill">' + L.cat + '</span><p>' + INFO[id].desc + '</p><span class="mp-go">' + (visited.has(id) ? 'Ghé lại' : 'Nhấn để khám phá') + ' →</span>';
        tip.hidden = false; placeTip(id);
      }
    } else tip.hidden = true;
  }

  /* ---------- mở địa điểm ---------- */
  function daisSVG(id) {
    var L = byId[id], k = id === 'castle' ? 0.9 : 1.25, top = L.top * k * 1.05 + 46, e1 = 140, e2 = 52;
    var vb = '-175 ' + (-top) + ' 350 ' + (top + 90);
    var sp = '';
    for (var i = 0; i < 6; i++) sp += '<g class="dsp" style="--i:' + i + '">' + I.spark(Math.round(rand(-150, 150)), -Math.round(rand(30, top - 20)), Math.round(rand(5, 10)), i % 2 ? '#FFD54A' : '#FFFFFF') + '</g>';
    return '<svg viewBox="' + vb + '" aria-hidden="true">' +
      '<ellipse cx="0" cy="30" rx="' + e1 + '" ry="' + e2 + '" fill="#2E2080"/><ellipse cx="0" cy="22" rx="' + e1 + '" ry="' + e2 + '" fill="#5843D6" stroke="#2E2080" stroke-width="3"/>' +
      '<ellipse cx="0" cy="10" rx="' + e1 + '" ry="' + e2 + '" fill="#EDE4FF" stroke="#2E2080" stroke-width="3"/>' +
      '<ellipse class="dais-ring" cx="0" cy="10" rx="' + (e1 - 18) + '" ry="' + (e2 - 12) + '" fill="none" stroke="#A99BFF" stroke-width="5" stroke-dasharray="2 13" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="-40" rx="150" ry="120" fill="url(#castleGlow)" opacity=".8"/>' +
      '<g class="dais-b"><g transform="translate(-6 14) scale(' + k + ')">' + I.stripGlow(L.draw()) + '</g></g>' + sp + '</svg>';
  }
  function fillPanel(id) {
    panelId = id;
    dais.innerHTML = daisSVG(id);
    book.innerHTML = bookHTML(id);
    var i = ORDER.indexOf(id);
    $('#mpPrev').disabled = false; $('#mpNext').disabled = false;
    $('#mpPrev').setAttribute('aria-label', 'Trước: ' + byId[ORDER[(i + 7) % 8]].name);
    $('#mpNext').setAttribute('aria-label', 'Tiếp: ' + byId[ORDER[(i + 1) % 8]].name);
    var toInv = $('#mpToInvite', book);
    if (toInv) toInv.addEventListener('click', function () { closeMap(function () { var t = document.getElementById('thu-moi'); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }); });
  }
  function markVisited(id) {
    if (visited.has(id)) return;
    visited.add(id); saveVisited(); pending.push(id);
    $$('.mp-li', listEl).forEach(function (b) { b.classList.toggle('done', visited.has(b.dataset.go)); });
  }
  function showPanel(id) {
    fillPanel(id);
    panel.hidden = false;
    panel.classList.remove('out');
    void panel.offsetWidth;
    panel.classList.add('in');
    markVisited(id);
    burstScreen(W / 2, H / 2, 26, 6);
    setTimeout(function () { $('#mpClose').focus({ preventScroll: true }); }, 50);
  }
  function openLoc(id) {
    if (!byId[id]) return;
    setHover(null);
    say.hidden = true;
    catWalkTo(id);
    var L = byId[id], c = rot(L.x, L.y - locTop(L) * 0.45);
    var ts = Math.max(Math.min(cam.s, 1.9), W < 700 ? 0.95 : 1.45);
    burstWorld(c[0], c[1] - 30, 16, 3);
    if (panelId) {
      book.classList.remove('flip-in'); book.classList.add('flip-out');
      setTimeout(function () {
        fillPanel(id); markVisited(id);
        book.classList.remove('flip-out'); void book.offsetWidth; book.classList.add('flip-in');
      }, reduce ? 0 : 200);
      flyTo(c[0], c[1], ts, 700);
      return;
    }
    flyTo(c[0], c[1], ts, 800, function () { showPanel(id); });
  }
  function closePanel() {
    if (!panelId) return;
    var id = panelId; panelId = null;
    panel.classList.remove('in'); panel.classList.add('out');
    setTimeout(function () { panel.hidden = true; panel.classList.remove('out'); dais.innerHTML = ''; book.innerHTML = ''; }, reduce ? 0 : 260);
    runPending();
    if (locEls[id]) locEls[id].focus({ preventScroll: true });
  }
  function runPending() {
    var ids = pending.slice(); pending = [];
    if (!ids.length) return;
    setTimeout(function () { updateQuest(true); }, 280);
    var m = maxIdx(), lit = stoneEls.filter(function (s) { return s.seg < m && !s.el.classList.contains('on'); });
    lit.forEach(function (s, k) {
      setTimeout(function () {
        s.el.classList.add('on', 'flash');
        setTimeout(function () { s.el.classList.remove('flash'); }, 520);
        if (k % 3 === 0) { var r = rot(s.x, s.y); addP(r[0], r[1], { world: true, sp: rand(0.3, 1), up: 0.6, r: rand(2, 4), max: 600 }); }
      }, 260 + k * (reduce ? 0 : 38));
    });
    ids.forEach(function (id, n) {
      setTimeout(function () {
        if (fogEls[id] && !fogEls[id].classList.contains('gone')) {
          fogEls[id].classList.add('gone');
          var L = byId[id], fp = rot(L.x, L.y - 60); burstWorld(fp[0], fp[1], 24, 4);
        }
        renderPlaque(id);
        var g = plqEls[id]; g.classList.remove('fresh'); void g.getBoundingClientRect(); g.classList.add('fresh');
        var L2 = byId[id], pp = rot(L2.x, L2.y - locTop(L2) - 40); burstWorld(pp[0], pp[1], 14, 3);
      }, 300 + n * 120);
    });
    if (visited.size === 8) {
      setTimeout(function () {
        toast.hidden = false; toast.classList.remove('show'); void toast.offsetWidth; toast.classList.add('show');
        for (var i = 0; i < 5; i++) burstScreen(rand(W * 0.2, W * 0.8), rand(H * 0.25, H * 0.6), 22, 7);
      }, 900);
    }
  }

  /* ---------- tương tác con trỏ ---------- */
  var ptrs = new Map(), drag = null, pinch = null;
  function locFrom(t) { var g = t && t.closest && t.closest('[data-loc]'); return g ? g.dataset.loc : null; }
  vp.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { vp.setPointerCapture(e.pointerId); } catch (err) { }
    tween = null; inertia = null;
    if (ptrs.size === 1) {
      drag = { lx: e.clientX, ly: e.clientY, moved: 0, loc: locFrom(e.target), vx: 0, vy: 0, t: performance.now() };
      vp.classList.add('grabbing');
    } else if (ptrs.size === 2) {
      var a = Array.from(ptrs.values()), mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
      pinch = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), s: cam.s, wx: cam.x + (mx - W / 2) / cam.s, wy: cam.y + (my - H / 2) / cam.s };
      if (drag) drag.moved = 99;
    }
  });
  vp.addEventListener('pointermove', function (e) {
    if (!ptrs.has(e.pointerId)) {
      if (e.pointerType === 'mouse' && !panelId) setHover(locFrom(e.target));
      return;
    }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size >= 2 && pinch) {
      var a = Array.from(ptrs.values()), mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2, d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      var lim = limits(), ns = clamp(pinch.s * d / Math.max(1, pinch.d), lim.min, lim.max);
      setCam(pinch.wx - (mx - W / 2) / ns, pinch.wy - (my - H / 2) / ns, ns);
    } else if (drag) {
      var dx = e.clientX - drag.lx, dy = e.clientY - drag.ly, now = performance.now(), dtm = Math.max(1, now - drag.t);
      drag.lx = e.clientX; drag.ly = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved > 6) {
        if (hoverId) setHover(null);
        setCam(cam.x - dx / cam.s, cam.y - dy / cam.s, cam.s);
        drag.vx = drag.vx * 0.6 + (dx / cam.s / dtm) * 0.4; drag.vy = drag.vy * 0.6 + (dy / cam.s / dtm) * 0.4; drag.t = now;
      }
    }
  });
  function endPtr(e) {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (ptrs.size === 0 && drag) {
      vp.classList.remove('grabbing');
      if (drag.moved <= 6 && e.type === 'pointerup') {
        if (drag.loc) openLoc(drag.loc);
        else burstScreen(e.clientX, e.clientY, 10, 3);
      } else if (!reduce && performance.now() - drag.t < 80 && (Math.abs(drag.vx) + Math.abs(drag.vy)) > 0.05) {
        inertia = { vx: drag.vx, vy: drag.vy };
      }
      drag = null;
    }
  }
  vp.addEventListener('pointerup', endPtr);
  vp.addEventListener('pointercancel', endPtr);
  vp.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !ptrs.size) setHover(null); });
  vp.addEventListener('wheel', function (e) {
    e.preventDefault();
    tween = null; inertia = null;
    var f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016));
    zoomAt(e.clientX, e.clientY, cam.s * f);
  }, { passive: false });
  vp.addEventListener('focusin', function (e) { var id = locFrom(e.target); if (id && !panelId) setHover(id); });
  vp.addEventListener('focusout', function () { if (!panelId) setHover(null); });
  vp.addEventListener('keydown', function (e) {
    var id = locFrom(e.target);
    if (id && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLoc(id); }
  });
  $('#mpZin').addEventListener('click', function () { flyTo(cam.x, cam.y, cam.s * 1.35, 320); });
  $('#mpZout').addEventListener('click', function () { flyTo(cam.x, cam.y, cam.s / 1.35, 320); });
  $('#mpZreset').addEventListener('click', function () { flyTo(800, 505, limits().def, 700); });
  $('#mpBack').addEventListener('click', function () { closeMap(); });
  $('#mpClose').addEventListener('click', closePanel);
  $('#mpPrev').addEventListener('click', function () { openLoc(ORDER[(ORDER.indexOf(panelId) + 7) % 8]); });
  $('#mpNext').addEventListener('click', function () { openLoc(ORDER[(ORDER.indexOf(panelId) + 1) % 8]); });
  panel.addEventListener('click', function (e) {
    if (e.target === panel) { closePanel(); return; }
    var cp = e.target.closest('[data-copy]');
    if (cp) {
      var txt = cp.dataset.copy, ok = function () { cp.textContent = 'Đã chép'; setTimeout(function () { cp.textContent = 'Chép'; }, 1600); };
      var fallback = function () { var sel = cp.parentNode.querySelector('.sel'); if (sel) { var r = document.createRange(); r.selectNodeContents(sel); var ws = window.getSelection(); ws.removeAllRanges(); ws.addRange(r); cp.textContent = 'Đã chọn, nhấn Ctrl+C'; } };
      try { navigator.clipboard.writeText(txt).then(ok, fallback); } catch (err) { fallback(); }
      return;
    }
    var card = e.target.closest('.mp-card');
    if (card && panelId) {
      var sc = $('#mpScroll', book), keep = sc.innerHTML;
      sc.innerHTML = projectDetail(+card.dataset.proj); sc.scrollTop = 0;
      var r = card.getBoundingClientRect(); burstScreen(r.left + r.width / 2, r.top + r.height / 2, 14, 4);
      $('#mpDback', sc).addEventListener('click', function () { sc.innerHTML = keep; });
      $('#mpDback', sc).focus({ preventScroll: true });
      map.scrollTop = 0; panel.scrollTop = 0;
    }
  });
  listBtn.addEventListener('click', function () {
    var open = listEl.hidden; listEl.hidden = !open; listBtn.setAttribute('aria-expanded', String(open));
  });
  listEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (b) { listEl.hidden = true; listBtn.setAttribute('aria-expanded', 'false'); openLoc(b.dataset.go); return; }
    if (e.target.id === 'mpReset') {
      visited.clear(); saveVisited(); pending = [];
      FOGGED.forEach(function (id) { fogEls[id].classList.remove('gone'); });
      catWalkTo('home'); refreshAll(); listEl.hidden = true; listBtn.setAttribute('aria-expanded', 'false');
      flyTo(800, 505, limits().def, 700);
    }
  });
  $('#mpToastClose').addEventListener('click', function () { toast.hidden = true; });
  $('#mpToastGo').addEventListener('click', function () { toast.hidden = true; openLoc('castle'); });
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { if (!listEl.hidden) { listEl.hidden = true; listBtn.setAttribute('aria-expanded', 'false'); } else if (panelId) closePanel(); else closeMap(); }
    else if (!panelId && (e.key === '+' || e.key === '=')) flyTo(cam.x, cam.y, cam.s * 1.35, 300);
    else if (!panelId && (e.key === '-' || e.key === '_')) flyTo(cam.x, cam.y, cam.s / 1.35, 300);
  });

  /* ---------- mở / đóng bản đồ ---------- */
  function resize() {
    W = window.innerWidth; H = window.innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1);
    fxC.width = Math.round(W * DPR); fxC.height = Math.round(H * DPR);
    initMotes(); clampCam(cam); applyCam();
  }
  window.addEventListener('resize', function () { if (isOpen) resize(); });
  function openMap(btn) {
    if (isOpen) return;
    opener = btn || null;
    var r = btn && btn.getBoundingClientRect ? btn.getBoundingClientRect() : null;
    var ox = r ? r.left + r.width / 2 : window.innerWidth / 2, oy = r ? r.top + r.height / 2 : window.innerHeight / 2;
    var go = function () {
      if (!built) build();
      isOpen = true;
      document.documentElement.classList.add('map-open');
      map.hidden = false; map.setAttribute('aria-hidden', 'false');
      resize();
      var lim = limits(), first = !map.dataset.seen;
      catI = catTarget = curId ? denseIdx(curId) : (visited.size ? denseIdx(Array.from(visited).pop()) : 0);
      if (!curId) curId = visited.size ? Array.from(visited).pop() : 'home';
      if (!reduce) {
        map.style.transition = 'none';
        map.style.clipPath = 'circle(0px at ' + ox + 'px ' + oy + 'px)';
        void map.offsetWidth;
        map.style.transition = '';
        map.style.clipPath = 'circle(' + Math.hypot(W, H) + 'px at ' + ox + 'px ' + oy + 'px)';
      } else map.style.clipPath = 'none';
      if (first && !reduce) {
        svg.classList.add('intro');
        setTimeout(function () { svg.classList.remove('intro'); }, 3200);
        var c = rot(800, 560); setCam(c[0], c[1] - 60, lim.def * 1.8);
        setTimeout(function () { flyTo(800, 505, lim.def, 1700); }, 350);
      } else setCam(800, 505, lim.def);
      map.dataset.seen = '1';
      say.hidden = true;
      if (!visited.size) { setTimeout(function () { if (isOpen && !panelId) say.hidden = false; }, first && !reduce ? 2200 : 300); setTimeout(function () { say.hidden = true; }, 11000); }
      last = 0; requestAnimationFrame(loop);
      setTimeout(function () { $('#mpBack').focus({ preventScroll: true }); }, 60);
    };
    var fontReady = (document.fonts && document.fonts.load) ? Promise.race([Promise.all([document.fonts.load('800 20px "Baloo 2"', 'Lâu Đài Tốt Nghiệp'), document.fonts.load('800 13px Nunito', 'Dự án')]), new Promise(function (res) { setTimeout(res, 1500); })]) : Promise.resolve();
    fontReady.then(go, go);
  }
  function closeMap(after) {
    if (!isOpen) return;
    if (panelId) { panelId = null; panel.hidden = true; panel.classList.remove('in'); runPending(); }
    setHover(null); listEl.hidden = true; toast.hidden = true;
    var r = opener && opener.getBoundingClientRect ? opener.getBoundingClientRect() : null;
    var ox = r && r.width ? r.left + r.width / 2 : W / 2, oy = r && r.width ? r.top + r.height / 2 : H / 2;
    var done = function () {
      isOpen = false; map.hidden = true; map.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('map-open');
      if (opener && opener.focus && document.body.contains(opener)) opener.focus({ preventScroll: true });
      if (after) after();
    };
    if (reduce) { done(); return; }
    map.style.clipPath = 'circle(0px at ' + ox + 'px ' + oy + 'px)';
    setTimeout(done, 650);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-open-map]');
    if (b) { e.preventDefault(); openMap(b); }
  });

  /* ---------- hình minh họa ở mục giới thiệu ---------- */
  var art = document.getElementById('journeyArt');
  if (art) {
    var castleSvg = I.stripGlow(byId.castle.draw()), stones = '';
    for (var i = 0; i < 9; i++) { var t = i / 8, x = -250 + t * 200, y = 40 - Math.sin(t * Math.PI) * 26; stones += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="8" ry="5.6" fill="' + (i < 5 ? '#FFD866' : '#FFFDF5') + '" stroke="' + (i < 5 ? '#C99A2E' : '#B9A87A') + '" stroke-width="2"/>'; }
    art.innerHTML = '<svg viewBox="-300 -330 600 420" aria-hidden="true"><ellipse cx="0" cy="10" rx="290" ry="74" fill="#E9D4A0" stroke="#CDB67E" stroke-width="3"/>' +
      '<ellipse cx="0" cy="0" rx="290" ry="74" fill="#F4E6BE" stroke="#CDB67E" stroke-width="3"/>' + stones +
      '<ellipse cx="0" cy="-120" rx="190" ry="170" fill="url(#castleGlow)"/><g transform="translate(20 0) scale(.82)">' + castleSvg + '</g>' +
      I.tree(-200, 10, 0.9, '#57D2B6') + I.pine(220, 0, 1, '#9C7CF0') + I.tree(250, 40, 0.75, '#F7A8D8') + '<use href="#cat" x="-110" y="-38" width="56" height="60"/></svg>';
  }
  if (location.hash === '#ban-do') setTimeout(function () { openMap(null); }, 300);
  window.JourneyMap = { open: openMap, close: closeMap };
})();
