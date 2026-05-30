'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const videoSrc = 'https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8';

export default function BackgroundVideo() {
  const videoRefs = useRef([]);
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);
  const [tileCount, setTileCount] = useState(3);

  const updateTileCount = useCallback((aspectRatio) => {
    if (typeof window === 'undefined') return;

    const fittedTileHeight = window.innerWidth / aspectRatio;
    const neededTiles = Math.ceil(window.innerHeight / Math.max(fittedTileHeight, 1));
    setTileCount(Math.min(Math.max(neededTiles + 1, 2), 8));
  }, []);

  const handleMetadata = useCallback((event) => {
    const video = event.currentTarget;
    if (!video.videoWidth || !video.videoHeight) return;

    const aspectRatio = video.videoWidth / video.videoHeight;
    setVideoAspectRatio(aspectRatio);
    updateTileCount(aspectRatio);
  }, [updateTileCount]);

  useEffect(() => {
    updateTileCount(videoAspectRatio);
    const handleResize = () => updateTileCount(videoAspectRatio);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateTileCount, videoAspectRatio]);

  useEffect(() => {
    const videos = videoRefs.current.slice(0, tileCount).filter(Boolean);
    const hlsInstances = [];

    videos.forEach((video) => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
        video.play().catch((error) => console.log('Auto-play prevented:', error));
        return;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((error) => console.log('Auto-play prevented:', error));
        });
        hlsInstances.push(hls);
      }
    });

    return () => {
      hlsInstances.forEach((hls) => hls.destroy());
    };
  }, [tileCount]);

  return (
    <div
      className="background-video-layer fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: '#050816',
        zIndex: 0,
      }}
    >
      <div
        className="background-video-stack"
        style={{
          position: 'absolute',
          inset: '0 auto auto 0',
          width: '100%',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          filter: 'blur(6px) saturate(108%)',
        }}
      >
        {Array.from({ length: tileCount }).map((_, index) => (
          <video
            key={index}
            ref={(node) => {
              videoRefs.current[index] = node;
            }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedMetadata={handleMetadata}
            className="background-video-tile opacity-100"
            style={{
              width: '100vw',
              height: 'auto',
              aspectRatio: `${videoAspectRatio} / 1`,
              flex: '0 0 auto',
              objectFit: 'contain',
              objectPosition: 'top center',
              opacity: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
