"use client";

// Uncomment this to see outlines of the intersection observers as they trigger
// import './IntersectionObserverDebugger';

import React, { useEffect, useRef, useState } from "react";
import { StoryContext } from "./utils";
import { FolioProps } from "./Folio";
import "./atlas-stories.css";

type ScrollytellerProps = {
  children: React.ReactNode;
  baseURL?: string;
  map: string;
};

const Scrollyteller = ({
  children,
  baseURL = "https://atlas.nomic.ai",
  map,
}: ScrollytellerProps) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const folioMap = useRef<Map<HTMLDivElement, Omit<FolioProps, "children">>>(
    new Map()
  );

  // scroll state management
  const [activeDiv, setActiveDiv] = useState<HTMLDivElement | null>(null);
  const [inFullView, setInFullView] = useState<boolean>(false);

  // Intersection observers
  const [folioObserver, setFolioObserver] =
    useState<IntersectionObserver | null>(null);
  const [fullViewObserver, setFullViewObserver] =
    useState<IntersectionObserver | null>(null);

  useEffect(() => {
    setFolioObserver(
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target !== activeDiv) {
              console.log("Active is now ", entry.target);
              setActiveDiv(entry.target as HTMLDivElement);
              return;
            }
            if (entry.target === activeDiv) {
              setActiveDiv(null);
            }
          });
        },
        {
          root: null,
          // Points are activate when they enter the middle 50% of the screen.
          rootMargin: "-25% 0px -25% 0px",
          threshold: 0,
        }
      )
    );

    setFullViewObserver(
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log("In full view");
              setInFullView(true);
            } else {
              console.log("Not in full view");
              setInFullView(false);
            }
          });
        },
        {
          root: null,
          // root is placed 20vh above the top of the screen, so when
          // the scroller background reaches that point it will fade into view
          rootMargin: "30% 0px -120% 0px",
          threshold: 0,
        }
      )
    );

    return () => {
      folioObserver?.disconnect();
      fullViewObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (fullViewObserver && scrollerRef.current) {
      fullViewObserver.observe(scrollerRef.current);
    }
    return () => {
      if (scrollerRef.current) {
        fullViewObserver?.unobserve(scrollerRef.current);
      }
    };
  }, [fullViewObserver]);

  return (
    <div className="scrollyteller">
      <div className="scrollyteller-box">
        <iframe
          className="scrollyteller-iframe"
          src={`${baseURL}/data/${map}?preview=true`}
          ref={iframe}
        />
      </div>
      <StoryContext.Provider
        value={{
          folioMap: folioMap.current,
          activeDiv,
          iframe: iframe.current,
          observer: folioObserver,
          atlasURL: `${baseURL}/data/${map}`,
        }}
      >
        <div
          id="scroller"
          ref={scrollerRef}
          className={`scroller ${
            inFullView ? "in-full-view" : "not-in-full-view"
          }`}
        >
          {children}
          {/* OPTION 1 for Nomic Atlas kicker */}
          {/* <div className="flex">
            <a
              href="https://atlas.nomic.ai"
              className="border mx-auto mb-[15vh] p-4 rounded-lg max-w-[550px] w-4/5 border-5 border-green-1 bg-green-200/80 opacity-100"
            >
              <div className="flex flex-col gap-y-2 text-center">
                Sign up for Nomic Atlas to tell stories like these about your data
              </div>
            </a>
          </div> */}
        </div>
      </StoryContext.Provider>
      {/* OPTION 2 for Nomic Atlas kicker */}
      <a href="https://atlas.nomic.ai">
        <div className="scrollyteller-kicker">
          Atlas Data Stories are in Early Preview. Sign up for Nomic Atlas and
          reach out to get early access.
        </div>
      </a>
    </div>
  );
};

export default Scrollyteller;
