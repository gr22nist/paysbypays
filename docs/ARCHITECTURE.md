# 아키텍처 문서

> **프로젝트**: PaysByPays Dashboard  
> **버전**: 1.0  
> **최종 업데이트**: 2025-11-28

---

## 1. 개요

PaysByPays Dashboard는 Next.js 15 (App Router) 기반의 결제대행사 대시보드 애플리케이션입니다. React 19, TypeScript, Tailwind CSS 4를 사용하여 구축되었으며, 모듈화된 컴포넌트 구조와 상태 관리 시스템을 통해 확장 가능하고 유지보수하기 쉬운 아키텍처를 제공합니다.

---

## 2. 기술 스택

### 2.1 핵심 프레임워크 및 라이브러리

- **Next.js 16.0.3** (App Router)
  - 서버 사이드 렌더링 및 클라이언트 사이드 라우팅
  - API 라우트를 통한 프록시 서버 구현 (`/api/proxy/[...path]`)
  
- **React 19.2.0**
  - 최신 React 기능 활용 (Server Components, Suspense 등)
  
- **TypeScript 5.x**
  - 타입 안전성 보장
  - 엄격한 타입 체크로 런타임 오류 방지

### 2.2 스타일링

- **Tailwind CSS 4**
  - 유틸리티 기반 CSS 프레임워크
  - CSS 변수를 통한 다크 모드 및 테마 지원
  - 반응형 디자인 (모바일, 태블릿, 데스크톱)

- **Pretendard 폰트**
  - 한국어 최적화 웹폰트

### 2.3 상태 관리

- **Zustand 5.0.8**
  - 경량 상태 관리 라이브러리
  - 4개의 주요 스토어:
    - `preferences-store`: 사용자 설정 (테마, 언어, 통화, 날짜 형식, 접근성)
    - `filter-store`: 전역 필터 상태 (거래 상태, 결제 수단, 날짜 범위)
    - `health-store`: 시스템 헬스 모니터링 상태
    - `ui-store`: UI 상태 (사이드바 접기/펼치기)

### 2.4 데이터 시각화

- **Recharts 3.5.0**
  - 거래 트렌드 차트
  - 정산 타임라인 차트
  - 결제 수단별 통계 차트

### 2.5 국제화 (i18n)

- **@hua-labs/i18n-core** (로컬 패키지, 자체 개발)
  - 다국어 지원 (한국어, 영어, 일본어)
  - 네임스페이스 기반 번역 관리
  - 동적 번역 로딩
  - **주요 기능**: `useTranslation`, `useLanguageChange`, `createCoreI18n`
  - **사용 파일 수**: 33개
  - **설치 방법**: 로컬 tarball (`hua-labs-i18n-core-1.0.0.tgz`)
  - 자세한 내용은 [PACKAGES.md](./PACKAGES.md) 참조

### 2.6 UI 컴포넌트

- **@hua-labs/ui** (로컬 패키지, 자체 개발)
  - 재사용 가능한 UI 컴포넌트 라이브러리
  - **주요 컴포넌트**: `StatsPanel`, `Pagination`, `Drawer`, `Icon`, `SkeletonTable`, `SkeletonList`, `SkeletonRounded`, `SectionHeader`, `Switch`, `ThemeProvider`
  - **사용 파일 수**: 43개
  - **설치 방법**: 로컬 tarball (`hua-labs-ui-1.0.0.tgz`)
  - 자세한 내용은 [PACKAGES.md](./PACKAGES.md) 참조

### 2.7 기타 라이브러리

- **exceljs 4.4.0**: Excel 파일 내보내기 기능
- **zustand/middleware**: localStorage 영속성 지원

---

## 3. 프로젝트 구조

```
dashboard/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── page.tsx            # 대시보드 홈
│   │   ├── transactions/       # 거래 내역 페이지
│   │   ├── merchants/          # 가맹점 관리 페이지
│   │   ├── settlements/        # 정산 페이지
│   │   ├── analytics/          # 분석 페이지
│   │   ├── settings/           # 설정 페이지
│   │   ├── system-health/      # 시스템 상태 페이지
│   │   ├── api/                # API 라우트
│   │   │   ├── proxy/          # CORS 프록시
│   │   │   └── translations/  # 번역 API
│   │   └── layout.tsx          # 루트 레이아웃
│   │
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── analytics/          # 분석 관련 컴포넌트
│   │   ├── badges/             # 배지 컴포넌트
│   │   ├── charts/             # 차트 컴포넌트
│   │   ├── dashboard/          # 대시보드 위젯
│   │   ├── health/             # 시스템 헬스 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── merchants/          # 가맹점 관련 컴포넌트
│   │   ├── settlements/        # 정산 관련 컴포넌트
│   │   ├── settings/           # 설정 관련 컴포넌트
│   │   ├── transactions/       # 거래 관련 컴포넌트
│   │   └── providers/          # Context Provider
│   │
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useTransactions.ts
│   │   ├── useMerchants.ts
│   │   ├── useDisplayFormat.ts
│   │   ├── useTransactionTable.ts
│   │   ├── useHealthMonitoring.ts
│   │   └── ...
│   │
│   ├── store/                  # Zustand 스토어
│   │   ├── preferences-store.ts
│   │   ├── filter-store.ts
│   │   ├── health-store.ts
│   │   └── ui-store.ts
│   │
│   ├── lib/                    # 유틸리티 및 설정
│   │   ├── api/                # API 클라이언트
│   │   │   ├── client.ts        # API 클라이언트 구현
│   │   │   └── types.ts         # API 타입 정의
│   │   ├── health/             # 헬스 체크 유틸리티
│   │   ├── utils/              # 공통 유틸리티
│   │   └── i18n-config.ts      # i18n 설정
│   │
│   ├── data/                   # Mock 데이터 및 상수
│   │   ├── health.ts
│   │   ├── settlements.ts
│   │   └── ...
│   │
│   └── types/                  # TypeScript 타입 정의
│       ├── health.ts
│       ├── date-preset.ts
│       └── trend-chart.ts
│
├── translations/               # 번역 파일
│   ├── ko/
│   ├── en/
│   └── ja/
│
└── docs/                       # 문서
    ├── ARCHITECTURE.md         # 이 문서
    ├── FEATURES.md             # 기능 설명
    ├── DEVELOPMENT.md          # 개발 진행 및 결과
    └── ...
```

---

## 4. 아키텍처 패턴

### 4.1 컴포넌트 구조

#### 계층 구조
1. **페이지 레벨** (`src/app/*/page.tsx`)
   - 라우트별 페이지 컴포넌트
   - 데이터 페칭 및 상태 관리 조율
   - 레이아웃 및 섹션 컴포넌트 조합

2. **섹션 레벨** (`src/components/*/`)
   - 페이지 내 주요 기능 블록
   - 예: `TransactionStatsPanel`, `MerchantTable`, `SettlementTimelineChart`

3. **원자 컴포넌트** (`src/components/badges/`, `src/components/charts/`)
   - 재사용 가능한 작은 단위 컴포넌트
   - 예: `TransactionStatusBadge`, `PaymentMethodBadge`

#### 컴포넌트 분리 원칙
- **단일 책임 원칙**: 각 컴포넌트는 하나의 명확한 역할만 수행
- **재사용성**: 공통 패턴을 컴포넌트로 추출
- **조합 가능성**: 작은 컴포넌트를 조합하여 복잡한 UI 구성

### 4.2 상태 관리 전략

#### Zustand 스토어 구조

**1. Preferences Store** (`preferences-store.ts`)
```typescript
- theme: "light" | "dark" | "system"
- language: "ko" | "en" | "ja"
- dateFormat: "YYYY-MM-DD" | "YYYY/MM/DD" | "MM/DD/YYYY"
- currency: "KRW" | "USD" | "JPY"
- fontScale: "small" | "medium" | "large" | "xlarge"
- highContrast: boolean
- reducedMotion: boolean
```
- **영속성**: localStorage에 자동 저장
- **자동 동기화**: 언어 변경 시 통화 자동 변경

**2. Filter Store** (`filter-store.ts`)
- 전역 필터 상태 관리
- 거래 상태, 결제 수단, 날짜 범위 필터

**3. Health Store** (`health-store.ts`)
- 시스템 헬스 모니터링 상태
- 폴링 로직 포함 (30초 간격)
- 스냅샷 히스토리 관리

**4. UI Store** (`ui-store.ts`)
- 사이드바 접기/펼치기 상태
- 모바일 오버레이 상태

### 4.3 데이터 페칭 전략

#### API 클라이언트 (`lib/api/client.ts`)
- **프록시 패턴**: Next.js API 라우트를 통한 CORS 해결
- **에러 처리**: `ApiError` 클래스로 통일된 에러 처리
- **타입 안전성**: TypeScript로 API 응답 타입 정의

#### 커스텀 훅 패턴
```typescript
// 예: useTransactions
- useState로 로딩/에러 상태 관리
- useEffect로 자동 데이터 페칭
- params 변경 시 자동 refetch
```

### 4.4 포맷팅 및 국제화

#### `useDisplayFormat` 훅
- 통화 포맷팅 (KRW, USD, JPY)
- 날짜/시간 포맷팅
- 사용자 설정에 따라 동적 변경
- 환율 변환 지원

#### i18n 구조
- 네임스페이스 기반: `common`, `dashboard`, `transactions`, `merchants` 등
- 동적 로딩: 필요한 번역만 로드
- Fallback 지원: 번역 키가 없을 경우 기본 언어 사용

---

## 5. 주요 아키텍처 결정

### 5.1 Next.js App Router 선택 이유
- **서버 컴포넌트**: 초기 로딩 성능 향상
- **라우팅**: 파일 기반 라우팅으로 직관적
- **API 라우트**: 프록시 서버 구현 용이

### 5.2 Zustand 선택 이유
- **경량**: Redux 대비 작은 번들 사이즈
- **간단한 API**: 보일러플레이트 최소화
- **TypeScript 지원**: 타입 안전성 보장
- **영속성 미들웨어**: localStorage 연동 간편

### 5.3 컴포넌트 분리 전략
- **리팩토링 결과**: 주요 페이지를 평균 60% 코드 감소
- **재사용성**: 30+ 개의 재사용 가능한 컴포넌트 생성
- **유지보수성**: 각 컴포넌트가 단일 책임을 가짐

### 5.4 CORS 해결 방법
- **Next.js API 프록시**: `/api/proxy/[...path]` 라우트
- **서버 사이드 요청**: 브라우저 CORS 정책 우회
- **에러 처리**: 프록시 레벨에서 에러 캐칭 및 변환

---

## 6. 성능 최적화

### 6.1 코드 스플리팅
- 페이지별 자동 코드 스플리팅 (Next.js 기본 기능)
- 동적 import를 통한 컴포넌트 지연 로딩

### 6.2 상태 관리 최적화
- Zustand의 `useShallow`를 통한 불필요한 리렌더링 방지
- 개별 슬라이스 구독으로 최적화

### 6.3 번역 로딩
- 비동기 번역 로딩 (블로킹하지 않음)
- 네임스페이스별 지연 로딩

---

## 7. 확장성 고려사항

### 7.1 컴포넌트 확장
- 새로운 페이지 추가 시 기존 컴포넌트 재사용 가능
- 섹션 컴포넌트를 조합하여 새로운 레이아웃 구성

### 7.2 API 확장
- `lib/api/client.ts`에 새로운 API 엔드포인트 추가 용이
- 타입 정의를 통한 안전한 API 확장

### 7.3 다국어 확장
- `translations/` 디렉토리에 새로운 언어 추가
- i18n 설정만 수정하면 자동 지원

---

## 8. 보안 고려사항

### 8.1 API 프록시
- 클라이언트에서 직접 외부 API 호출 방지
- 서버 사이드에서 API 키 관리 가능

### 8.2 XSS 방지
- React의 자동 이스케이핑
- 사용자 입력 검증

### 8.3 타입 안전성
- TypeScript로 런타임 오류 방지
- API 응답 타입 검증

---

## 9. 개발 환경

### 9.1 필수 도구
- Node.js 20+
- npm
- TypeScript 5.x

### 9.2 개발 서버
```bash
npm run dev
```
- Next.js 개발 서버 실행
- Hot Module Replacement (HMR) 지원

### 9.3 빌드
```bash
npm run build
npm start
```
- 프로덕션 빌드
- 최적화된 번들 생성

---

## 10. 자체 개발 패키지

이 프로젝트는 자체 개발한 두 개의 로컬 패키지를 사용합니다. 자세한 사용 현황은 [PACKAGES.md](./PACKAGES.md)를 참조하세요.

### 10.1 @hua-labs/ui
- **용도**: UI 컴포넌트 라이브러리
- **주요 컴포넌트**: Icon, StatsPanel, Pagination, Drawer, Skeleton 시리즈, SectionHeader, Switch, ThemeProvider
- **사용 범위**: 43개 파일에서 사용

### 10.2 @hua-labs/i18n-core
- **용도**: 국제화(i18n) 코어 라이브러리
- **주요 기능**: useTranslation, useLanguageChange, createCoreI18n
- **사용 범위**: 33개 파일에서 사용

---

## 11. 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Recharts 공식 문서](https://recharts.org/)
- [PACKAGES.md](./PACKAGES.md): 자체 개발 패키지 사용 현황

---

**문서 작성일**: 2025-11-28  
**작성자**: AI Assistant  
**검토 상태**: 코드베이스 기반 실제 구현 내용 반영

