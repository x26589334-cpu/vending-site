/* ==========================================================================
   공통 스크립트 — 헤더 / 모바일 메뉴 / 아코디언 / 스크롤 리빌 / 일러스트 삽입
   외부 라이브러리 없이 동작합니다.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. 자판기 SVG 일러스트 ----------
     <span data-vm></span>            → 기본(음료)
     <span data-vm="snack"></span>    → 스낵/과자
     <span data-vm="ice"></span>      → 아이스크림/냉동
     <span data-vm="kiosk"></span>    → 무인키오스크
     <span data-vm="multi"></span>    → 복합(멀티)
  ------------------------------------------------- */
  var PALETTE = {
    drink: { glass: '#dfe6e6', item: '#8d9a99', accent: '#a4805c' },
    snack: { glass: '#e7e0d3', item: '#b0a189', accent: '#a4805c' },
    ice:   { glass: '#dde6ea', item: '#9fb2bd', accent: '#7d99a8' },
    multi: { glass: '#e2e2e0', item: '#9b9a94', accent: '#2c3a32' }
  };

  function shelfRows(p, rows, cols) {
    var out = '', y, x, i, j;
    for (i = 0; i < rows; i++) {
      y = 92 + i * 46;
      out += '<line x1="46" y1="' + (y + 34) + '" x2="184" y2="' + (y + 34) +
             '" stroke="#c9ccc9" stroke-width="1"/>';
      for (j = 0; j < cols; j++) {
        x = 54 + j * (128 / (cols - 1));
        out += '<rect x="' + (x - 6) + '" y="' + (y + 8) + '" width="12" height="26" rx="3" fill="' + p.item + '" opacity=".85"/>';
        out += '<rect x="' + (x - 6) + '" y="' + (y + 8) + '" width="12" height="7" rx="3" fill="' + p.accent + '" opacity=".5"/>';
      }
    }
    return out;
  }

  function machineSVG(kind) {
    var p = PALETTE[kind] || PALETTE.drink;
    var rows = kind === 'ice' ? 4 : 5;
    var cols = kind === 'snack' ? 6 : 5;

    if (kind === 'kiosk') {
      return '' +
        '<svg class="vm" viewBox="0 0 260 420" role="img" aria-label="무인키오스크 일러스트">' +
        '<defs><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eeeae3"/></linearGradient></defs>' +
        '<rect x="70" y="316" width="120" height="14" rx="4" fill="#ded7cc"/>' +
        '<rect x="112" y="180" width="36" height="140" fill="url(#kg)" stroke="#d8d2c8"/>' +
        '<rect x="46" y="24" width="168" height="176" rx="10" fill="url(#kg)" stroke="#d8d2c8"/>' +
        '<rect x="60" y="38" width="140" height="120" rx="4" fill="#2c3a32"/>' +
        '<rect x="70" y="50" width="55" height="9" rx="4" fill="#5d6f64"/>' +
        '<rect x="70" y="68" width="120" height="52" rx="3" fill="#3d4f45"/>' +
        '<rect x="70" y="128" width="120" height="18" rx="3" fill="' + p.accent + '" opacity=".85"/>' +
        '<rect x="98" y="170" width="64" height="18" rx="4" fill="#ffffff" stroke="#d8d2c8"/>' +
        '<circle cx="130" cy="179" r="4" fill="' + p.accent + '"/>' +
        '</svg>';
    }

    return '' +
      '<svg class="vm" viewBox="0 0 260 420" role="img" aria-label="무인자판기 일러스트">' +
      '<defs>' +
        '<linearGradient id="bodyg-' + kind + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#efece6"/></linearGradient>' +
        '<linearGradient id="glassg-' + kind + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="' + p.glass + '"/><stop offset="1" stop-color="#f4f6f5"/></linearGradient>' +
      '</defs>' +
      /* 본체 */
      '<rect x="20" y="14" width="220" height="392" rx="14" fill="url(#bodyg-' + kind + ')" stroke="#dcd6cc"/>' +
      /* 유리 진열창 */
      '<rect x="40" y="52" width="150" height="286" rx="6" fill="url(#glassg-' + kind + ')" stroke="#cfd4d2"/>' +
      '<rect x="46" y="60" width="14" height="270" fill="#ffffff" opacity=".45"/>' +
      shelfRows(p, rows, cols) +
      /* 로고 */
      '<rect x="204" y="34" width="18" height="18" rx="3" fill="none" stroke="' + p.accent + '" stroke-width="1.4"/>' +
      /* 결제 화면 */
      '<rect x="196" y="72" width="34" height="122" rx="4" fill="#2c3a32"/>' +
      '<rect x="201" y="80" width="24" height="60" rx="2" fill="#42574b"/>' +
      '<rect x="201" y="146" width="24" height="8" rx="2" fill="' + p.accent + '" opacity=".9"/>' +
      '<rect x="201" y="160" width="24" height="26" rx="2" fill="#3a4d43"/>' +
      /* 카드리더 */
      '<rect x="196" y="212" width="34" height="16" rx="4" fill="#3b3a36"/>' +
      '<rect x="203" y="218" width="20" height="3" rx="1.5" fill="#8d8b84"/>' +
      /* 취출구 */
      '<rect x="40" y="352" width="150" height="40" rx="5" fill="#f6f3ee" stroke="#dcd6cc"/>' +
      '<line x1="52" y1="346" x2="178" y2="346" stroke="#e0dad0" stroke-width="2"/>' +
      '</svg>';
  }

  document.querySelectorAll('[data-vm]').forEach(function (el) {
    el.innerHTML = machineSVG(el.getAttribute('data-vm') || 'drink');
  });

  /* ---------- 2. 헤더 그림자 ---------- */
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 3. 모바일 메뉴 ---------- */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- 4. 아코디언 ---------- */
  document.querySelectorAll('.acc__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.acc__item');
      var panel = item.querySelector('.acc__a');
      var open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.height = open ? panel.scrollHeight + 'px' : '0px';
    });
  });

  /* ---------- 5. 스크롤 리빌 ---------- */
  var rvs = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    rvs.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- 6. 상담 폼 → 공용 Apps Script("웹 문의" 구글 시트) ----------
     <form data-sheet="APPS_SCRIPT_URL"> 형태. 필드 name을 한글로 두면 시트 헤더가 됩니다.
     data-sheet 값이 비어 있으면 전송하지 않고 안내만 띄웁니다(데모).
  ------------------------------------------------------------------------ */
  document.querySelectorAll('form[data-sheet]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var box = form.querySelector('[data-result]');
      var btn = form.querySelector('button[type="submit"]');
      var endpoint = form.getAttribute('data-sheet');

      function show(text, err) {
        if (!box) return;
        box.hidden = false;
        box.textContent = text;
        box.style.borderLeftColor = err ? '#b42318' : 'var(--clay-soft)';
      }

      var agree = form.querySelector('input[name="개인정보동의"]');
      if (agree && !agree.checked) { show('개인정보 수집·이용에 동의해 주세요.', true); return; }

      var need = form.querySelector('input[required]:placeholder-shown');
      if (need) { show('성함과 연락처를 입력해 주세요.', true); need.focus(); return; }

      if (!endpoint) {
        show('접수 되었습니다. (※ 시트 연동 전이라 실제로 저장되지는 않습니다.)');
        form.reset();
        return;
      }

      var data = new URLSearchParams(new FormData(form));
      data.set('_page', location.pathname);
      data.set('_time', new Date().toLocaleString('ko-KR'));

      var orig = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.textContent = '전송 중...'; }

      /* Apps Script 웹앱은 CORS 응답을 주지 않으므로 no-cors로 보냅니다 */
      fetch(endpoint, { method: 'POST', mode: 'no-cors', body: data })
        .then(function () {
          show('상담 신청이 접수되었습니다. 확인 후 담당자가 연락드리겠습니다.');
          form.reset();
        })
        .catch(function () {
          show('전송에 실패했습니다. 잠시 후 다시 시도하시거나 010-6832-1994로 연락 주세요.', true);
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = orig; }
        });
    });
  });
})();
