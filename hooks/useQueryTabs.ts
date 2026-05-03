"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type UseQueryTabsOptions<TValue extends string> = {
  values: readonly TValue[];
  defaultValue: TValue;
  paramName?: string;
};

export function useQueryTabs<TValue extends string>({
  values,
  defaultValue,
  paramName = "tab",
}: UseQueryTabsOptions<TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get(paramName);

  const value = useMemo(() => {
    return values.includes(currentValue as TValue)
      ? (currentValue as TValue)
      : defaultValue;
  }, [currentValue, defaultValue, values]);

  const setValue = useCallback(
    (nextValue: TValue) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, nextValue);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [paramName, pathname, router, searchParams]
  );

  return {
    value,
    setValue,
  };
}
