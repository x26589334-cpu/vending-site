/* ==========================================================================
   지역찾기 위젯
   검색(시·군·구 + 동) → 시·도 선택 → 시·군·구 선택 → 동 단위 목록
   region-data.js (RDATA / RDONGS / RALIAS) 를 먼저 불러와야 합니다.

   사용:
     initRegionUI({ prov:'rProv', sgg:'rSgg', input:'rSearch', out:'rOut' });
   ========================================================================== */
window.initRegionUI = function (opt) {
  'use strict';
  var DATA = window.RDATA, DONGS = window.RDONGS, ALIAS = window.RALIAS || {};
  if (!DATA || !DONGS) return;

  var prov  = document.getElementById(opt.prov);
  var sgg   = document.getElementById(opt.sgg);
  var input = document.getElementById(opt.input);
  var out   = document.getElementById(opt.out);
  if (!prov || !sgg) return;

  var BASE = opt.base || '';
  var FLAT = [], PSHORT = {}, DMAP = {};

  /* --- 검색 인덱스 --- */
  DATA.forEach(function (g) {
    g.items.forEach(function (it) {
      PSHORT[it[1]] = g.p;
      FLAT.push({
        name: it[0], slug: it[1], tag: g.p,
        blob: (it[0] + it[1] + g.p + (ALIAS[it[1]] || '')).toLowerCase().replace(/\s/g, '')
      });
    });
  });
  DONGS.forEach(function (d) {
    DMAP[d[0]] = { gu: d[1], dongs: d[2] };
    d[2].forEach(function (n) {
      FLAT.push({
        name: n, slug: d[0], tag: d[1], dong: n,
        blob: (n + d[1] + d[0] + (ALIAS[d[0]] || '') + (PSHORT[d[0]] || '')).toLowerCase().replace(/\s/g, '')
      });
    });
  });

  function url(slug, dong) {
    var u = BASE + 'region.html?area=' + encodeURIComponent(slug);
    return dong ? u + '&dong=' + encodeURIComponent(dong) : u;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* --- 시·도 버튼 --- */
  var current = DATA[0];
  DATA.forEach(function (g, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sido' + (i === 0 ? ' is-on' : '');
    b.textContent = g.p;
    b.addEventListener('click', function () {
      prov.querySelectorAll('.sido').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      renderSgg(g);
    });
    prov.appendChild(b);
  });

  /* --- 시·군·구 목록 --- */
  function renderSgg(g) {
    current = g;
    var h = '<div class="sgg__t">' + esc(g.full) + '</div>' +
            '<div class="sgg__d">시·군·구를 선택하시면 동 단위까지 확인하실 수 있습니다.</div>' +
            '<div class="sgg__list">';
    g.items.forEach(function (it) {
      h += '<a href="' + url(it[1]) + '" class="js-sgg" data-slug="' + it[1] + '" data-name="' + esc(it[0]) + '">' + esc(it[0]) + ' ›</a>';
    });
    sgg.innerHTML = h + '</div>';
  }

  /* --- 동 목록 --- */
  function renderDongs(slug, name) {
    var m = DMAP[slug];
    var h = '<div class="sgg__t">' + esc(name) + ' 무인자판기 <small>· 동 단위 안내</small></div>' +
            '<div class="sgg__d"><a href="#" class="js-back">← 시·군·구 다시 선택</a> · ' +
            '<a href="' + url(slug) + '">' + esc(name) + ' 무인자판기 설치 안내 전체 보기 →</a></div>' +
            '<div class="sgg__list">';
    if (m) {
      m.dongs.forEach(function (d) {
        h += '<a href="' + url(slug, d) + '">' + esc(d) + '</a>';
      });
    } else {
      h += '<a href="' + url(slug) + '">' + esc(name) + ' 설치 안내 보기</a>';
    }
    sgg.innerHTML = h + '</div>';
  }

  renderSgg(DATA[0]);

  sgg.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.js-sgg');
    if (t) { e.preventDefault(); renderDongs(t.getAttribute('data-slug'), t.getAttribute('data-name')); return; }
    var b = e.target.closest && e.target.closest('.js-back');
    if (b) { e.preventDefault(); renderSgg(current); }
  });

  /* --- 검색 --- */
  if (!input || !out) return;
  var hits = [];
  function search() {
    var raw = input.value.trim();
    if (!raw) { out.classList.remove('is-on'); out.innerHTML = ''; return; }
    var toks = raw.toLowerCase().split(/\s+/).filter(Boolean);
    hits = FLAT.filter(function (r) {
      return toks.every(function (t) { return r.blob.indexOf(t) > -1; });
    });
    hits.sort(function (a, b) {
      function rank(x) { return x.name === raw ? 0 : (x.name.indexOf(raw) === 0 ? 1 : 2); }
      return rank(a) - rank(b) || a.name.length - b.name.length;
    });
    hits = hits.slice(0, 16);
    if (!hits.length) {
      out.innerHTML = '<div class="rsearch__none">검색 결과가 없습니다. 전화(010-6832-1994)로 문의해 주세요.</div>';
    } else {
      out.innerHTML = hits.map(function (r) {
        return '<a href="' + url(r.slug, r.dong) + '">' + esc(r.name) + ' 무인자판기<em>' + esc(r.tag) + '</em></a>';
      }).join('');
    }
    out.classList.add('is-on');
  }
  input.addEventListener('input', search);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && hits.length) location.href = url(hits[0].slug, hits[0].dong);
  });
  document.addEventListener('click', function (e) {
    if (!input.contains(e.target) && !out.contains(e.target)) out.classList.remove('is-on');
  });
};
