import { useAuthStore } from "@/store/useAuthStore";

type QueryTag = string;

type CacheEntry<T> = {
  data?: T;
  updatedAt: number;
  promise?: Promise<T>;
  controller?: AbortController;
  consumers: number;
  abortTimer?: ReturnType<typeof setTimeout>;
  tags: Set<QueryTag>;
  generation: number;
};

type AcquirePrivateQueryOptions<T> = {
  key: string;
  tags: QueryTag[];
  staleTimeMs: number;
  force?: boolean;
  loader: (signal: AbortSignal) => Promise<T>;
};

type InvalidationSubscription = {
  tags: Set<QueryTag>;
  listener: () => void;
};

const cache = new Map<string, CacheEntry<unknown>>();
const subscriptions = new Set<InvalidationSubscription>();
let generation = 0;
let activeUserScope = userScope();

function userScope() {
  const auth = useAuthStore.getState();
  return auth.isAuthenticated && auth.userId
    ? `user:${auth.userId}`
    : "anonymous";
}

function scopedKey(key: string) {
  return `${userScope()}:${key}`;
}

function tagsOverlap(left: Set<QueryTag>, right: Set<QueryTag>) {
  for (const tag of left) {
    if (right.has(tag)) return true;
  }
  return false;
}

function abortEntry(entry: CacheEntry<unknown>) {
  if (entry.abortTimer) clearTimeout(entry.abortTimer);
  entry.controller?.abort();
}

function clearPrivateQueryCache() {
  generation += 1;
  cache.forEach(abortEntry);
  cache.clear();
}

useAuthStore.subscribe((state) => {
  const nextScope =
    state.isAuthenticated && state.userId
      ? `user:${state.userId}`
      : "anonymous";
  if (nextScope !== activeUserScope) {
    activeUserScope = nextScope;
    clearPrivateQueryCache();
  }
});

export function peekPrivateQuery<T>(key: string): T | null {
  const entry = cache.get(scopedKey(key)) as CacheEntry<T> | undefined;
  return entry?.data ?? null;
}

export function acquirePrivateQuery<T>({
  key,
  tags,
  staleTimeMs,
  force = false,
  loader,
}: AcquirePrivateQueryOptions<T>) {
  const resolvedKey = scopedKey(key);
  let entry = cache.get(resolvedKey) as CacheEntry<T> | undefined;
  const now = Date.now();
  const isFresh =
    entry?.data !== undefined && now - entry.updatedAt < staleTimeMs;

  if (entry?.abortTimer) {
    clearTimeout(entry.abortTimer);
    entry.abortTimer = undefined;
  }

  if (!entry) {
    entry = {
      updatedAt: 0,
      consumers: 0,
      tags: new Set(tags),
      generation,
    };
    cache.set(resolvedKey, entry);
  } else {
    tags.forEach((tag) => entry?.tags.add(tag));
  }

  if (!entry.promise && (force || !isFresh)) {
    const requestGeneration = generation;
    const controller = new AbortController();
    entry.controller = controller;
    entry.promise = loader(controller.signal)
      .then((data) => {
        if (
          generation === requestGeneration &&
          cache.get(resolvedKey) === entry
        ) {
          entry.data = data;
          entry.updatedAt = Date.now();
        }
        return data;
      })
      .catch((error) => {
        if (entry?.data === undefined && cache.get(resolvedKey) === entry) {
          cache.delete(resolvedKey);
        }
        throw error;
      })
      .finally(() => {
        if (cache.get(resolvedKey) === entry) {
          entry.promise = undefined;
          entry.controller = undefined;
        }
      });
  }

  entry.consumers += 1;
  const promise = entry.promise ?? Promise.resolve(entry.data as T);
  let released = false;

  return {
    promise,
    release() {
      if (released) return;
      released = true;
      entry.consumers = Math.max(0, entry.consumers - 1);
      if (entry.consumers === 0 && entry.promise && !entry.abortTimer) {
        entry.abortTimer = setTimeout(() => {
          entry.abortTimer = undefined;
          if (entry.consumers === 0 && entry.promise) {
            entry.controller?.abort();
          }
        }, 0);
      }
    },
  };
}

export function invalidatePrivateQueries(tags: QueryTag[]) {
  const invalidatedTags = new Set(tags);
  for (const [key, entry] of cache) {
    if (tagsOverlap(entry.tags, invalidatedTags)) {
      abortEntry(entry);
      cache.delete(key);
    }
  }
  for (const subscription of subscriptions) {
    if (tagsOverlap(subscription.tags, invalidatedTags)) {
      subscription.listener();
    }
  }
}

export function subscribePrivateQueryInvalidation(
  tags: QueryTag[],
  listener: () => void,
) {
  const subscription = {
    tags: new Set(tags),
    listener,
  };
  subscriptions.add(subscription);
  return () => {
    subscriptions.delete(subscription);
  };
}
