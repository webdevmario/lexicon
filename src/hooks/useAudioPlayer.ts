import { useCallback, useRef, useState } from "react";

/**
 * Provides audio playback for word pronunciation.
 * Manages a single Audio instance to avoid overlapping playback.
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback((url: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("error", () => setIsPlaying(false));

    audio.play().catch(() => setIsPlaying(false));
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { play, stop, isPlaying };
}
