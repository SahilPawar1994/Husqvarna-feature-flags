import type {
  ApiResponse,
  CreateFeatureFlagInput,
  Environment,
  FeatureFlag,
  AuditLog
} from "../types";

const API_BASE_URL = "http://localhost:3000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `Request failed: ${response.status}`);
  }

  return result;
}

export const getFeatureFlags = async (
  environment?: Environment,
  enabled?: boolean,
): Promise<FeatureFlag[]> => {
  const params = new URLSearchParams();

  if (environment) {
    params.set("environment", environment);
  }

  if (enabled !== undefined) {
    params.set("enabled", String(enabled));
  }

  const query = params.toString();
  const endpoint = `/flags${query ? `?${query}` : ""}`;

  const response = await request<ApiResponse<FeatureFlag[]>>(endpoint);

  return response.data;
};

export const createFeatureFlag = async (
  input: CreateFeatureFlagInput,
): Promise<FeatureFlag> => {
  const response = await request<ApiResponse<FeatureFlag>>("/flags", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data;
};

export const toggleFeatureFlag = async (id: string): Promise<FeatureFlag> => {
  const response = await request<ApiResponse<FeatureFlag>>(
    `/flags/${id}/toggle`,
    {
      method: "PATCH",
    },
  );

  return response.data;
};

export const getRecentAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await request<ApiResponse<AuditLog[]>>(
    "/audit-logs?limit=10"
  );

  return response.data;
};
