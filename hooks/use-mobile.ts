import * as React from "react"

const MOBILE_BREAKPOINT = 1024
const mobileMediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(mobileMediaQuery)
  mediaQuery.addEventListener("change", onStoreChange)
  return () => mediaQuery.removeEventListener("change", onStoreChange)
}

function getSnapshot() {
  return window.matchMedia(mobileMediaQuery).matches
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
