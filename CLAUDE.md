# 픽프리(PICKFREE) — 무인자판기 설치 전문 사이트 (vending-site)

무인자판기 · 무인키오스크 설치를 소개하는 정적 사이트. 빌드 도구 없이 HTML/CSS/JS 파일만으로
동작한다.

## 배포

- 저장소: `x26589334-cpu/vending-site` (public)
- 주소: **https://pickfree.co.kr/** (www·http 모두 접속됨, HTTPS 강제 적용)
- 임시 주소(살아있음): https://x26589334-cpu.github.io/vending-site/ → pickfree.co.kr로 리다이렉트
- `main` 브랜치 루트가 곧 사이트. **push하면 그대로 반영**된다(빌드 없음).

### 커스텀 도메인 (연결 완료 2026-09-03)

`CNAME` 파일 = `pickfree.co.kr`, Pages custom domain 설정 + HTTPS 강제까지 적용됨.
가비아 네임서버에 A 레코드 4개(185.199.108~111.153)와 `www` CNAME(`x26589334-cpu.github.io`)이
들어가 있다. 도메인을 바꿀 일이 생기면 `CNAME` 파일 + `robots.txt` + `sitemap.xml` 세 곳을 같이 고칠 것.

### 검색엔진 등록 (2026-09-04)

- **구글 Search Console** — `도메인` 속성(`pickfree.co.kr`), **DNS TXT 방식**으로 소유확인.
  가비아 DNS에 `TXT @ google-site-verification=xP_7dsnGrR1RplauBEvhTwagPaqNUNjo2uSBEFYaUNc`
  가 들어가 있다. **이 TXT 레코드를 지우면 소유확인이 풀린다.**
- **네이버 서치어드바이저** — `index.html` `<head>` 의
  `<meta name="naver-site-verification" content="db86b6e3...">` 로 소유확인.
  **이 줄을 지우면 소유확인이 풀린다.**
- 전 페이지에 `<link rel="canonical">` 과 `og:url` 이 절대주소로 들어가 있다.
  페이지를 추가하면 canonical·og:url·`sitemap.xml` 세 곳을 같이 챙길 것.
- `region.html` 은 쿼리스트링으로 내용이 바뀌는 동적 페이지라 canonical을 넣지 않았다
  (검색 노출을 원하면 정적 지역 페이지 생성이 먼저다 — 아래 "남은 작업 후보" 참고).

### 푸시 권한 함정

원격은 `x26589334-cpu` 소유인데 이 PC에 저장된 GitHub 로그인은 **`Applefist`** 다.
2026-09-04 에 `Applefist` 를 이 저장소 **협업자(Collaborator)로 추가**해서 푸시가 뚫렸다.
다른 저장소에서 `Permission ... denied to Applefist` 403 이 나오면 같은 방법으로 해결한다.

## 아직 정해지지 않은 것

- **푸터 사업자 정보** — "상호 · 사업자등록번호 · 주소 등 사업자 정보 표기 예정" 자리.
- 브랜드 표기는 **로고·푸터 = `PICKFREE`, 타이틀·저작권 = `픽프리`** 로 통일했다
  (같은 계열: [pickpos] 픽포스 / hsupporter.com).
- 대표번호는 공용 번호 **010-6832-1994**로 넣어 두었다(다른 바인그룹 사이트와 동일).
- 상담 폼은 공용 Apps Script 웹앱 → 구글 "웹 문의" 시트의 **`무인자판기` 탭**으로 들어간다
  (`startup.html`의 `form[data-sheet]`, hidden `sheet=무인자판기`). 필드 name이 한글이라
  그대로 시트 헤더가 되므로 이름을 바꾸면 컬럼이 새로 생긴다.

## 페이지 구조

- `index.html` — 홈 (히어로 / 특징 5 / 자판기 종류 / 설치 장소 / 최근 설치 현장 /
  무인키오스크 / 지역 검색 위젯 / 설치 절차 / 창업 CTA)
- `machines.html` — **자판기소개**. 기종 6종, 입지별 품목 표, 결제·원격관리(`#payment`),
  제품 상세 이미지 스택, 무인키오스크, 공공기관 자동판매기, 구입/렌탈/임대 비교
- `locations.html` — **지역찾기**. 검색 + 시·도 → 시·군·구 → 동 위젯, 전국 지역 아코디언
- `installations.html` — **설치현황**. 지역별 실제 설치 사진 갤러리(지역 필터 + 라이트박스),
  업종별 설치 유형, 설치 절차
- `startup.html` — **무인창업**. 수익 계산기, 직접/위탁 비교, 창업 유형·절차,
  FAQ(`#faq`), 상담 폼(`#contact`)
- `region.html` — 지역 상세 페이지. `?area=<slug>&dong=<동이름>` 쿼리로 내용이 바뀌는
  **한 개의 동적 페이지**. 지역찾기의 모든 링크가 여기로 온다.

## 공용 파일

- `assets/css/site.css` — 전체 스타일. 색·폰트는 `:root` 토큰만 고치면 전체가 바뀐다.
  톤: 웜 오프화이트(`--paper`) + 먹색(`--ink`) + 클레이(`--clay`) + 딥그린(`--forest`),
  제목은 Noto Serif KR, 본문은 Pretendard.
- `assets/js/site.js` — 헤더/모바일메뉴/아코디언/스크롤 리빌/상담 폼, 그리고
  **자판기 SVG 일러스트 생성기**. HTML에 `<span data-vm="drink|snack|ice|multi|kiosk">`만
  넣으면 해당 일러스트가 그려진다(이미지 파일 아님).
- `assets/js/region-data.js` — 전국 시·도/시·군·구/동 데이터(`RDATA`/`RDONGS`/`RALIAS`).
  **hpos.co.kr 저장소(`~/Projects/yoon/region-data.js`)에서 그대로 복사한 것**이라,
  그쪽에서 지역이 추가되면 다시 복사해 오면 된다.
- `assets/js/region-ui.js` — 지역찾기 위젯. `initRegionUI({prov,sgg,input,out})` 한 줄로
  붙는다. index.html과 locations.html이 같이 쓴다.

## 이미지 출처와 용도 구분 (중요)

`~/Projects/yoon`(hpos.co.kr)에서 가져왔고, **두 종류를 섞으면 안 된다**:

- `assets/img/installs/*.jpg` — **실제 설치 현장 사진**. 원본 파일명이 `수원무인자판기.jpg`
  처럼 지역명이라 캡션도 그 지역으로 붙였다. 설치현황 갤러리와 홈 "최근 설치 현장"에 사용.
- `assets/img/vending-01~16.jpg` — LK(엘케이) **제품 상세페이지 마케팅 이미지**. 설치 현장이
  아니므로 "설치 사례"로 쓰면 안 된다. `machines.html`의 "제품 상세" 섹션에만 사용.
- `assets/img/product-vending.jpg` — 실제 설치 사진 1장(현재 미사용, 예비).

## 설치현황 갤러리 데이터

`installations.html`의 `<figure data-grp="수도권|충청|강원|호남|영남|제주|기관">` 형태로
정적 마크업에 박혀 있다. 사진을 추가하려면 `assets/img/installs/`에 파일을 넣고
figure 한 줄을 같은 형식으로 추가하면 필터에 자동으로 잡힌다.

## 콘텐츠 규칙

- **자판기 · 키오스크 키워드만 쓴다.** 카드단말기·포스기·테이블오더 관련 내용은 넣지 않는다
  (사용자가 명시적으로 요청한 사항).
- 설치 대수, 계약 건수, 매출 같은 **검증 안 되는 숫자는 만들어 쓰지 않는다.** 현재 지표는
  "전국 17개 시·도", "설치비 0원"처럼 사실이거나 정책인 항목만 넣었다.
- 무인창업 페이지의 수익 계산기는 **사용자가 입력한 가정값**으로만 계산하며,
  카드수수료·감가·보충비는 제외라고 화면에 명시되어 있다.

## 남은 작업 후보

- 지역 페이지를 `region.html?area=` 동적 방식 대신 **시·군·구별 정적 HTML로 생성**하면
  검색 노출에 훨씬 유리하다(hpos는 `region/` 폴더에 702개 정적 페이지로 되어 있음).
  생성 스크립트를 만들어 `region/<slug>-vending.html` 형태로 뽑는 것이 다음 단계.
- `sitemap.xml`에 생성된 지역 페이지 추가.
- OG 이미지(`og-image.jpg`) 제작.
