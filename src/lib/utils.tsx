"use client";

import { createContext, useContext } from "react";
import { FolioProps } from "./Folio";

// TODO: move this to its own context file
export const StoryContext = createContext<{
  folioMap: Map<HTMLDivElement, Omit<FolioProps, "children">> | null;
  activeDiv: HTMLDivElement | null;
  iframe: HTMLIFrameElement | null;
  observer: IntersectionObserver | null;
  atlasURL: string | null;
}>({
  folioMap: null,
  activeDiv: null,
  iframe: null,
  observer: null,
  atlasURL: null,
});

export function useObserver() {
  const ctx = useContext(StoryContext);

  if (!ctx) {
    throw new Error(
      "Folios must exist within a story component (like Scrollyteller)"
    );
  }

  return ctx;
}
