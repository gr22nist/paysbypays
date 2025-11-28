import { createCoreI18n } from "@hua-labs/i18n-core";

export const SUPPORTED_LANGUAGE_CODES = ["ko", "en", "ja"] as const;
export const I18N_NAMESPACES = [
  "common",
  "layout",
  "dashboard",
  "transactions",
  "settings",
  "settlements",
  "analytics",
  "merchants",
  "health",
] as const;

type Namespace = (typeof I18N_NAMESPACES)[number];
export type LanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number];

const translationCache = new Map<string, Record<string, unknown>>();
const inFlightRequests = new Map<string, Promise<Record<string, unknown>>>();

const translationApiPath = "/api/translations";

function buildTranslationUrl(language: string, namespace: string) {
  if (typeof window !== "undefined") {
    return `${translationApiPath}/${language}/${namespace}`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}${translationApiPath}/${language}/${namespace}`;
  }

  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return `${vercelUrl}${translationApiPath}/${language}/${namespace}`;
  }

  return `http://localhost:3000${translationApiPath}/${language}/${namespace}`;
}

async function fetchTranslation(
  language: LanguageCode,
  namespace: Namespace
): Promise<Record<string, unknown>> {
  const cacheKey = `${language}:${namespace}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const request = fetch(buildTranslationUrl(language, namespace), {
    cache: "force-cache",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load translations for ${language}/${namespace}`
        );
      }
      const data = (await response.json()) as Record<string, unknown>;
      translationCache.set(cacheKey, data);
      inFlightRequests.delete(cacheKey);
      return data;
    })
    .catch((error) => {
      inFlightRequests.delete(cacheKey);
      if (process.env.NODE_ENV === "development") {
        console.warn("[i18n] translation fetch failed", { language, namespace });
      }
      throw error;
    });

  inFlightRequests.set(cacheKey, request);
  return request;
}

export function createClientI18nProvider(defaultLanguage: LanguageCode = "ko") {
  const provider = createCoreI18n({
    defaultLanguage,
    fallbackLanguage: "en",
    namespaces: [...I18N_NAMESPACES],
    translationLoader: "api", // API route 사용 - i18n-core가 콜론(:)을 네임스페이스 구분자로 자동 인식
    translationApiPath,
    debug: process.env.NODE_ENV === "development",
  });

  // Provider 생성 시점에 모든 네임스페이스를 미리 로드 (비동기, 블로킹하지 않음)
  if (typeof window !== "undefined") {
    preloadTranslations(defaultLanguage).catch(() => {
      // 에러는 무시 (fallback 사용)
    });
  }

  return provider;
}

export async function preloadTranslations(
  language: LanguageCode,
  namespaces: Namespace[] = [...I18N_NAMESPACES]
): Promise<void> {
  const results = await Promise.allSettled(
    namespaces.map(async (namespace): Promise<Record<string, unknown>> => {
      try {
        const result = await fetchTranslation(language, namespace);
        if (process.env.NODE_ENV === "development") {
          console.log(`[i18n] Preloaded ${namespace} for ${language}`);
        }
        return result;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[i18n] Failed to preload ${namespace} for ${language}:`, error);
        }
        return {};
      }
    })
  );
  
  if (process.env.NODE_ENV === "development") {
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    console.log(`[i18n] Preloaded ${successCount}/${namespaces.length} namespaces for ${language}`);
  }
}

export async function warmFallbackLanguage(
  excludeLanguage?: LanguageCode,
  namespaces: Namespace[] = [...I18N_NAMESPACES]
) {
  const otherLanguages = SUPPORTED_LANGUAGE_CODES.filter(
    (code) => code !== excludeLanguage
  );

  await Promise.allSettled(
    otherLanguages.map((language) =>
      preloadTranslations(language, namespaces)
    )
  );
}

