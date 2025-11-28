import { NextRequest, NextResponse } from "next/server";
import { mockHealthResponse, generateRandomHealthResponse } from "@/data/health";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://recruit.paysbypays.com/api/v1";

function getPathFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const prefix = "/api/proxy/";
    if (parsed.pathname.startsWith(prefix)) {
      return parsed.pathname.slice(prefix.length);
    }
    return "";
  } catch (error) {
    console.error("Failed to parse proxy URL:", error);
    return "";
  }
}

async function getPathFromParams(params: Promise<{ path?: string[] }>): Promise<string> {
  try {
    const resolved = await params;
    const pathArray = resolved.path;
    if (pathArray && Array.isArray(pathArray) && pathArray.length > 0) {
      return pathArray.join("/");
    }
  } catch (error) {
    console.error("Error getting path from params:", error);
  }
  return "";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    let path = getPathFromUrl(request.url);
    
    if (!path) {
      path = await getPathFromParams(params);
    }

    if (!path) {
      console.error("Invalid API path - URL:", request.url, "Params:", params);
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid API path",
          data: null,
        },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/${path}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (path === "health") {
        const fallbackPayload = generateRandomHealthResponse(mockHealthResponse);
        console.warn("Health API unavailable, serving fallback payload.");
        return NextResponse.json(
          {
            status: 200,
            message: "Mock health payload",
            data: fallbackPayload,
            meta: { fallback: true },
          },
          {
            status: 200,
            headers: {
              "x-health-fallback": "true",
            },
          }
        );
      }

      console.error("Proxy API Error:", response.status, data);
      return NextResponse.json(
        {
          status: response.status,
          message:
            (data &&
              typeof data === "object" &&
              "message" in data &&
              typeof (data as { message?: unknown }).message === "string" &&
              (data as { message: string }).message.trim()) ||
            response.statusText,
          data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: error instanceof Error ? error.message : "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    let path = getPathFromUrl(request.url);
    
    if (!path) {
      path = await getPathFromParams(params);
    }

    if (!path) {
      console.error("Invalid API path - URL:", request.url, "Params:", params);
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid API path",
          data: null,
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const url = `${API_BASE_URL}/${path}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Proxy API Error:", response.status, errorData);
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || response.statusText,
          data: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: error instanceof Error ? error.message : "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}

