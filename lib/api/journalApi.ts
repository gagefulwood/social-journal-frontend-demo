import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
  Log,
  Reflection,
  Exercise,
  CreateLogRequest,
  UpdateLogRequest,
  CreateReflectionRequest,
  UpdateReflectionRequest,
  CreateExerciseRequest,
  UpdateExerciseRequest,
  LogListResponse,
  ReflectionListResponse,
  ExerciseListResponse,
  CombinedJournalFeedResponse,
} from "@/types/journals";

export type JournalFeedParams = {
  page?: number;
  page_size?: number;
  kind?: string;
  event?: ApiId;
  title?: string;
  created_after?: string;
  created_before?: string;
};

export type LogListParams = {
  page?: number;
  page_size?: number;
  title?: string;
  mood?: ApiId;
  entry_tag?: ApiId;
};

export type ReflectionListParams = {
  page?: number;
  page_size?: number;
  title?: string;
  clarity_check?: string;
};

export type ExerciseListParams = {
  page?: number;
  page_size?: number;
  title?: string;
  subtype?: string;
};

type MaybePaginated<TItem> = TItem[] | { results: TItem[] };

export type EventListParams = {
    page?: number;
    page_size?: number;
    title?: string;
    context_category?: ApiId;
}

function normalizeList<TItem>(data: MaybePaginated<TItem>): TItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.results) ? data.results : [];
}

export const journalApi = {
  async listFeed(
    params?: JournalFeedParams
  ): Promise<CombinedJournalFeedResponse> {
    const res = await api.get<CombinedJournalFeedResponse>("/api/journals/", {
      params,
    });
    return res.data;
  },

  async listLogs(params?: LogListParams): Promise<LogListResponse> {
    const res = await api.get<LogListResponse>("/api/journals/logs/", {
      params,
    });
    return res.data;
  },

  async getLog(id: ApiId): Promise<Log> {
    const res = await api.get<Log>(`/api/journals/logs/${id}/`);
    return res.data;
  },

  async createLog(data: CreateLogRequest): Promise<Log> {
    const res = await api.post<Log>("/api/journals/logs/", data);
    return res.data;
  },

  async updateLog(id: ApiId, data: UpdateLogRequest): Promise<Log> {
    const res = await api.patch<Log>(`/api/journals/logs/${id}/`, data);
    return res.data;
  },

  async removeLog(id: ApiId): Promise<void> {
    await api.delete(`/api/journals/logs/${id}/`);
  },

  async listReflections(params?: ReflectionListParams): Promise<ReflectionListResponse> {
    const res = await api.get<ReflectionListResponse>("/api/journals/reflections/", {
      params,
    });
    return res.data;
  },

  async getReflection(id: ApiId): Promise<Reflection> {
    const res = await api.get<Reflection>(`/api/journals/reflections/${id}/`);
    return res.data;
  },

  async createReflection(data: CreateReflectionRequest): Promise<Reflection> {
    const res = await api.post<Reflection>("/api/journals/reflections/", data);
    return res.data;
  },

  async updateReflection(id: ApiId, data: UpdateReflectionRequest): Promise<Reflection> {
    const res = await api.patch<Reflection>(`/api/journals/reflections/${id}/`, data);
    return res.data;
  },

  async removeReflection(id: ApiId): Promise<void> {
    await api.delete(`/api/journals/reflections/${id}/`);
  },

  async listExercises(params?: ExerciseListParams): Promise<ExerciseListResponse> {
    const res = await api.get<ExerciseListResponse>("/api/journals/exercises/", {
      params,
    });
    return res.data;
  },

  async getExercise(id: ApiId): Promise<Exercise> {
    const res = await api.get<Exercise>(`/api/journals/exercises/${id}/`);
    return res.data;
  },

  async createExercise(data: CreateExerciseRequest): Promise<Exercise> {
    const res = await api.post<Exercise>("/api/journals/exercises/", data);
    return res.data;
  },

  async updateExercise(id: ApiId, data: UpdateExerciseRequest): Promise<Exercise> {
    const res = await api.patch<Exercise>(`/api/journals/exercises/${id}/`, data);
    return res.data;
  },

  async removeExercise(id: ApiId): Promise<void> {
    await api.delete(`/api/journals/exercises/${id}/`);
  },
};
