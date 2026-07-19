import type { AxiosRequestConfig } from "axios";

import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
  CompleteJournalRequest,
  CreateLogRequest,
  CreateReflectionRequest,
  JournalFeedParams,
  JournalListResponse,
  JournalLookupOption,
  Log,
  LogFormat,
  LogPatternResponse,
  Reflection,
  ReflectionLens,
  UpdateLogRequest,
  UpdateReflectionRequest,
} from "@/types/journals";

export type JournalLookupKind =
  | "episode-categories"
  | "episode-characteristics"
  | "episode-context-tags"
  | "social-energy-factors"
  | "emotion-states"
  | "interaction-dynamics";

export type CreateJournalLookupRequest = {
  name: string;
  icon_reference?: string;
  color?: string;
};

export const journalApi = {
  async listFeed(
    params: JournalFeedParams = {},
    config: Pick<AxiosRequestConfig, "signal"> = {},
  ): Promise<JournalListResponse> {
    const response = await api.get<JournalListResponse>("/api/journals/", {
      ...config,
      params,
    });
    return response.data;
  },

  async getLog(id: ApiId): Promise<Log> {
    const response = await api.get<Log>(`/api/journals/logs/${id}/`);
    return response.data;
  },

  async createLog<F extends LogFormat>(
    data: CreateLogRequest<F>,
  ): Promise<Log<F>> {
    const response = await api.post<Log<F>>("/api/journals/logs/", data);
    return response.data;
  },

  async updateLog<F extends LogFormat>(
    id: ApiId,
    data: UpdateLogRequest<F>,
  ): Promise<Log<F>> {
    const response = await api.patch<Log<F>>(`/api/journals/logs/${id}/`, data);
    return response.data;
  },

  async completeLog(id: ApiId, data: CompleteJournalRequest): Promise<Log> {
    const response = await api.post<Log>(
      `/api/journals/logs/${id}/complete/`,
      data,
    );
    return response.data;
  },

  async removeLog(id: ApiId): Promise<void> {
    await api.delete(`/api/journals/logs/${id}/`);
  },

  async getReflection(id: ApiId): Promise<Reflection> {
    const response = await api.get<Reflection>(
      `/api/journals/reflections/${id}/`,
    );
    return response.data;
  },

  async createReflection<L extends ReflectionLens>(
    data: CreateReflectionRequest<L>,
  ): Promise<Reflection<L>> {
    const response = await api.post<Reflection<L>>(
      "/api/journals/reflections/",
      data,
    );
    return response.data;
  },

  async updateReflection<L extends ReflectionLens>(
    id: ApiId,
    data: UpdateReflectionRequest<L>,
  ): Promise<Reflection<L>> {
    const response = await api.patch<Reflection<L>>(
      `/api/journals/reflections/${id}/`,
      data,
    );
    return response.data;
  },

  async completeReflection(
    id: ApiId,
    data: CompleteJournalRequest,
  ): Promise<Reflection> {
    const response = await api.post<Reflection>(
      `/api/journals/reflections/${id}/complete/`,
      data,
    );
    return response.data;
  },

  async removeReflection(id: ApiId): Promise<void> {
    await api.delete(`/api/journals/reflections/${id}/`);
  },

  async listLookups(
    kind: JournalLookupKind,
    config: Pick<AxiosRequestConfig, "signal"> = {},
  ): Promise<JournalLookupOption[]> {
    const response = await api.get<JournalLookupOption[]>(
      `/api/journals/lookups/${kind}/`,
      config,
    );
    return response.data;
  },

  async createLookup(
    kind: Exclude<JournalLookupKind, "episode-categories">,
    data: CreateJournalLookupRequest,
  ): Promise<JournalLookupOption> {
    const response = await api.post<JournalLookupOption>(
      `/api/journals/lookups/${kind}/`,
      data,
    );
    return response.data;
  },

  async getLogPatterns(params?: {
    format?: LogFormat;
    days?: number;
  }): Promise<LogPatternResponse> {
    const response = await api.get<LogPatternResponse>(
      "/api/journals/log-patterns/",
      { params },
    );
    return response.data;
  },
};
