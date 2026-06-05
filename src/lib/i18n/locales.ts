export type Locale = 'ko' | 'en' | 'ja'

export interface Translations {
  meta: {
    title: string
    description: string
    ogLocale: string
    htmlLang: string
  }
  nav: {
    subtitle: string
    gallery: string
    guide: string
    dmcColors: string
    feedback: string
    cta: string
  }
  hero: {
    eyebrow: string
    h1a: string
    h1b: string
    tagline: string
    steps: [string, string, string, string]
  }
  upload: {
    prompt: string
    dragHint: string
    replace: string
  }
  settings: {
    panelTitle: string
    size: {
      section: string
      preset: string
      custom: string
      width: string
      height: string
      overLimit: string
    }
    aspect: {
      section: string
      desc: string
      fit:     { label: string; hint: string }
      crop:    { label: string; hint: string }
      stretch: { label: string; hint: string }
    }
    adjust: {
      section: string
      brightness: string
      contrast: string
      defaultBadge: string
      reset: string
    }
    color: {
      section: string
      brand: string
      count: string
      anchorHint: string
      counts: [string, string, string, string]
    }
    quality: {
      section: string
      desc: string
      fast:     { hint: string }
      balanced: { hint: string }
      hq:       { hint: string }
    }
    dither: {
      section: string
      desc: string
      none:     { hint: string }
      floyd:    { hint: string }
      atkinson: { hint: string }
      ordered:  { hint: string }
    }
    sep: {
      section: string
      desc: string
      off:    { label: string; hint: string }
      weak:   { label: string; hint: string }
      medium: { label: string; hint: string }
      strong: { label: string; hint: string }
    }
    display: {
      section: string
      color:  string
      symbol: string
      mixed:  string
    }
    generate: string
    generating: string
    progressDone: string
    progressError: string
  }
  features: [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
  ]
  faq: {
    sectionLabel: string
    title: string
    items: Array<{ q: string; a: string }>
  }
  toolbar: {
    fit: string
    grid: string
    draw: string
    erase: string
    fill: string
    colorPick: string
    zoomHint: string
    placeholder: string
    infoSize: string
    infoColors: string
    infoColorsSuffix: string
    infoTotal: string
    infoTotalSuffix: string
    dmcPicker: string
  }
  palette: {
    sectionTag: string
    subtitle: string
    showcaseTitle: string
    showcaseSubtitle: string
  }
  gallery: {
    heroTitle: string
    heroDesc: string
    combinationLabel: string
    optionCountSuffix: string
    combinationSuffix: string
    heroCombinationPrefix: string
    sectionSubtitles: {
      aspect: string
      colorCount: string
      quality: string
      dithering: string
      sep: string
      display: string
    }
    ctaMessage: string
    ctaButton: string
  }
  feedback: {
    title: string
    subtitle: string
    emailLabel: string
    subjectLabel: string
    messageLabel: string
    emailPlaceholder: string
    subjectPlaceholder: string
    messagePlaceholder: string
    submitText: string
    submittingText: string
    successMessage: string
  }
  guide: {
    breadcrumbHome: string
    ctaTitle: string
    ctaDesc: string
    ctaButton: string
    faqTitle: string
    footerDmc: string
    footerGuide: string
  }
  dmcColors: {
    groups: {
      all: string
      red: string
      orange: string
      yellow: string
      green: string
      blue: string
      purple: string
      brown: string
      neutral: string
    }
    searchPlaceholder: string
    colorCount: string
    pageTitle: string
    pageDesc: string
    breadcrumb: string
    popularLabel: string
    beginnerSetLabel: string
    noResults: string
    similarColors: string
    close: string
    guideLink: string
    createLink: string
  }
}

const KO: Translations = {
  meta: {
    title: '무료 십자수 도안 만들기 | 사진을 DMC 십자수 도안으로 | Stitch Pattern Maker',
    description: '사진을 DMC 십자수 도안으로 즉시 변환. 브라우저에서 완전 무료, 계정 불필요.',
    ogLocale: 'ko_KR',
    htmlLang: 'ko',
  },
  nav: {
    subtitle: 'Cross Stitch Pattern Generator',
    gallery: '갤러리',
    guide: '가이드',
    dmcColors: 'DMC 색상표',
    feedback: '피드백',
    cta: '무료 시작',
  },
  hero: {
    eyebrow: 'Photo to Cross Stitch Pattern Generator',
    h1a: '사진을',
    h1b: '십자수 도안으로',
    tagline: '소중한 순간을 실 한 올로 담아내는\n조용하고 감성적인 도안 작업실',
    steps: ['사진 업로드', '옵션 설정', '도안 생성', 'PDF 저장'],
  },
  upload: {
    prompt: '사진을 올려주세요',
    dragHint: '드래그하거나 클릭하여\n이미지를 불러오세요',
    replace: '클릭하여 다른 사진으로 교체',
  },
  settings: {
    panelTitle: '도안 설정',
    size: {
      section: '도안 크기',
      preset: '프리셋',
      custom: '직접 입력',
      width: '가로 (칸)',
      height: '세로 (칸)',
      overLimit: '변환불가: 최대 300 × 300 (총 90,000칸)을 초과했습니다',
    },
    aspect: {
      section: '비율 모드',
      desc: '원본 이미지를 격자에\n매핑하는 방식을 선택합니다',
      fit:     { label: 'Fit',     hint: '원본 비율 유지 + 여백 채움' },
      crop:    { label: 'Crop',    hint: '중앙 기준 크롭 — 여백 없음' },
      stretch: { label: 'Stretch', hint: '격자에 맞게 늘림' },
    },
    adjust: {
      section: '이미지 조정',
      brightness: '명도',
      contrast: '명암',
      defaultBadge: '기본값',
      reset: '초기화',
    },
    color: {
      section: '색상 설정',
      brand: '실 브랜드',
      count: '최대 색상 수',
      anchorHint: 'Anchor (준비 중)',
      counts: ['20색 — 단순', '40색 — 균형', '60색 — 세밀', '80색 — 정교'],
    },
    quality: {
      section: '렌더링 품질',
      desc: '전처리 강도와 리샘플링\n방식을 선택합니다',
      fast:     { hint: '빠른 생성 — 플랫 컬러' },
      balanced: { hint: '균형 — 디더링 지원' },
      hq:       { hint: '최고 품질 — 샤픈 + Confetti 정리' },
    },
    dither: {
      section: '디더링',
      desc: '색상 양자화 시 적용할\n디더링 알고리즘을 선택합니다',
      none:     { hint: '플랫 컬러 — 선명한 경계' },
      floyd:    { hint: 'Floyd–Steinberg 디더링' },
      atkinson: { hint: 'Atkinson — 부드러운 디더링' },
      ordered:  { hint: 'Bayer 4×4 매트릭스 패턴' },
    },
    sep: {
      section: '유사색 자동 분리',
      desc: '인접 유사색을 자동 보정해\n작업 난이도를 낮춥니다',
      off:    { label: 'OFF',   hint: '유사색 분리 OFF' },
      weak:   { label: '약하게', hint: 'ΔE < 8 보정' },
      medium: { label: '보통',  hint: 'ΔE < 15 보정' },
      strong: { label: '강하게', hint: 'ΔE < 25 보정' },
    },
    display: {
      section: '표시 모드',
      color:  '컬러',
      symbol: '기호',
      mixed:  '혼합',
    },
    generate: '도안 생성',
    generating: '생성 중...',
    progressDone: '완성되었습니다',
    progressError: '알 수 없는 오류',
  },
  features: [
    { title: 'LAB 색공간 매핑',    desc: '사람 눈 기준으로 가장 가까운 DMC 실 색상을 ΔE 거리로 정확하게 매핑합니다' },
    { title: '유사색 자동 분리',    desc: '인접 색상의 ΔE를 검사해 자동 보정, 구분하기 어려운 배치를 예방합니다' },
    { title: '인쇄용 PDF 출력',    desc: '실 목록, 페이지 분할, DMC 번호가 포함된 고해상도 도안을 내보냅니다' },
    { title: '브라우저 전용 처리',  desc: '업로드한 사진은 서버로 전송되지 않아 개인 사진도 안전합니다' },
  ],
  faq: {
    sectionLabel: 'FAQ',
    title: '자주 묻는 질문',
    items: [
      { q: 'Stitch Pattern Maker는 정말 무료인가요?', a: '네, 완전히 무료입니다. 계정 등록 없이 바로 사용할 수 있으며, 숨겨진 비용이나 기능 제한은 없습니다.' },
      { q: '사진이 서버에서 처리되나요?', a: '아닙니다. 모든 이미지 처리는 브라우저에서만 이루어집니다. 사진은 서버로 전송되지 않아 개인 정보가 안전하게 보호됩니다.' },
      { q: '지원하는 이미지 형식은 무엇인가요?', a: 'JPG와 PNG 형식을 지원합니다.' },
      { q: 'DMC 실 색상은 몇 가지까지 사용할 수 있나요?', a: '5색부터 80색까지 설정할 수 있습니다. 초보자에게는 10~20색이 작업하기 적합합니다.' },
      { q: '도안을 인쇄할 수 있나요?', a: '네, PDF 출력 기능을 통해 실 목록, 페이지 분할, DMC 번호가 포함된 고해상도 도안을 인쇄할 수 있습니다.' },
      { q: '어떤 크기의 도안을 생성해야 할까요?', a: '100×100이 처음 시작하기에 적당한 크기입니다. 크기가 클수록 세밀하지만 작업 시간이 늘어납니다.' },
      { q: '\'유사색 분리\' 설정이란 무엇인가요?', a: '인접한 유사 색상을 자동으로 구분해주는 기능입니다. 활성화하면 비슷한 색끼리 혼재되는 현상을 줄여 작업이 더 쉬워집니다.' },
      { q: '생성된 도안을 상업적으로 사용할 수 있나요?', a: '생성된 도안은 개인 및 상업적 목적 모두에 사용 가능합니다. 단, 원본 사진의 저작권은 별도로 확인하시기 바랍니다.' },
    ],
  },
  toolbar: {
    fit: '맞춤',
    grid: '격자',
    draw: '그리기',
    erase: '지우개',
    fill: '채우기',
    colorPick: '색상 선택',
    zoomHint: 'Ctrl+휠로 줌 · Space+드래그로 이동',
    placeholder: '사진을 업로드하고\n도안 생성을 눌러주세요',
    infoSize: '크기',
    infoColors: '색상',
    infoColorsSuffix: '색',
    infoTotal: '총 칸',
    infoTotalSuffix: '칸',
    dmcPicker: 'DMC 색상 선택',
  },
  palette: {
    sectionTag: 'DMC 팔레트',
    subtitle: '465가지 색상',
    showcaseTitle: '추천 DMC 컬러 — Linen Collection',
    showcaseSubtitle: '장미 정원 · 코튼 · 린넨 계열',
  },
  gallery: {
    heroTitle: '설정 옵션 예시 갤러리',
    heroDesc: '같은 사진도 설정에 따라 완전히 다른 도안이 만들어집니다. 각 옵션별 비교 예시를 확인해보세요.',
    combinationLabel: '전체 설정 조합 계산',
    optionCountSuffix: '가지 옵션',
    combinationSuffix: '가지 조합',
    heroCombinationPrefix: '각 설정별 대표 예시',
    sectionSubtitles: {
      aspect:     '원본 이미지를 격자에 매핑하는 방식',
      colorCount: '사용할 DMC 실 색상의 최대 개수',
      quality:    '전처리 강도와 리샘플링 방식',
      dithering:  '색상 양자화 시 적용할 알고리즘',
      sep:        '인접 유사색을 자동 보정해 작업 난이도 낮춤',
      display:    '도안 캔버스 렌더링 방식',
    },
    ctaMessage: '마음에 드는 스타일을 찾으셨나요?',
    ctaButton:  '도안 만들러 가기 →',
  },
  feedback: {
    title:              '피드백 보내기',
    subtitle:           '버그 제보, 기능 제안, 개선 의견을 자유롭게 남겨주세요.',
    emailLabel:         '이메일 (선택)',
    subjectLabel:       '제목',
    messageLabel:       '내용',
    emailPlaceholder:   'your@email.com',
    subjectPlaceholder: '제목을 입력해주세요',
    messagePlaceholder: '내용을 입력해주세요',
    submitText:         'Send',
    submittingText:     '전송 중...',
    successMessage:     '메시지가 전송되었습니다. 감사합니다!',
  },
  guide: {
    breadcrumbHome: '홈',
    ctaTitle:       '도안을 직접 만들어 볼 준비가 됐나요?',
    ctaDesc:        '사진을 올리면 DMC 실 색상이 매핑된 십자수 도안을 바로 만들 수 있습니다.',
    ctaButton:      '무료로 도안 만들기',
    faqTitle:       '자주 묻는 질문',
    footerDmc:      'DMC 색상표',
    footerGuide:    '가이드',
  },
  dmcColors: {
    groups: {
      all:     '전체',
      red:     '빨강·핑크',
      orange:  '주황·피치',
      yellow:  '노랑·골드',
      green:   '초록',
      blue:    '파랑·청록',
      purple:  '보라·라벤더',
      brown:   '브라운',
      neutral: '중성·무채색',
    },
    searchPlaceholder:  '번호 또는 이름으로 검색...',
    colorCount:         '465색',
    pageTitle:          'DMC 실 색상표',
    pageDesc:           'DMC 자수실 전체 색상을 번호·이름·색상군별로 검색하세요.',
    breadcrumb:         'DMC 색상표',
    popularLabel:       '자주 쓰는 인기 색상',
    beginnerSetLabel:   '십자수 초보 추천 기본 세트',
    noResults:          '검색 결과가 없습니다.',
    similarColors:      '유사색',
    close:              '닫기',
    guideLink:          '← 십자수 입문 가이드 보기',
    createLink:         '도안 만들기',
  },
}

const EN: Translations = {
  meta: {
    title: 'Free Cross Stitch Pattern Maker | Photo to DMC Pattern',
    description: 'Turn any photo into a print-ready DMC cross stitch pattern. Free, browser-only processing — no account required.',
    ogLocale: 'en_US',
    htmlLang: 'en',
  },
  nav: {
    subtitle: 'Cross Stitch Pattern Generator',
    gallery: 'Gallery',
    guide: 'Guide',
    dmcColors: 'DMC Colors',
    feedback: 'Feedback',
    cta: 'Start Free',
  },
  hero: {
    eyebrow: 'Photo to Cross Stitch Pattern Generator',
    h1a: 'Your Photo,',
    h1b: 'Cross-Stitched',
    tagline: 'Turn any precious moment into a stitch-by-stitch pattern —\na quiet, beautiful embroidery studio.',
    steps: ['Upload Photo', 'Set Options', 'Generate', 'Save PDF'],
  },
  upload: {
    prompt: 'Upload a photo',
    dragHint: 'Drag and drop or click\nto load an image',
    replace: 'Click to replace with another photo',
  },
  settings: {
    panelTitle: 'Pattern Settings',
    size: {
      section: 'Pattern Size',
      preset: 'Preset',
      custom: 'Custom',
      width: 'Width (stitches)',
      height: 'Height (stitches)',
      overLimit: 'Too large: maximum is 300 × 300 (90,000 stitches)',
    },
    aspect: {
      section: 'Aspect Mode',
      desc: 'Choose how the source image\nis mapped onto the stitch grid',
      fit:     { label: 'Fit',     hint: 'Preserve ratio + fill margins' },
      crop:    { label: 'Crop',    hint: 'Centre crop — no margins' },
      stretch: { label: 'Stretch', hint: 'Stretch to fill the grid' },
    },
    adjust: {
      section: 'Image Adjustments',
      brightness: 'Brightness',
      contrast: 'Contrast',
      defaultBadge: 'Default',
      reset: 'Reset',
    },
    color: {
      section: 'Color Settings',
      brand: 'Thread Brand',
      count: 'Max Color Count',
      anchorHint: 'Anchor (coming soon)',
      counts: ['20 — Simple', '40 — Balanced', '60 — Detailed', '80 — Fine'],
    },
    quality: {
      section: 'Rendering Quality',
      desc: 'Processing intensity and\nresampling method',
      fast:     { hint: 'Fast generation — flat color' },
      balanced: { hint: 'Balanced — dithering supported' },
      hq:       { hint: 'Best quality — sharpen + confetti cleanup' },
    },
    dither: {
      section: 'Dithering',
      desc: 'Algorithm applied during\ncolor quantization',
      none:     { hint: 'Flat color — sharp edges' },
      floyd:    { hint: 'Floyd–Steinberg dithering' },
      atkinson: { hint: 'Atkinson — smooth dithering' },
      ordered:  { hint: 'Bayer 4×4 matrix pattern' },
    },
    sep: {
      section: 'Similar Color Separation',
      desc: 'Auto-correct adjacent similar colors\nto reduce project difficulty',
      off:    { label: 'OFF',    hint: 'No color separation' },
      weak:   { label: 'Weak',   hint: 'ΔE < 8 correction' },
      medium: { label: 'Medium', hint: 'ΔE < 15 correction' },
      strong: { label: 'Strong', hint: 'ΔE < 25 correction' },
    },
    display: {
      section: 'Display Mode',
      color:  'Color',
      symbol: 'Symbol',
      mixed:  'Mixed',
    },
    generate: 'Generate Pattern',
    generating: 'Generating…',
    progressDone: 'Pattern complete',
    progressError: 'Unknown error',
  },
  features: [
    { title: 'LAB Color Mapping',      desc: 'Maps the closest DMC thread color using CIE ΔE distance — tuned to how humans perceive color.' },
    { title: 'Similar Color Merging',  desc: 'Inspects ΔE between adjacent colors and auto-corrects ambiguous placements.' },
    { title: 'Print-Ready PDF',        desc: 'Export a high-resolution pattern with the thread list, page tiles, and DMC numbers.' },
    { title: 'Browser-Only',           desc: 'Your photos are never uploaded to a server — all processing stays on your device.' },
  ],
  faq: {
    sectionLabel: 'FAQ',
    title: 'Frequently Asked Questions',
    items: [
      { q: 'Is Stitch Pattern Maker really free?', a: 'Yes — completely free, with no hidden costs. Upload a photo, adjust the settings, and download your PDF pattern without creating an account.' },
      { q: 'Does it process my photo on the server?', a: 'No. Everything runs entirely in your browser. Your images are never uploaded to any server, so your photos stay private.' },
      { q: 'What image formats are supported?', a: 'JPEG, PNG, WebP, and GIF are all supported. For best results use a photo with clear subjects and good contrast. Portraits, pets, landscapes, and simple illustrations all work well.' },
      { q: 'How many DMC thread colors can I use?', a: 'You can set anywhere from 5 to 80 colors. For beginners, 10–20 colors keeps the project manageable. Increasing the color count produces more detailed patterns that closely match the original photo.' },
      { q: 'Can I print the pattern?', a: 'Yes. Use the PDF export button to download a print-ready file. Print at 100% scale on A4 paper — the grid lines, color symbols, and DMC thread list are all included.' },
      { q: 'What size pattern should I generate?', a: 'Start with 50×50 to 100×100 stitches. At 14-count Aida fabric that gives a finished piece of roughly 9–18 cm — ideal for a first project. You can go larger once you are comfortable with the process.' },
      { q: 'What is the "color separation" setting?', a: 'Color separation merges thread colors that look very similar (measured in CIE LAB color space). Setting it to Medium or Strong reduces the total number of threads you need to buy and makes it easier to tell colors apart while stitching.' },
      { q: 'Can I use generated patterns for commercial products?', a: 'Patterns generated by this tool are yours to use however you like. Note that the underlying photo must be one you own or have rights to — the tool does not grant rights to third-party images.' },
    ],
  },
  toolbar: {
    fit: 'Fit',
    grid: 'Grid',
    draw: 'Draw',
    erase: 'Erase',
    fill: 'Fill',
    colorPick: 'Pick color',
    zoomHint: 'Ctrl+scroll to zoom · Space+drag to pan',
    placeholder: 'Upload a photo and\nclick Generate',
    infoSize: 'Size',
    infoColors: 'Colors',
    infoColorsSuffix: '',
    infoTotal: 'Cells',
    infoTotalSuffix: '',
    dmcPicker: 'Select DMC color',
  },
  palette: {
    sectionTag: 'DMC Palette',
    subtitle: '465 colors',
    showcaseTitle: 'Featured DMC Colors — Linen Collection',
    showcaseSubtitle: 'Rose Garden · Cotton · Linen tones',
  },
  gallery: {
    heroTitle: 'Pattern Settings Gallery',
    heroDesc: 'The same photo looks completely different depending on the settings. Compare examples for each option.',
    combinationLabel: 'Total Setting Combinations',
    optionCountSuffix: 'options',
    combinationSuffix: 'combinations',
    heroCombinationPrefix: 'representative samples per setting:',
    sectionSubtitles: {
      aspect:     'How the source image maps to the stitch grid',
      colorCount: 'Maximum number of DMC thread colors',
      quality:    'Pre-processing intensity and resampling method',
      dithering:  'Algorithm applied during color quantization',
      sep:        'Auto-corrects adjacent similar colors to reduce difficulty',
      display:    'Canvas rendering style',
    },
    ctaMessage: 'Found a style you like?',
    ctaButton:  'Create your pattern →',
  },
  feedback: {
    title:              'Send Feedback',
    subtitle:           'Bug reports, feature requests, and improvement suggestions are all welcome.',
    emailLabel:         'Email (optional)',
    subjectLabel:       'Subject',
    messageLabel:       'Message',
    emailPlaceholder:   'your@email.com',
    subjectPlaceholder: 'Enter a subject',
    messagePlaceholder: 'Enter your message',
    submitText:         'Send',
    submittingText:     'Sending...',
    successMessage:     'Message sent. Thank you!',
  },
  guide: {
    breadcrumbHome: 'Home',
    ctaTitle:       'Ready to create your own pattern?',
    ctaDesc:        'Upload a photo and get a DMC cross stitch pattern in seconds — free, no account needed.',
    ctaButton:      'Create a free pattern',
    faqTitle:       'Frequently Asked Questions',
    footerDmc:      'DMC Colors',
    footerGuide:    'Guide',
  },
  dmcColors: {
    groups: {
      all:     'All',
      red:     'Red · Pink',
      orange:  'Orange · Peach',
      yellow:  'Yellow · Gold',
      green:   'Green',
      blue:    'Blue · Teal',
      purple:  'Purple · Lavender',
      brown:   'Brown',
      neutral: 'Neutral · Achromatic',
    },
    searchPlaceholder:  'Search by number or name...',
    colorCount:         '465 colors',
    pageTitle:          'DMC Color Chart',
    pageDesc:           'Browse all 465 DMC embroidery thread colors by number, name, or color group.',
    breadcrumb:         'DMC Colors',
    popularLabel:       'Popular Colors',
    beginnerSetLabel:   'Beginner Starter Set',
    noResults:          'No results found.',
    similarColors:      'Similar Colors',
    close:              'Close',
    guideLink:          '← View Cross Stitch Beginner Guide',
    createLink:         'Create Pattern',
  },
}

const JA: Translations = {
  meta: {
    title: '無料クロスステッチ図案メーカー | 写真からDMC図案へ',
    description: '写真をDMCクロスステッチ図案に即変換。完全無料、ブラウザのみ処理、アカウント不要。',
    ogLocale: 'ja_JP',
    htmlLang: 'ja',
  },
  nav: {
    subtitle: 'クロスステッチ図案ジェネレーター',
    gallery: 'ギャラリー',
    guide: 'ガイド',
    dmcColors: 'DMC色見本',
    feedback: 'フィードバック',
    cta: '無料で始める',
  },
  hero: {
    eyebrow: '写真からクロスステッチ図案ジェネレーター',
    h1a: '写真を',
    h1b: 'クロスステッチ図案に',
    tagline: '大切な瞬間を一針ずつ刺繍に —\n静かで温かな図案アトリエ',
    steps: ['写真をアップロード', 'オプション設定', '図案を生成', 'PDF保存'],
  },
  upload: {
    prompt: '写真をアップロード',
    dragHint: 'ドラッグするかクリックして\n画像を読み込む',
    replace: 'クリックして別の写真に変更',
  },
  settings: {
    panelTitle: '図案設定',
    size: {
      section: '図案サイズ',
      preset: 'プリセット',
      custom: 'カスタム入力',
      width: '横 (マス)',
      height: '縦 (マス)',
      overLimit: '変換不可: 最大300×300 (90,000マス)を超えています',
    },
    aspect: {
      section: '比率モード',
      desc: '元画像をグリッドにマッピングする\n方法を選択します',
      fit:     { label: 'Fit',     hint: '元の比率を維持 + 余白を埋める' },
      crop:    { label: 'Crop',    hint: '中央基準でクロップ — 余白なし' },
      stretch: { label: 'Stretch', hint: 'グリッドに合わせて引き伸ばす' },
    },
    adjust: {
      section: '画像調整',
      brightness: '明るさ',
      contrast: 'コントラスト',
      defaultBadge: 'デフォルト',
      reset: 'リセット',
    },
    color: {
      section: 'カラー設定',
      brand: '刺繍糸ブランド',
      count: '最大カラー数',
      anchorHint: 'Anchor (準備中)',
      counts: ['20色 — シンプル', '40色 — バランス', '60色 — 詳細', '80色 — 精細'],
    },
    quality: {
      section: 'レンダリング品質',
      desc: '前処理の強度と\nリサンプリング方式を選択',
      fast:     { hint: '高速生成 — フラットカラー' },
      balanced: { hint: 'バランス — ディザリング対応' },
      hq:       { hint: '最高品質 — シャープン+コンフェッティ整理' },
    },
    dither: {
      section: 'ディザリング',
      desc: '色量子化時に適用する\nアルゴリズムを選択します',
      none:     { hint: 'フラットカラー — 明確な境界' },
      floyd:    { hint: 'Floyd–Steinberg ディザリング' },
      atkinson: { hint: 'Atkinson — 滑らかなディザリング' },
      ordered:  { hint: 'Bayer 4×4 マトリクスパターン' },
    },
    sep: {
      section: '類似色自動分離',
      desc: '隣接する類似色を自動補正して\n難易度を下げます',
      off:    { label: 'OFF',  hint: '類似色分離OFF' },
      weak:   { label: '弱め',  hint: 'ΔE < 8 補正' },
      medium: { label: '中程度', hint: 'ΔE < 15 補正' },
      strong: { label: '強め',  hint: 'ΔE < 25 補正' },
    },
    display: {
      section: '表示モード',
      color:  'カラー',
      symbol: '記号',
      mixed:  '混合',
    },
    generate: '図案を生成',
    generating: '生成中...',
    progressDone: '完成しました',
    progressError: '不明なエラー',
  },
  features: [
    { title: 'LAB色空間マッピング',  desc: 'CIE LAB色空間でΔE距離を使い、人の目に最も近いDMC糸色を正確にマッピング。' },
    { title: '類似色自動分離',       desc: '隣接色のΔEを検査して自動補正、識別困難な配置を予防します。' },
    { title: '印刷用PDF出力',        desc: '糸リスト・ページ分割・DMC番号入りの高解像度図案を出力。' },
    { title: 'ブラウザのみで処理',   desc: 'アップロードした写真はサーバーに送信されず、プライバシーが守られます。' },
  ],
  faq: {
    sectionLabel: 'FAQ',
    title: 'よくある質問',
    items: [
      { q: 'Stitch Pattern Makerは本当に無料ですか？', a: 'はい、完全無料です。アカウント登録なしですぐにご利用いただけます。' },
      { q: '写真はサーバーで処理されますか？', a: 'いいえ。すべての画像処理はブラウザ上で行われます。写真はサーバーに送信されないため、プライバシーが守られます。' },
      { q: '対応している画像フォーマットは？', a: 'JPGとPNG形式に対応しています。' },
      { q: 'DMC糸は何色まで使えますか？', a: '5色から80色まで設定できます。初心者には10〜20色がおすすめです。' },
      { q: '図案を印刷できますか？', a: 'はい。PDF出力機能を使って、糸リスト・ページ分割・DMC番号入りの高解像度図案を印刷できます。' },
      { q: 'どのくらいのサイズの図案を作ればいいですか？', a: '100×100が初心者に最適なサイズです。サイズが大きいほど細かくなりますが、作業時間も増えます。' },
      { q: '「類似色分離」設定とは何ですか？', a: '隣接する似た色を自動的に分離する機能です。有効にすると、似た色が混在する問題を減らし、刺繍作業がしやすくなります。' },
      { q: '生成した図案を商品に使用できますか？', a: '生成した図案は個人・商用問わずご利用いただけます。ただし、元の写真の著作権については別途ご確認ください。' },
    ],
  },
  toolbar: {
    fit: '画面に合わせる',
    grid: 'グリッド',
    draw: '描く',
    erase: '消しゴム',
    fill: '塗りつぶし',
    colorPick: '色を選択',
    zoomHint: 'Ctrl+スクロールでズーム · Space+ドラッグで移動',
    placeholder: '写真をアップロードして\n図案を生成してください',
    infoSize: 'サイズ',
    infoColors: '色数',
    infoColorsSuffix: '色',
    infoTotal: '総マス数',
    infoTotalSuffix: 'マス',
    dmcPicker: 'DMC色を選択',
  },
  palette: {
    sectionTag: 'DMCパレット',
    subtitle: '465色',
    showcaseTitle: 'おすすめDMCカラー — リネンコレクション',
    showcaseSubtitle: 'ローズガーデン · コットン · リネン系',
  },
  gallery: {
    heroTitle: '設定オプションサンプルギャラリー',
    heroDesc: '同じ写真でも設定次第でまったく異なる図案になります。各オプションの比較サンプルをご覧ください。',
    combinationLabel: '設定の全組み合わせ数',
    optionCountSuffix: '種類',
    combinationSuffix: '通りの組み合わせ',
    heroCombinationPrefix: '各設定の代表サンプル',
    sectionSubtitles: {
      aspect:     '元の画像をグリッドにマッピングする方法',
      colorCount: '使用するDMC糸色の最大数',
      quality:    '前処理の強度とリサンプリング方式',
      dithering:  '色量子化に使用するアルゴリズム',
      sep:        '隣接する類似色を自動補正して難易度を下げる',
      display:    '図案キャンバスの表示スタイル',
    },
    ctaMessage: 'お気に入りのスタイルは見つかりましたか？',
    ctaButton:  '図案を作成する →',
  },
  feedback: {
    title:              'フィードバックを送る',
    subtitle:           'バグ報告、機能リクエスト、改善提案などお気軽にどうぞ。',
    emailLabel:         'メールアドレス（任意）',
    subjectLabel:       '件名',
    messageLabel:       'メッセージ',
    emailPlaceholder:   'your@email.com',
    subjectPlaceholder: '件名を入力してください',
    messagePlaceholder: 'メッセージを入力してください',
    submitText:         '送信',
    submittingText:     '送信中...',
    successMessage:     'メッセージを送信しました。ありがとうございます！',
  },
  guide: {
    breadcrumbHome: 'ホーム',
    ctaTitle:       'あなただけの図案を作る準備はできていますか？',
    ctaDesc:        '写真をアップロードするだけで、DMCクロスステッチ図案をすぐに生成できます。',
    ctaButton:      '無料で図案を作成',
    faqTitle:       'よくある質問',
    footerDmc:      'DMC色見本',
    footerGuide:    'ガイド',
  },
  dmcColors: {
    groups: {
      all:     '全色',
      red:     'レッド・ピンク',
      orange:  'オレンジ・ピーチ',
      yellow:  'イエロー・ゴールド',
      green:   'グリーン',
      blue:    'ブルー・ティール',
      purple:  'パープル・ラベンダー',
      brown:   'ブラウン',
      neutral: 'ニュートラル・無彩色',
    },
    searchPlaceholder:  '番号または名前で検索...',
    colorCount:         '465色',
    pageTitle:          'DMC糸色見本',
    pageDesc:           'DMC刺繍糸の全465色を番号・名前・カラーグループで検索できます。',
    breadcrumb:         'DMC色見本',
    popularLabel:       '人気カラー',
    beginnerSetLabel:   '初心者向けスターターセット',
    noResults:          '検索結果がありません。',
    similarColors:      '類似色',
    close:              '閉じる',
    guideLink:          '← クロスステッチ入門ガイドを見る',
    createLink:         '図案を作成',
  },
}

export const locales: Record<Locale, Translations> = { ko: KO, en: EN, ja: JA }
export const LOCALE_STORAGE_KEY = 'spm_lang'
