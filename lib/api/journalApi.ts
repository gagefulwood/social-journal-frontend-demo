import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
  Log,
  LogListItem,
  Reflection,
  ReflectionListItem,
  Exercise,
  ExerciseListItem,
  CreateLogRequest,
  UpdateLogRequest,
  CreateReflectionRequest,
  UpdateReflectionRequest,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from "@/types/journals";
import type { PaginatedResponse } from "@/types/api";

type MaybePaginated<TItem> = TItem[] | { results: TItem[] };

export type LogListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  mood?: ApiId;
  entry_tag?: ApiId;
};

type LogListResponse = PaginatedResponse<LogListItem>;

function normalizeList<TItem>(data: MaybePaginated<TItem>): TItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.results) ? data.results : [];
}

export const journalApi = {
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

  async listReflections(params?: LogListParams): Promise<PaginatedResponse<ReflectionListItem>> {
    const res = await api.get<PaginatedResponse<ReflectionListItem>>("/api/journals/reflections/", {
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

  async listExercises(params?: LogListParams): Promise<PaginatedResponse<ExerciseListItem>> {
    const res = await api.get<PaginatedResponse<ExerciseListItem>>("/api/journals/exercises/", {
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

