'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useObserver } from './utils';
import './atlas-stories.css';
import MapTrifold from '../assets/map-trifold.svg';
import ArrowCircleDown from '../assets/arrow-circle-down.svg';
import ArrowCircleUp from '../assets/arrow-circle-up.svg';

// TODO: make real
type SavedAPICall = Record<string, unknown>;

// KEEP IN SYNC WITH atlas-next!
type MessageData =
  | ({
      type: 'atlas_state_change';
      hash?: string;
    } & Partial<SavedAPICall> & { encoding?: never })
  | { type: 'atlas_settings_change' };

// In case non-message data is needed in Folios

export type FolioProps = {
  children: React.ReactNode;
  hash?: string;
  zoom?: { x: [number, number]; y: [number, number] };
  duration?: number;
};

/**
 *
 * @param param0 The folio component
 * @returns
 */
const Folio = ({ children, hash, zoom, duration }: FolioProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeDiv, iframe, observer, folioMap, atlasURL } = useObserver();

  if (hash?.includes('https')) {
    throw new Error(
      `Please pass only the hash, not the full URL -- did you mean to pass ${
        hash.split('#')[1]
      } instead of ${hash}?`
    );
  }

  useEffect(() => {
    if (containerRef.current && folioMap) {
      folioMap.set(containerRef.current, { hash, zoom, duration });
    }
  }, []); // only run once

  const [isActive, setIsActive] = useState(false);

  const folioArray = Array.from(folioMap?.keys() || []);
  const folioIndex = containerRef.current
    ? folioArray.indexOf(containerRef.current)
    : -1;

  useEffect(() => {
    if (contentRef.current && activeDiv === contentRef.current) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [activeDiv]);

  useEffect(() => {
    if (isActive) {
      const message: MessageData = {
        type: 'atlas_state_change',
        hash,
        zoom: { bbox: zoom },
        duration,
      };
      iframe?.contentWindow?.postMessage(message, '*');
    }
  }, [isActive, hash, iframe, zoom, duration]);

  useEffect(() => {
    if (!observer) {
      return;
    }
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    return () => {
      if (contentRef.current) {
        observer?.unobserve(contentRef.current);
      }
    };
  }, [contentRef, observer]);

  return (
    <div
      ref={containerRef}
      id={`folio-${folioIndex}`}
      className={'folio-container'}
    >
      <div
        ref={contentRef}
        className={`folio-card ${isActive ? 'active' : 'inactive'}`}
      >
        {children}
        <div className="folio-bottom-row">
          {/* TODO: tooltips on each button */}
          <div className="folio-buttons">
            {/* TODO: Make deep-linking within stories work */}
            {/* <button
                className="flex gap-x-2"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${window.location.pathname}#folio-${folioIndex}`,
                  );
                }}
              >
                <LinkIcon size={20} />
              </button> */}
            {/* TODO - support non-hash linking */}
            <a href={`${atlasURL}#${hash}`} target="_blank">
              <img
                src={MapTrifold}
                alt="Open in Atlas"
                width="20"
                height="20"
              />
            </a>
          </div>
          <div className="folio-buttons">
            <button
              onClick={() => {
                // scroll to previous folio
                const prevFolio = folioArray[folioIndex - 1];
                if (prevFolio) {
                  prevFolio.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <img
                src={ArrowCircleUp}
                alt="Scroll to previous folio"
                width="20"
                height="20"
              />
            </button>
            <button
              onClick={() => {
                // scroll to next folio
                const nextFolio = folioArray[folioIndex + 1];
                if (nextFolio) {
                  nextFolio.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <img
                src={ArrowCircleDown}
                alt="Scroll to next folio"
                width="20"
                height="20"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Folio;
