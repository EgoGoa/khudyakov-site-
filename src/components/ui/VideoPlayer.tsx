"use client";

import { useRef, useState } from "react";
import { PauseIcon, PlayIcon, SoundOffIcon, SoundOnIcon } from "./Icons";

type VideoPlayerProps = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  rounded?: boolean;
  className?: string;
};

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  rounded = true,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div
      className={`group relative overflow-hidden bg-neutral-900 ${
        rounded ? "rounded-2xl" : ""
      } ${className}`}
    >
      <video
        key={src}
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-6">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-rec hover:text-white"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Включить звук" : "Выключить звук"}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-rec hover:text-white"
        >
          {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
      </div>
    </div>
  );
}
