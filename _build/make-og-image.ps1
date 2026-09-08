# ============================================================
#  픽프리 OG 이미지 생성기  ->  assets/img/og-image.jpg (1200x630)
#  카카오톡/문자/페이스북 등에 주소를 공유할 때 뜨는 대표 썸네일.
#  색·폰트는 assets/css/site.css 의 :root 토큰과 맞춰 두었다.
#  실행:  powershell -ExecutionPolicy Bypass -File _build\make-og-image.ps1
# ============================================================
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $root 'assets\img\og-image.jpg'

# --- 사이트 색 토큰 ---
function C([string]$hex){
  [System.Drawing.ColorTranslator]::FromHtml($hex)
}
$INK   = C '#1a1917'
$INK2  = C '#4a463f'
$MUTED = C '#8a8378'
$LINE  = C '#e4ded4'
$PAPER = C '#f6f3ee'
$PAPER2= C '#efeae2'
$CLAY  = C '#a4805c'
$CLAYS = C '#e8dbcb'
$FOREST= C '#2c3a32'
$WHITE = C '#ffffff'

$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# --- 헬퍼 ---
function RoundRect($x,$y,$w,$h,$r){
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r*2
  $p.AddArc($x,        $y,        $d,$d, 180,90)
  $p.AddArc($x+$w-$d,  $y,        $d,$d, 270,90)
  $p.AddArc($x+$w-$d,  $y+$h-$d,  $d,$d,   0,90)
  $p.AddArc($x,        $y+$h-$d,  $d,$d,  90,90)
  $p.CloseFigure()
  return $p
}
function Fill($color,$x,$y,$w,$h,$r=0){
  $b = New-Object System.Drawing.SolidBrush($color)
  if($r -gt 0){ $p = RoundRect $x $y $w $h $r; $g.FillPath($b,$p); $p.Dispose() }
  else { $g.FillRectangle($b,$x,$y,$w,$h) }
  $b.Dispose()
}
function Txt($text,$font,$color,$x,$y){
  $b = New-Object System.Drawing.SolidBrush($color)
  $g.DrawString($text,$font,$b,[single]$x,[single]$y,
    [System.Drawing.StringFormat]::GenericTypographic)
  $b.Dispose()
}
function Wide($text,$font,$color,$x,$y,$gap){
  # 자간 넓힌 영문 (한 글자씩)
  $cx = [single]$x
  foreach($ch in $text.ToCharArray()){
    $s = [string]$ch
    Txt $s $font $color $cx $y
    $sz = $g.MeasureString($s,$font,[System.Drawing.PointF]::Empty,
          [System.Drawing.StringFormat]::GenericTypographic)
    if($s -eq " "){ $cx = $cx + $sz.Width + $gap + 9 } else { $cx = $cx + $sz.Width + $gap }
  }
}
function TxtW($text,$font){
  ($g.MeasureString($text,$font,[System.Drawing.PointF]::Empty,
    [System.Drawing.StringFormat]::GenericTypographic)).Width
}

# --- 폰트 (사이트와 동일 계열) ---
$Serif  = 'Noto Serif KR'
$Sans   = 'Malgun Gothic'
$fEyebrow = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Bold)
$fH1      = New-Object System.Drawing.Font($Serif, 46, [System.Drawing.FontStyle]::Regular)
$fSub     = New-Object System.Drawing.Font($Sans, 19, [System.Drawing.FontStyle]::Regular)
$fSub2    = New-Object System.Drawing.Font($Sans, 15, [System.Drawing.FontStyle]::Regular)
$fBrand   = New-Object System.Drawing.Font('Segoe UI', 25, [System.Drawing.FontStyle]::Bold)
$fBrandKr = New-Object System.Drawing.Font($Sans, 13, [System.Drawing.FontStyle]::Regular)
$fUrl     = New-Object System.Drawing.Font($Sans, 14, [System.Drawing.FontStyle]::Bold)

# ============ 배경 ============
Fill $PAPER 0 0 $W $H
# 오른쪽 톤 블록
Fill $PAPER2 745 0 ($W-745) $H
# 세로 경계선
Fill $LINE 745 0 1 $H
# 상단 클레이 라인
Fill $CLAY 0 0 $W 6

# ============ 오른쪽 : 자판기 일러스트 ============
$mx = 838; $my = 96; $mw = 290; $mh = 438
# 바닥 그림자
$sb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26,26,25,23))
$g.FillEllipse($sb, $mx-16, $my+$mh-14, $mw+32, 42); $sb.Dispose()
# 본체
Fill $FOREST $mx $my $mw $mh 6
# 유리창
$win_x = $mx+20; $win_y = $my+22; $win_w = 176; $win_h = 300
Fill $PAPER $win_x $win_y $win_w $win_h 3
# 선반 + 상품
$shelfY = $win_y + 16
$palette = @($CLAY, $FOREST, $CLAYS, $CLAY, $MUTED, $CLAYS)
for($row=0; $row -lt 4; $row++){
  $ry = $shelfY + ($row * 73)
  for($col=0; $col -lt 4; $col++){
    $cxp = $win_x + 14 + ($col * 38)
    $pc  = $palette[(($row*4 + $col) % $palette.Count)]
    Fill $pc $cxp $ry 24 40 3
  }
  # 선반 유리 단
  Fill $LINE $win_x ($ry+48) $win_w 3
}
# 오른쪽 조작부
$px = $mx + 210
Fill $PAPER2 $px ($my+22) 60 120 3      # 디스플레이
Fill $FOREST ($px+8) ($my+30) 44 26 2   # 화면
for($i=0; $i -lt 4; $i++){
  for($j=0; $j -lt 3; $j++){
    Fill $CLAYS ($px+8+($j*17)) ($my+68+($i*16)) 12 11 2
  }
}
# 카드 결제부
Fill $CLAY $px ($my+156) 60 34 3
Fill $PAPER2 ($px+10) ($my+166) 40 6 2
# 취출구
Fill ([System.Drawing.Color]::FromArgb(255,20,26,22)) ($mx+20) ($my+346) 176 62 4
Fill $FOREST ($mx+28) ($my+354) 160 20 2
# 다리
Fill $FOREST ($mx+18) ($my+$mh) 26 10 2
Fill $FOREST ($mx+$mw-44) ($my+$mh) 26 10 2

# ============ 왼쪽 : 텍스트 ============
$L = 78

Wide 'NATIONWIDE INSTALLATION' $fEyebrow $CLAY $L 104 2.6

# 제목 2줄
Txt '사람이 머무는 자리에,' $fH1 $INK $L 146
$part1 = '무인 매출'
$part2 = '을 놓습니다.'
Txt $part1 $fH1 $CLAY $L 220
$w1 = TxtW $part1 $fH1
Txt $part2 $fH1 $INK ($L + $w1) 220

# 구분선
Fill $CLAY $L 316 64 2

Txt '무인자판기 · 무인키오스크 설치 전문' $fSub $INK2 $L 344
Txt '설치비 0원 · 구입 / 렌탈 / 임대 · 전국 17개 시·도 방문 설치' $fSub2 $MUTED $L 384

# 하단 브랜드
Fill $LINE $L 452 590 1
Wide 'PICKFREE' $fBrand $INK $L 480 3.5
Txt '픽프리 무인자판기' $fBrandKr $MUTED $L 526

# 오른쪽 아래 주소 배지
$badge = 'pickfree.co.kr'
$bw = (TxtW $badge $fUrl) + 34
Fill $INK $L 556 $bw 38 3
Txt $badge $fUrl $WHITE ($L+17) 566

# ============ 저장 (JPEG 품질 92) ============
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq 'image/jpeg' }
$ps = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [long]92)
if(Test-Path $out){ Remove-Item $out -Force }
$bmp.Save($out, $codec, $ps)

$g.Dispose(); $bmp.Dispose()
Write-Output ("생성 완료: {0}  ({1:N0} KB)" -f $out, ((Get-Item $out).Length/1KB))
