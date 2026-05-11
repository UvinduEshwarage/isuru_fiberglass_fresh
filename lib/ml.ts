export interface MlPredictRequest {
  data: Record<string, unknown>;
}

export interface MlPredictResponse {
  predicted_revenue: number;
}

export interface MlTrendRecord {
  date: string;
  revenue: number;
}

export interface MlTrendResponse {
  monthly_revenue: { month: string; revenue: number }[];
  total_revenue: number;
  record_count: number;
}

export interface MlRecommendRequest {
  products: string[];
  top_n?: number;
}

export interface MlRecommendResponse {
  recommendations: string[];
  rules: Array<{
    antecedents: string[];
    consequents: string[];
    support: number;
    confidence: number;
    lift: number;
  }>;
}

export interface MlAnalyticsResponse {
  monthly_revenue: { month: string; revenue: number }[];
  total_revenue: number;
  average_revenue: number;
  record_count: number;
  trend_direction: string;
}

export function getMlServiceUrl(): string {
  const mlUrl = process.env.ML_SERVICE_URL;
  if (!mlUrl) {
    throw new Error("Missing ML_SERVICE_URL environment variable");
  }
  return mlUrl.replace(/\/+$/, "");
}

export async function fetchMl<T>(path: string, body: unknown): Promise<T> {
  const url = `${getMlServiceUrl()}/${path.replace(/^\/+/, "")}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({ error: "Invalid JSON response from ML service" }));
  if (!response.ok) {
    throw new Error((payload as any).detail || (payload as any).error || "ML service error");
  }
  return payload as T;
}
