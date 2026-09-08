/* ============================================================================
   지역별 정적 페이지 생성기
     assets/js/region-data.js  ->  region/<slug>-vending.html  (시·군·구 234개)

   왜 정적으로 뽑나: region.html?area=... 같은 쿼리스트링 페이지는 검색엔진이
   거의 색인하지 않는다. "수원 무인자판기" 같은 지역 키워드로 노출되려면
   지역마다 실제 파일이 하나씩 있어야 한다. (hpos.co.kr 과 같은 방식)

   실행:  node _build/make-region-pages.js
          -> region/ 폴더를 통째로 다시 만들고 sitemap.xml 도 갱신한다.
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'region');
const SITE = 'https://pickfree.co.kr';
const OGIMG = SITE + '/assets/img/og-image.jpg';
const TEL = '010-6832-1994';
const TODAY = new Date().toISOString().slice(0, 10);

global.window = {};
require(path.join(ROOT, 'assets/js/region-data.js'));
const RDATA = window.RDATA, RDONGS = window.RDONGS;

const DONGMAP = {};
RDONGS.forEach(function (d) { DONGMAP[d[0]] = d[2]; });

const esc = function (s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
};

/* 지역마다 도입 문단을 조금씩 다르게 (얇은 중복 페이지가 되지 않도록) */
const INTRO = [
  function (a) { return a + '에서 무인자판기를 놓을 자리를 알려 주시면 담당자가 직접 찾아가 공간 크기와 전기 위치, 사람이 지나는 동선을 먼저 확인합니다. 자리에 안 맞는다고 판단되면 그 자리에서 솔직하게 말씀드립니다.'; },
  function (a) { return a + ' 무인자판기 설치는 자리를 보는 것에서 시작합니다. 방문해서 폭과 높이, 콘센트 위치, 하루 유동 인원을 확인한 다음 그 자리에 맞는 기종과 품목을 골라 드립니다.'; },
  function (a) { return a + '에 자판기를 놓기 전에 담당자가 현장을 먼저 봅니다. 같은 기종이라도 놓는 자리에 따라 잘 나가는 품목이 완전히 달라지기 때문에, 자리를 보지 않고 기종부터 정하지 않습니다.'; },
  function (a) { return a + ' 지역은 방문 상담으로 진행합니다. 설치할 공간의 크기와 전원, 주변에 어떤 사람들이 오가는지를 확인하고 음료·스낵·아이스크림·생활용품 중 무엇을 채울지 함께 정합니다.'; }
];

const VM = ['drink', 'snack', 'ice', 'multi'];

function page(ctx) {
  const prov = ctx.prov, provFormal = ctx.provFormal, gu = ctx.gu;
  const slug = ctx.slug, areaFull = ctx.areaFull, dongs = ctx.dongs;
  const siblings = ctx.siblings, idx = ctx.idx;

  const url = SITE + '/region/' + slug + '-vending.html';
  const title = areaFull + ' 무인자판기 설치 — 설치비 0원 · 24시간 무인운영 | 픽프리';
  const desc = provFormal + ' ' + areaFull + ' 무인자판기·무인키오스크 설치. 음료·커피, 스낵, 아이스크림, 생활용품, 복합 멀티자판기를 설치비 무료로 설치해 드립니다. 구입·렌탈·임대 선택 가능, 카드·간편결제 지원. 상담 ' + TEL + '.';
  const ogDesc = areaFull + ' 음료·스낵·아이스크림·생활용품 무인자판기 설치. 설치비 0원, 렌탈·임대 가능, 24시간 무인 운영.';

  const dongHtml = dongs.length
    ? dongs.map(function (n) {
        return '<a class="gu" href="' + slug + '-vending.html?dong=' + encodeURIComponent(n) + '">' + esc(n) + '</a>';
      }).join('')
    : '<span class="gu">동 단위 안내는 상담 시 확인해 드립니다</span>';

  const sibHtml = siblings.map(function (it) {
    const on = it[1] === slug
      ? ' style="background:var(--ink);color:#fff;border-color:var(--ink)"'
      : '';
    return '<a class="gu"' + on + ' href="' + it[1] + '-vending.html">' + esc(it[0]) + '</a>';
  }).join('');

  const faq = [
    [areaFull + '도 설치비가 정말 0원인가요?',
     '네. ' + areaFull + ' 지역도 설치비는 받지 않습니다. 자판기를 구입하실지, 렌탈이나 임대로 시작하실지만 정하시면 됩니다. 방문 상담과 자리 확인까지 비용이 들지 않습니다.'],
    [gu + '까지 직접 와서 봐 주시나요?',
     provFormal + ' ' + gu + ' 지역은 담당자가 방문해 자리를 확인한 뒤 진행합니다. 전화(' + TEL + ')로 위치와 업종을 알려 주시면 방문 일정을 잡아 드립니다.'],
    ['자판기에 무엇을 채울지는 어떻게 정하나요?',
     '자리를 보고 정합니다. ' + gu + '에서도 아파트 입구, 사무실, 헬스장, 스터디카페처럼 놓이는 자리에 따라 잘 나가는 품목이 다릅니다. 음료·커피, 스낵·과자, 아이스크림·냉동, 생활용품·잡화 중에서 자리에 맞게 구성해 드립니다.']
  ];

  /* 아코디언 마크업은 startup.html 과 동일해야 site.js 가 열고 닫는다
     (details/summary 아님 — button.acc__q + div.acc__a 구조) */
  const faqHtml = faq.map(function (qa) {
    return '      <div class="acc__item">\n' +
           '        <button class="acc__q" type="button" aria-expanded="false"><span>' + esc(qa[0]) + '</span><i></i></button>\n' +
           '        <div class="acc__a"><div>' + esc(qa[1]) + '</div></div>\n' +
           '      </div>';
  }).join('\n');

  const ldBreadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: '지역찾기', item: SITE + '/locations.html' },
      { '@type': 'ListItem', position: 3, name: areaFull + ' 무인자판기', item: url }
    ]
  };
  const ldService = {
    '@context': 'https://schema.org', '@type': 'Service',
    serviceType: '무인자판기 · 무인키오스크 설치',
    provider: { '@type': 'LocalBusiness', name: '픽프리 PICKFREE', telephone: '+82-10-6832-1994', url: SITE + '/' },
    areaServed: { '@type': 'AdministrativeArea', name: provFormal + ' ' + gu },
    description: ogDesc
  };
  const ldFaq = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(function (qa) {
      return { '@type': 'Question', name: qa[0], acceptedAnswer: { '@type': 'Answer', text: qa[1] } };
    })
  };

  return '<!DOCTYPE html>\n' +
'<html lang="ko">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'<link rel="icon" href="../favicon.svg" type="image/svg+xml">\n' +
'<title>' + esc(title) + '</title>\n' +
'<meta name="description" content="' + esc(desc) + '">\n' +
'<link rel="canonical" href="' + url + '">\n' +
'<meta name="robots" content="index, follow, max-image-preview:large">\n' +
'<meta name="keywords" content="' + esc(gu) + ' 무인자판기, ' + esc(areaFull) + ' 무인자판기 설치, ' + esc(gu) + ' 자동판매기, ' + esc(gu) + ' 무인키오스크, ' + esc(gu) + ' 자판기 임대, ' + esc(gu) + ' 자판기 렌탈, ' + esc(gu) + ' 무인창업">\n' +
'<meta property="og:type" content="website">\n' +
'<meta property="og:site_name" content="픽프리 PICKFREE">\n' +
'<meta property="og:title" content="' + esc(areaFull) + ' 무인자판기 설치 | 픽프리 PICKFREE">\n' +
'<meta property="og:description" content="' + esc(ogDesc) + '">\n' +
'<meta property="og:locale" content="ko_KR">\n' +
'<meta property="og:url" content="' + url + '">\n' +
'<meta property="og:image" content="' + OGIMG + '">\n' +
'<meta property="og:image:width" content="1200">\n' +
'<meta property="og:image:height" content="630">\n' +
'<meta name="twitter:card" content="summary_large_image">\n' +
'<meta name="twitter:image" content="' + OGIMG + '">\n' +
'<script type="application/ld+json">' + JSON.stringify(ldBreadcrumb) + '</script>\n' +
'<script type="application/ld+json">' + JSON.stringify(ldService) + '</script>\n' +
'<script type="application/ld+json">' + JSON.stringify(ldFaq) + '</script>\n' +
'<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css">\n' +
'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500&display=swap">\n' +
'<link rel="stylesheet" href="../assets/css/site.css">\n' +
'</head>\n' +
'<body>\n' +
'\n' +
'<header class="hdr">\n' +
'  <div class="wrap hdr__in">\n' +
'    <a class="logo" href="../index.html">\n' +
'      <span class="logo__mark">PICKFREE</span>\n' +
'      <span class="logo__sub">픽프리 무인자판기</span>\n' +
'    </a>\n' +
'    <nav class="nav">\n' +
'      <a href="../machines.html">자판기소개</a>\n' +
'      <a href="../locations.html" aria-current="page">지역찾기</a>\n' +
'      <a href="../installations.html">설치현황</a>\n' +
'      <a href="../startup.html">무인창업</a>\n' +
'    </nav>\n' +
'    <div class="hdr__cta">\n' +
'      <a class="hdr__tel" href="tel:01068321994">' + TEL + '</a>\n' +
'      <a class="btn btn--sm" href="../startup.html#contact">설치 상담</a>\n' +
'      <button class="burger" type="button" aria-label="메뉴 열기" aria-expanded="false"><span></span></button>\n' +
'    </div>\n' +
'  </div>\n' +
'  <div class="mnav">\n' +
'    <a href="../machines.html">자판기소개</a>\n' +
'    <a href="../locations.html">지역찾기</a>\n' +
'    <a href="../installations.html">설치현황</a>\n' +
'    <a href="../startup.html">무인창업</a>\n' +
'    <a class="btn" href="../startup.html#contact">무료 설치 상담 신청</a>\n' +
'  </div>\n' +
'</header>\n' +
'\n' +
'<section class="hero">\n' +
'  <div class="wrap hero__in">\n' +
'    <div>\n' +
'      <p class="crumb"><a href="../index.html">홈</a> &nbsp;/&nbsp; <a href="../locations.html">지역찾기</a> &nbsp;/&nbsp; <b id="crumbArea">' + esc(areaFull) + '</b></p>\n' +
'      <span class="eyebrow">' + esc(provFormal) + '</span>\n' +
'      <h1 class="display d1 hero__title" id="rTitle">' + esc(areaFull) + '<br><em style="font-style:normal;color:var(--clay)">무인자판기 설치</em></h1>\n' +
'      <p class="lead" id="rLead">' + esc(areaFull) + ' 지역 무인자판기·무인키오스크 설치를 진행합니다. 매장과 입지를 먼저 보고 자리에 맞는 기종과 품목을 골라 드리며, 설치비는 무료입니다.</p>\n' +
'      <div class="btns" style="margin-top:30px">\n' +
'        <a class="btn" href="tel:01068321994">' + TEL + ' 전화 상담 <span class="ar">→</span></a>\n' +
'        <a class="btn btn--ghost" href="../startup.html#contact">온라인 상담 신청</a>\n' +
'      </div>\n' +
'      <div class="hero__meta">\n' +
'        <div><strong>설치비 0원</strong><span>렌탈 · 임대 가능</span></div>\n' +
'        <div><strong>방문 상담</strong><span>입지 · 품목 분석</span></div>\n' +
'        <div><strong>간편결제</strong><span>카드 · 페이 · QR</span></div>\n' +
'      </div>\n' +
'    </div>\n' +
'    <div class="hero__art"><span data-vm="' + VM[idx % VM.length] + '"></span></div>\n' +
'  </div>\n' +
'</section>\n' +
'\n' +
'<section class="section">\n' +
'  <div class="wrap">\n' +
'    <div class="grid g2" style="gap:clamp(26px,4vw,56px);align-items:start">\n' +
'      <div class="rv">\n' +
'        <h2 class="display d2" id="rH2">' + esc(areaFull) + ' 무인자판기, 이렇게 설치합니다</h2>\n' +
'        <p class="lead mt-m" id="rBody1">' + esc(INTRO[idx % INTRO.length](areaFull)) + '</p>\n' +
'        <p class="lead mt-s">\n' +
'          음료·커피 자판기, 스낵·과자 자판기, 아이스크림·냉동 자판기, 생활용품·잡화 자판기,\n' +
'          복합(멀티) 자판기까지 매장과 입지에 맞춰 설치합니다. 무인매장·무인카페·셀프주문 매장에서\n' +
'          쓰는 무인키오스크 설치·렌탈·임대도 ' + esc(gu) + '에서 함께 진행합니다.\n' +
'        </p>\n' +
'        <p class="lead mt-s">\n' +
'          설치비는 무료이며 카드·삼성페이·카카오페이·네이버페이·QR 간편결제를 모두 지원합니다.\n' +
'          설치 후에는 매출과 재고를 원격으로 확인하실 수 있어 ' + esc(gu) + ' 안에 여러 대를 두셔도\n' +
'          직접 돌아다니지 않고 관리하실 수 있습니다.\n' +
'        </p>\n' +
'        <div class="btns mt-l">\n' +
'          <a class="btn btn--ghost" href="../machines.html">자판기 종류 보기 <span class="ar">→</span></a>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <div class="rv">\n' +
'        <div class="card">\n' +
'          <h3>' + esc(gu) + ' 동네별 안내</h3>\n' +
'          <p class="small" style="margin:6px 0 16px">아래 지역도 같은 담당자가 방문합니다.</p>\n' +
'          <div class="gu-list" id="rDongs">' + dongHtml + '</div>\n' +
'        </div>\n' +
'        <div class="card" style="margin-top:16px">\n' +
'          <h3>' + esc(prov) + ' 다른 지역</h3>\n' +
'          <p class="small" style="margin:6px 0 16px">지역을 바꿔서 확인해 보세요.</p>\n' +
'          <div class="gu-list">' + sibHtml + '</div>\n' +
'        </div>\n' +
'      </div>\n' +
'    </div>\n' +
'  </div>\n' +
'</section>\n' +
'\n' +
'<section class="section section--white">\n' +
'  <div class="wrap">\n' +
'    <div class="sec-head rv">\n' +
'      <span class="eyebrow">PLACEMENT</span>\n' +
'      <h2 class="display d2">' + esc(gu) + ', 이런 자리에 많이 설치합니다</h2>\n' +
'      <p class="lead">같은 자판기라도 어디에 두느냐에 따라 잘 나가는 품목이 다릅니다.</p>\n' +
'    </div>\n' +
'    <div class="grid g4">\n' +
'      <article class="card rv"><h3>아파트 · 오피스텔</h3><p>단지 입구·엘리베이터 홀. 생수·아이스크림·생필품이 꾸준합니다.</p></article>\n' +
'      <article class="card rv"><h3>사무실 · 공장</h3><p>커피·생수 회전이 빠르고, 교대 근무지는 야식·음료가 강합니다.</p></article>\n' +
'      <article class="card rv"><h3>헬스장 · 사우나</h3><p>이온·단백질 음료에 세면용품·수건 수요가 함께 붙습니다.</p></article>\n' +
'      <article class="card rv"><h3>스터디카페 · PC방</h3><p>커피·간식·컵라면. 무인 운영과 특히 잘 맞는 자리입니다.</p></article>\n' +
'      <article class="card rv"><h3>학교 · 관공서</h3><p>자동판매기·셀프자판기로 불리는 자리. 입찰 서류까지 함께 챙깁니다.</p></article>\n' +
'      <article class="card rv"><h3>병원 · 약국 주변</h3><p>음료와 함께 화장품·마스크 자판기 문의가 많습니다.</p></article>\n' +
'      <article class="card rv"><h3>캠핑장 · 펜션</h3><p>근처에 편의점이 없을수록 회전이 좋습니다.</p></article>\n' +
'      <article class="card rv"><h3>무인매장 · 무인점포</h3><p>키오스크와 함께 세팅해 24시간 직원 없이 운영합니다.</p></article>\n' +
'    </div>\n' +
'  </div>\n' +
'</section>\n' +
'\n' +
'<section class="section">\n' +
'  <div class="wrap wrap-narrow">\n' +
'    <div class="sec-head rv">\n' +
'      <span class="eyebrow">FAQ</span>\n' +
'      <h2 class="display d2">' + esc(areaFull) + ' 설치 문의</h2>\n' +
'    </div>\n' +
'    <div class="acc rv">\n' +
faqHtml + '\n' +
'    </div>\n' +
'  </div>\n' +
'</section>\n' +
'\n' +
'<section class="section section--ink">\n' +
'  <div class="wrap wrap-narrow" style="text-align:center">\n' +
'    <h2 class="display d2 rv" id="rCta">' + esc(areaFull) + ' 무인자판기 설치 상담</h2>\n' +
'    <p class="lead rv" style="margin:20px auto 0">설치비 무료 · 방문 입지 상담 · 구입 / 렌탈 / 임대 선택 가능</p>\n' +
'    <div class="btns rv" style="justify-content:center;margin-top:34px">\n' +
'      <a class="btn btn--light" href="tel:01068321994">' + TEL + ' 전화 상담</a>\n' +
'      <a class="btn" style="background:transparent;border-color:rgba(255,255,255,.4);color:#fff" href="../startup.html#contact">온라인 상담 신청</a>\n' +
'    </div>\n' +
'  </div>\n' +
'</section>\n' +
'\n' +
'<footer class="ftr">\n' +
'  <div class="wrap">\n' +
'    <div class="ftr__top">\n' +
'      <div>\n' +
'        <div class="ftr__logo">PICKFREE</div>\n' +
'        <p>무인자판기 · 무인키오스크 설치 전문. 자리와 품목에 맞는 구성으로 전국에 설치합니다.</p>\n' +
'        <p style="margin-top:14px">대표번호 <a href="tel:01068321994">' + TEL + '</a><br>상담시간 09:00 – 20:00 (연중무휴)</p>\n' +
'      </div>\n' +
'      <div>\n' +
'        <h4>MENU</h4>\n' +
'        <ul>\n' +
'          <li><a href="../machines.html">자판기소개</a></li>\n' +
'          <li><a href="../locations.html">지역찾기</a></li>\n' +
'          <li><a href="../installations.html">설치현황</a></li>\n' +
'          <li><a href="../startup.html">무인창업</a></li>\n' +
'        </ul>\n' +
'      </div>\n' +
'      <div>\n' +
'        <h4>CONTACT</h4>\n' +
'        <ul>\n' +
'          <li><a href="../startup.html#contact">설치 상담 신청</a></li>\n' +
'          <li><a href="../startup.html#faq">자주 묻는 질문</a></li>\n' +
'          <li><a href="../locations.html">전국 설치 지역</a></li>\n' +
'        </ul>\n' +
'      </div>\n' +
'    </div>\n' +
'    <div class="ftr__bot">\n' +
'      <span>© <span class="yr">2026</span> 픽프리(PICKFREE). All rights reserved.</span>\n' +
'    </div>\n' +
'  </div>\n' +
'</footer>\n' +
'\n' +
'<div class="fab">\n' +
'  <a href="tel:01068321994">전화 상담</a>\n' +
'  <a href="../startup.html#contact">무료 설치 상담</a>\n' +
'</div>\n' +
'\n' +
'<script src="../assets/js/site.js"></script>\n' +
'<script>\n' +
'/* ?dong=동이름 이 붙어 오면 그 동 이름으로 제목만 바꿔 준다.\n' +
'   canonical 은 위에서 시·군·구 주소로 고정 — 동은 같은 내용이라 따로 색인하지 않는다. */\n' +
'(function () {\n' +
'  var AREA = ' + JSON.stringify(areaFull) + ';\n' +
'  var dong = new URLSearchParams(location.search).get("dong");\n' +
'  if (dong) {\n' +
'    var full = AREA + " " + dong;\n' +
'    document.title = full + " 무인자판기 설치 — 설치비 0원 | 픽프리";\n' +
'    document.getElementById("crumbArea").textContent = full;\n' +
'    document.getElementById("rTitle").innerHTML =\n' +
'      full + "<br><em style=\\"font-style:normal;color:var(--clay)\\">무인자판기 설치</em>";\n' +
'    document.getElementById("rLead").textContent =\n' +
'      full + " 지역 무인자판기·무인키오스크 설치를 진행합니다. 매장과 입지를 먼저 보고 자리에 맞는 기종과 품목을 골라 드리며, 설치비는 무료입니다.";\n' +
'    document.getElementById("rH2").textContent = full + " 무인자판기, 이렇게 설치합니다";\n' +
'    document.getElementById("rCta").textContent = full + " 무인자판기 설치 상담";\n' +
'    document.querySelectorAll("#rDongs .gu").forEach(function (a) {\n' +
'      if (a.textContent === dong) { a.style.background = "var(--ink)"; a.style.color = "#fff"; a.style.borderColor = "var(--ink)"; }\n' +
'    });\n' +
'  }\n' +
'  document.querySelectorAll(".yr").forEach(function (e) { e.textContent = new Date().getFullYear(); });\n' +
'})();\n' +
'</script>\n' +
'</body>\n' +
'</html>\n';
}

/* ---------------- 생성 ---------------- */
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
fs.mkdirSync(OUT);

const urls = [];
let idx = 0;
for (const g of RDATA) {
  const provFormal = g.full.split('·')[0].trim();
  for (const it of g.items) {
    const gu = it[0], slug = it[1];
    const areaFull = (gu === g.p) ? gu : (g.p + ' ' + gu);
    const html = page({
      prov: g.p, provFormal: provFormal, gu: gu, slug: slug, areaFull: areaFull,
      dongs: DONGMAP[slug] || [],
      siblings: g.items,
      idx: idx++
    });
    fs.writeFileSync(path.join(OUT, slug + '-vending.html'), html, 'utf8');
    urls.push(SITE + '/region/' + slug + '-vending.html');
  }
}

/* ---------------- sitemap.xml ---------------- */
const main = [
  ['/', '1.0', 'weekly'],
  ['/machines.html', '0.9', 'monthly'],
  ['/locations.html', '0.9', 'monthly'],
  ['/installations.html', '0.8', 'monthly'],
  ['/startup.html', '0.9', 'monthly']
];
const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
];
main.forEach(function (m) {
  lines.push('  <url><loc>' + SITE + m[0] + '</loc><lastmod>' + TODAY +
             '</lastmod><changefreq>' + m[2] + '</changefreq><priority>' + m[1] + '</priority></url>');
});
urls.forEach(function (u) {
  lines.push('  <url><loc>' + u + '</loc><lastmod>' + TODAY +
             '</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>');
});
lines.push('</urlset>', '');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), lines.join('\n'), 'utf8');

console.log('지역 페이지 ' + urls.length + '개 생성 -> region/');
console.log('sitemap.xml 갱신 -> 총 ' + (main.length + urls.length) + '개 주소');
