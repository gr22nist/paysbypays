# 패키지 사용 현황 문서

> **프로젝트**: PaysByPays Dashboard  
> **버전**: 1.0  
> **최종 업데이트**: 2025-11-28

---

## 1. 개요

이 프로젝트는 자체 개발한 두 개의 로컬 패키지를 사용합니다:
- **@hua-labs/ui**: UI 컴포넌트 라이브러리
- **@hua-labs/i18n-core**: 국제화(i18n) 코어 라이브러리

두 패키지 모두 로컬 tarball 파일로 설치되어 있으며, 프로젝트의 핵심 기능을 제공합니다.

---

## 2. @hua-labs/ui 패키지

### 2.1 패키지 정보
- **버전**: 1.0.0
- **설치 방법**: 로컬 tarball (`hua-labs-ui-1.0.0.tgz`)
- **설치 위치**: 프로젝트 루트 디렉토리
- **사용 파일 수**: 43개 파일

### 2.2 사용된 컴포넌트

#### 2.2.1 Icon
- **사용 파일 수**: 35개 파일
- **용도**: 아이콘 표시
- **주요 사용 위치**:
  - 사이드바 네비게이션 아이콘
  - 버튼 아이콘
  - 상태 표시 아이콘
  - 액션 버튼 아이콘

**사용 예시**:
```typescript
import { Icon } from "@hua-labs/ui";
<Icon name="menu" size={18} />
```

#### 2.2.2 StatsPanel
- **사용 파일 수**: 8개 파일
- **용도**: 통계 패널 표시
- **주요 사용 위치**:
  - 대시보드 통계 요약
  - 거래 내역 통계
  - 가맹점 통계
  - 정산 통계
  - 분석 통계
  - 시스템 상태 요약

**사용 예시**:
```typescript
import { StatsPanel } from "@hua-labs/ui";
<StatsPanel columns={4} items={[...]} />
```

#### 2.2.3 Pagination
- **사용 파일 수**: 4개 파일
- **용도**: 페이지네이션
- **주요 사용 위치**:
  - 거래 내역 테이블
  - 가맹점 테이블
  - 정산 내역 테이블
  - 가맹점 거래 내역 테이블

**사용 예시**:
```typescript
import { Pagination } from "@hua-labs/ui";
<Pagination currentPage={1} totalPages={10} onPageChange={handlePageChange} />
```

#### 2.2.4 Drawer
- **사용 파일 수**: 2개 파일
- **용도**: 사이드 드로어 (상세 정보 표시)
- **주요 사용 위치**:
  - 거래 상세 Drawer
  - 공통 DetailDrawer

**사용 예시**:
```typescript
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from "@hua-labs/ui";
<Drawer open={open} onOpenChange={onOpenChange}>
  <DrawerHeader>...</DrawerHeader>
  <DrawerContent>...</DrawerContent>
  <DrawerFooter>...</DrawerFooter>
</Drawer>
```

#### 2.2.5 Skeleton 컴포넌트
- **SkeletonTable**: 테이블 로딩 스켈레톤
- **SkeletonList**: 리스트 로딩 스켈레톤
- **SkeletonRounded**: 둥근 형태 로딩 스켈레톤
- **사용 파일 수**: 3개 파일

**사용 예시**:
```typescript
import { SkeletonTable } from "@hua-labs/ui";
{isLoading ? <SkeletonTable rows={5} /> : <Table />}
```

#### 2.2.6 SectionHeader
- **사용 파일 수**: 4개 파일
- **용도**: 섹션 헤더 표시
- **주요 사용 위치**:
  - 거래 상세 정보 카드
  - 가맹점 상세 정보 카드
  - 섹션 헤더 블록

**사용 예시**:
```typescript
import { SectionHeader } from "@hua-labs/ui";
<SectionHeader title="제목" description="설명" />
```

#### 2.2.7 Switch
- **사용 파일 수**: 1개 파일
- **용도**: 토글 스위치
- **주요 사용 위치**:
  - 설정 페이지 (접근성 옵션)

**사용 예시**:
```typescript
import { Switch } from "@hua-labs/ui";
<Switch checked={enabled} onCheckedChange={handleChange} />
```

#### 2.2.8 ThemeProvider
- **사용 파일 수**: 1개 파일
- **용도**: 테마 제공자
- **주요 사용 위치**:
  - AppProviders (루트 레벨)

**사용 예시**:
```typescript
import { ThemeProvider } from "@hua-labs/ui";
<ThemeProvider defaultTheme="light">
  {children}
</ThemeProvider>
```

### 2.3 패키지 설치

#### 설치 방법
프로젝트 루트에 이미 tarball 파일이 포함되어 있으므로, 다음 명령어로 설치할 수 있습니다:

```bash
npm install
```

또는 개별 패키지만 설치하려면:

```bash
npm install ./hua-labs-ui-1.0.0.tgz
```

---

## 3. @hua-labs/i18n-core 패키지

### 3.1 패키지 정보
- **버전**: 1.0.0
- **설치 방법**: 로컬 tarball (`hua-labs-i18n-core-1.0.0.tgz`)
- **설치 위치**: 프로젝트 루트 디렉토리
- **사용 파일 수**: 33개 파일

### 3.2 사용된 기능

#### 3.2.1 useTranslation 훅
- **사용 파일 수**: 32개 파일
- **용도**: 번역 함수 제공
- **주요 사용 위치**:
  - 모든 페이지 컴포넌트
  - 모든 섹션 컴포넌트
  - 레이아웃 컴포넌트

**사용 예시**:
```typescript
import { useTranslation } from "@hua-labs/i18n-core";
const { t } = useTranslation();
<span>{t("common:statuses.approved")}</span>
```

#### 3.2.2 useLanguageChange 훅
- **사용 파일 수**: 1개 파일
- **용도**: 언어 변경 함수 제공
- **주요 사용 위치**:
  - LanguageSwitcher 컴포넌트

**사용 예시**:
```typescript
import { useLanguageChange } from "@hua-labs/i18n-core";
const changeLanguage = useLanguageChange();
changeLanguage("en");
```

#### 3.2.3 createCoreI18n 함수
- **사용 파일 수**: 1개 파일
- **용도**: i18n 코어 인스턴스 생성
- **주요 사용 위치**:
  - `src/lib/i18n-config.ts`

**사용 예시**:
```typescript
import { createCoreI18n } from "@hua-labs/i18n-core";
const provider = createCoreI18n({
  defaultLanguage: "ko",
  fallbackLanguage: "en",
  namespaces: ["common", "dashboard", ...],
  translationLoader: "api",
  translationApiPath: "/api/translations",
});
```

### 3.3 i18n 설정

#### 지원 언어
- 한국어 (`ko`)
- 영어 (`en`)
- 일본어 (`ja`)

#### 네임스페이스
- `common`: 공통 번역
- `layout`: 레이아웃 관련 번역
- `dashboard`: 대시보드 관련 번역
- `transactions`: 거래 관련 번역
- `merchants`: 가맹점 관련 번역
- `settlements`: 정산 관련 번역
- `analytics`: 분석 관련 번역
- `settings`: 설정 관련 번역

#### 번역 파일 구조
```
translations/
├── ko/
│   ├── common.json
│   ├── layout.json
│   ├── dashboard.json
│   ├── transactions.json
│   ├── merchants.json
│   ├── settlements.json
│   ├── analytics.json
│   └── settings.json
├── en/
│   └── (동일한 구조)
└── ja/
    └── (동일한 구조)
```

#### 번역 로딩 방식
- **API 라우트**: `/api/translations/[language]/[namespace]`
- **동적 로딩**: 필요한 번역만 로드
- **캐싱**: 번역 파일을 메모리에 캐싱하여 중복 요청 방지
- **Fallback**: 번역 키가 없을 경우 기본 언어 사용

### 3.4 패키지 설치

#### 설치 방법
프로젝트 루트에 이미 tarball 파일이 포함되어 있으므로, 다음 명령어로 설치할 수 있습니다:

```bash
npm install
```

또는 개별 패키지만 설치하려면:

```bash
npm install ./hua-labs-i18n-core-1.0.0.tgz
```

---

## 4. 패키지 통합 방식

### 4.1 설치 방식
두 패키지 모두 로컬 tarball 파일로 설치되어 있습니다:
```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "file:./hua-labs-i18n-core-1.0.0.tgz",
    "@hua-labs/ui": "file:hua-labs-ui-1.0.0.tgz"
  }
}
```

**참고**: 두 패키지는 모두 프로젝트에 포함된 로컬 tarball 파일로 설치됩니다. 패키지 업데이트는 프로젝트 관리자가 별도로 제공하는 경우에만 가능합니다.

### 4.2 통합 포인트

#### AppProviders
- `ThemeProvider`를 통한 테마 관리
- `I18nProvider`를 통한 다국어 지원
- 두 시스템의 동기화 브리지 컴포넌트

#### i18n 설정
- `src/lib/i18n-config.ts`에서 i18n-core 설정
- API 라우트를 통한 번역 파일 로딩
- 캐싱 및 Fallback 메커니즘

---

## 5. 패키지별 사용 통계

### 5.1 @hua-labs/ui
- **총 사용 파일**: 43개
- **가장 많이 사용된 컴포넌트**: Icon (35개 파일)
- **주요 사용 영역**:
  - 레이아웃 컴포넌트
  - 대시보드 위젯
  - 테이블 및 리스트
  - 설정 페이지

### 5.2 @hua-labs/i18n-core
- **총 사용 파일**: 33개
- **가장 많이 사용된 기능**: useTranslation (32개 파일)
- **주요 사용 영역**:
  - 모든 페이지 컴포넌트
  - 모든 섹션 컴포넌트
  - 레이아웃 컴포넌트
  - 설정 페이지

---

## 6. 패키지 의존성

### 6.1 @hua-labs/ui 의존성
- React 19.2.0
- Tailwind CSS 4.0
- 기타 UI 관련 라이브러리

### 6.2 @hua-labs/i18n-core 의존성
- React 19.2.0
- 번역 파일 로딩을 위한 API 라우트

---

## 7. 패키지 적용 과정 (참고)

이 프로젝트는 자체 개발한 두 개의 패키지를 사용합니다. 패키지는 프로젝트 루트에 tarball 파일로 포함되어 있으며, `npm install` 시 자동으로 설치됩니다.

**적용 과정** (개발 시):
1. 자체 개발 패키지를 빌드하여 tarball 생성
2. tarball을 프로젝트 루트에 포함
3. `package.json`에 로컬 파일 경로로 의존성 추가
4. `npm install`로 설치

**사용자 안내**:
- 프로젝트를 클론한 후 `npm install`만 실행하면 자동으로 설치됩니다.

---

## 8. 패키지 개발 노트

### 8.1 왜 로컬 패키지를 사용하는가?
- **재사용성**: 여러 프로젝트에서 공통 컴포넌트 및 기능 재사용
- **일관성**: 동일한 디자인 시스템 및 i18n 구조 유지
- **유지보수성**: 공통 기능을 한 곳에서 관리
- **타입 안전성**: TypeScript로 타입 안전성 보장

### 8.2 패키지 개발 프로세스 (참고)
이 프로젝트 개발 시 패키지는 다음과 같은 과정으로 적용되었습니다:
1. 자체 개발 패키지 프로젝트에서 개발 및 빌드
2. tarball 생성
3. 프로젝트에 포함 및 `package.json`에 의존성 추가
4. `npm install`로 설치 및 테스트

---

## 9. 참고 자료

이 패키지들은 자체 개발한 로컬 패키지입니다. 패키지 소스 코드는 별도 저장소에서 관리되며, 이 프로젝트에서는 빌드된 tarball 파일만 사용합니다.

---

**문서 작성일**: 2025-11-28

