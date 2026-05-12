# Cotton & Bloom Studio

> 조용하고 감성적인 십자수 도안 생성기 — 린넨 공방 감성 UI

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (커스텀 디자인 토큰)
- **LAB 색공간 + ΔE** 기반 색상 양자화
- **jsPDF + jspdf-autotable** PDF 출력
- **Vercel** 배포

---

## 로컬 개발 시작

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 + 메타데이터
│   ├── page.tsx            # 메인 페이지 (Client Component)
│   └── globals.css         # 전역 스타일 + Tailwind
│
├── components/
│   ├── layout/
│   │   └── Navbar.tsx
│   ├── pattern/
│   │   ├── UploadZone.tsx      # 드래그앤드롭 업로드
│   │   ├── SettingsPanel.tsx   # 도안 설정 사이드바
│   │   ├── PatternCanvas.tsx   # Canvas 렌더링 뷰어
│   │   └── ThreadList.tsx      # 실 목록 + PDF 내보내기
│   └── ui/
│       ├── ProgressOverlay.tsx
│       └── PaletteShowcase.tsx
│
├── hooks/
│   └── usePatternGenerator.ts  # 생성 상태 관리 훅
│
├── lib/
│   ├── color/
│   │   └── lab.ts              # RGB↔LAB 변환, ΔE 계산
│   ├── dmc/
│   │   └── database.ts         # DMC 전색상 DB + 매처
│   ├── pattern/
│   │   ├── generator.ts        # K-means 양자화 + 유사색 분리
│   │   └── renderer.ts         # Canvas 렌더링 엔진
│   └── pdf/
│       └── exporter.ts         # jsPDF 기반 PDF 생성
│
└── types/
    └── index.ts                # 공통 타입 정의
```

---

## 핵심 알고리즘

### 색상 양자화 파이프라인

```
이미지 픽셀
  → RGB → LAB 변환 (rgbToLab)
  → K-means 군집화 (LAB 공간)
  → 각 클러스터 중심 → 최근접 DMC 색상 (deltaE 최소화)
  → 유사색 자동 분리 (인접 셀 ΔE 검사)
  → 도안 격자 완성
```

### 유사색 자동 분리 (ΔE 기반)

```typescript
// 4방향 인접 셀을 검사하여 ΔE가 임계값 미만이면 대체 DMC 색상으로 교체
if (deltaE(myColor.lab, neighborColor.lab) < threshold) {
  const alt = findClosestDmc(neighborColor.lab, exclude)
  if (deltaE(alt.lab, myColor.lab) >= threshold) {
    dmcMap[neighborIndex] = alt
  }
}
```

| 설정   | ΔE 임계값 | 설명                         |
|--------|-----------|------------------------------|
| OFF    | 0         | 분리 없음                     |
| 약하게  | 8         | 거의 동일한 색만 분리          |
| 보통   | 15        | 눈으로 구분 어려운 색 분리     |
| 강하게  | 25        | 유사 계열 전체 분리           |

---

## Git → Vercel 배포

### 1. GitHub에 올리기

```bash
git init
git add .
git commit -m "feat: initial Cotton & Bloom Studio"
git remote add origin https://github.com/YOUR_USERNAME/cotton-bloom-studio.git
git push -u origin main
```

### 2. Vercel 배포

1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub 저장소 선택
3. Framework: **Next.js** (자동 감지됨)
4. **Deploy** 클릭 → 완료

환경 변수는 현재 없으므로 추가 설정 불필요.

---

## 디자인 토큰

```
컬러
  linen-50  #F7F5F2   Warm White
  linen-100 #EEE7DF   Linen Beige
  linen-200 #E8DDD1   Soft Cream
  linen-300 #D8C9BA   Cotton Beige
  sage-400  #A8B2A1   Sage Green
  sage-500  #7E8A78   Dusty Green
  warm-600  #4F4A45   Warm Gray (텍스트 기본)

폰트
  font-playfair   Playfair Display (제목)
  font-cormorant  Cormorant Garamond (부제목 · 이탤릭)
  font-noto       Noto Sans KR (본문)

Border radius
  rounded-card   22px
  rounded-panel  28px
  rounded-btn    14px
  rounded-chip   9px
```

---

## 확장 계획

- [ ] Anchor 브랜드 색상 추가
- [ ] Web Worker로 K-means 오프로드 (대형 도안 성능 개선)
- [ ] 수동 색상 편집 도구 (페인트 · 지우개)
- [ ] 도안 저장 / 불러오기 (localStorage)
- [ ] 모바일 반응형 개선
