"use client";

import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarSJ } from "@/components/layout/SideBarLayout";

const authenticatedPrefixes = [
  "/dashboard",
  "/contacts",
  "/events",
  "/journals",
  "/settings",
];
const SIDEBAR_PIN_COOKIE = "sidebar_state";
const SIDEBAR_PIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_PIN_EVENT = "sj-sidebar-pin-change";

function readPinnedPreference() {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SIDEBAR_PIN_COOKIE}=`))
    ?.split("=")[1] === "true";
}

function subscribeToPinnedPreference(onStoreChange: () => void) {
  window.addEventListener(SIDEBAR_PIN_EVENT, onStoreChange);
  return () => window.removeEventListener(SIDEBAR_PIN_EVENT, onStoreChange);
}

function getServerPinnedPreference() {
  return false;
}

function isAuthenticatedRoute(pathname: string) {
  return authenticatedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pinned = useSyncExternalStore(
    subscribeToPinnedPreference,
    readPinnedPreference,
    getServerPinnedPreference,
  );
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocusWithin, setHasKeyboardFocusWithin] = useState(false);
  const suppressFocusExpansion = useRef(false);

  const updatePinned = useCallback((nextPinned: boolean) => {
    document.cookie = `${SIDEBAR_PIN_COOKIE}=${nextPinned}; path=/; max-age=${SIDEBAR_PIN_COOKIE_MAX_AGE}`;
    window.dispatchEvent(new Event(SIDEBAR_PIN_EVENT));
  }, []);

  const togglePinned = useCallback(() => {
    updatePinned(!pinned);
  }, [pinned, updatePinned]);

  if (!isAuthenticatedRoute(pathname)) {
    return children;
  }

  const expanded = pinned || isHovered || hasKeyboardFocusWithin;

  function handleSidebarPointerDown() {
    // A pointer click focuses controls, but it should not keep an unpinned rail open.
    suppressFocusExpansion.current = true;
    setHasKeyboardFocusWithin(false);
    window.setTimeout(() => {
      suppressFocusExpansion.current = false;
    }, 0);
  }

  function handleSidebarFocus() {
    if (!suppressFocusExpansion.current) {
      setHasKeyboardFocusWithin(true);
    }
  }

  function handleSidebarBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setHasKeyboardFocusWithin(false);
    }
  }

  return (
    <SidebarProvider
      className="xl:h-full xl:min-h-0"
      open={expanded}
      onOpenChange={updatePinned}
      onToggleSidebar={togglePinned}
      style={
        {
          "--sidebar-width": "15rem",
          "--sidebar-width-icon": "4.25rem",
        } as CSSProperties
      }
    >
      <SidebarSJ
        pinned={pinned}
        onPinnedChange={updatePinned}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={handleSidebarPointerDown}
        onFocusCapture={handleSidebarFocus}
        onBlurCapture={handleSidebarBlur}
      />
      <div className="min-w-0 flex-1 xl:flex xl:h-full xl:min-h-0 xl:flex-col">
        <div className="flex h-12 items-center border-b border-border px-3 lg:hidden">
          <SidebarTrigger aria-label="Open navigation" />
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
}
