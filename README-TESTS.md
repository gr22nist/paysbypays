# 테스트 가이드

## 설치

```bash
npm install
```

## 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드로 실행
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

## 테스트 구조

```
src/
├── __mocks__/              # Mock 파일들
│   ├── api/
│   │   └── client.ts      # API 클라이언트 Mock
│   └── store/
│       └── preferences-store.ts  # Preferences Store Mock
├── hooks/
│   └── __tests__/         # 커스텀 훅 테스트
│       ├── useDisplayFormat.test.ts
│       └── useTransactions.test.ts
├── store/
│   └── __tests__/         # 상태 관리 테스트
│       └── filter-store.test.ts
└── components/
    └── badges/
        └── __tests__/     # 컴포넌트 테스트
            └── TransactionStatusBadge.test.tsx
```

## 테스트 작성 가이드

### 1. 유틸리티 함수 테스트 (가장 쉬움)

`useDisplayFormat` 같은 포맷팅 함수는 의존성이 적어 테스트하기 쉽습니다.

### 2. 커스텀 훅 테스트

API 호출을 Mock하여 테스트합니다.

```typescript
jest.mock('@/lib/api/client', () => ({
  transactionsApi: {
    getTransactions: jest.fn(),
  },
}))
```

### 3. 상태 관리 테스트

Zustand 스토어는 실제로 테스트할 수 있습니다.

```typescript
const { result } = renderHook(() => useFilterStore())
act(() => {
  result.current.setStatus('SUCCESS')
})
```

### 4. 컴포넌트 테스트

React Testing Library를 사용하여 컴포넌트를 렌더링하고 검증합니다.

## Mock 사용법

### API Mock

`src/__mocks__/api/client.ts`에서 API 클라이언트를 Mock합니다.

```typescript
(transactionsApi.getTransactions as jest.Mock).mockResolvedValue({
  data: mockData,
})
```

### Store Mock

`src/__mocks__/store/preferences-store.ts`에서 스토어를 Mock합니다.

## 참고사항

- GET 요청만 있어도 API Mock을 통해 충분히 테스트 가능합니다
- 실제 서버 없이도 모든 로직을 테스트할 수 있습니다
- MSW(Mock Service Worker)를 사용하면 더 현실적인 테스트가 가능합니다

