"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";

interface MusicPlayerProps {
  className?: string;
}

export default function MusicPlayer({ className = "" }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context with a simple background music
    // Using Web Audio API to generate simple tones for background music
    if (typeof window !== "undefined") {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createToneSequence = () => {
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major scale
        let currentNote = 0;
        
        const playNote = () => {
          if (!isPlaying) return;
          
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(notes[currentNote], audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          
          currentNote = (currentNote + 1) % notes.length;
          
          setTimeout(playNote, 600);
        };
        
        if (isPlaying) {
          playNote();
        }
      };
      
      createToneSequence();
    }
  }, [isPlaying]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={toggleMusic}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        {isPlaying ? "Music: ON" : "Music: OFF"}
      </Button>
    </div>
  );
}