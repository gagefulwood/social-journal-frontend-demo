import api from "./client";
import axios from "axios";
import { Event } from "@/models";
import { ApiError } from "./types";

export const eventsApi = {
  async list(params?: unknown): Promise<Event[]> {
    try {
      const res = await api.get("/events", { params });
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw {
          message: "Failed to fetch events",
          status: err.response?.status,
        } as ApiError;
      }
      throw { message: "Unknown error" } as ApiError;
    }
  },

  async get(id: string): Promise<Event> {
    try {
      const res = await api.get(`/events/${id}`);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw {
          message: "Failed to fetch event",
          status: err.response?.status,
        } as ApiError;
      }
      throw { message: "Unknown error" } as ApiError;
    }
  },

  async create(dto: Partial<Event>): Promise<Event> {
    try {
      const res = await api.post("/events", dto);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw {
          message: "Failed to create event",
          status: err.response?.status,
        } as ApiError;
      }
      throw { message: "Unknown error" } as ApiError;
    }
  },
};