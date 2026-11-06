export type Environment = "DEV" | "STAGING" | "PROD";

export interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  environment: Environment;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureFlagInput {
  key: string;
  description: string;
  environment: Environment;
  enabled: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AuditLog {
  id: string;
  flagId: string;
  actor: string;
  action: "CREATED" | "TOGGLED";
  previousState: {
    enabled?: boolean;
  } | null;
  newState: {
    enabled?: boolean;
  };
  timestamp: string;
  flag: {
    key: string;
    environment: Environment;
  };
}