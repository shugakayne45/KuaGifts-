/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RefreshCw, Volume2, Music, CheckCircle2 } from 'lucide-react';

interface AudioVoiceRecorderProps {
  onAudioReady: (audioUrl: string, durationSeconds: number) => void;
  initialAudioUrl?: string;
  readOnly?: boolean;
}

const PRESET_HOLIDAY_GREETINGS = [
  {
    id: 'preset_1',
    title: '🇬🇭 Festive Hamper & Christmas Blessing (Accra/Kumasi)',
    url: 'https://actions.google.com/sounds/v1/holidays/deck_the_halls_music_box.ogg',
    duration: 18,
    sampleText: 'Merry Christmas Mama! Please go to Melcom and pick up the royal holiday hamper and food provisions for everyone.'
  },
  {
    id: 'preset_2',
    title: '🇳🇬 Christmas Groceries & Family Celebration (Lagos/Abuja)',
    url: 'https://actions.google.com/sounds/v1/holidays/jingle_bells_orchestral.ogg',
    duration: 22,
    sampleText: 'Compliments of the season Uncle! Use this at Shoprite for all festive cooking, rice, and groceries.'
  },
  {
    id: 'preset_3',
    title: '🏥 Healthcare & Wellness Care Blessing',
    url: 'https://actions.google.com/sounds/v1/ambiences/wind_chimes_breeze.ogg',
    duration: 14,
    sampleText: 'Sending love and health support. Locked for Medplus/Healthlane Pharmacy for prescription refills and wellness.'
  }
];

export const AudioVoiceRecorder: React.FC<AudioVoiceRecorderProps> = ({
  onAudioReady,
  initialAudioUrl,
  readOnly = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(initialAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(18);
  const [elapsed, setElapsed] = useState<number>(0);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Sync initial
  useEffect(() => {
    if (initialAudioUrl) {
      setRecordedUrl(initialAudioUrl);
    }
  }, [initialAudioUrl]);

  // Audio Playback progress tracking
  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setElapsed(Math.floor(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setElapsed(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [recordedUrl]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedUrl(audioUrl);
        setDuration(recordingSeconds || 15);
        onAudioReady(audioUrl, recordingSeconds || 15);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setActivePreset(null);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access unavailable or denied. Fallback to holiday presets available.', err);
      // Select default preset
      selectPreset(PRESET_HOLIDAY_GREETINGS[0]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Audio playback failed', err);
      });
    }
  };

  const resetRecording = () => {
    if (isPlaying && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setRecordedUrl(null);
    setIsPlaying(false);
    setElapsed(0);
    setActivePreset(null);
  };

  const selectPreset = (preset: typeof PRESET_HOLIDAY_GREETINGS[0]) => {
    if (isPlaying && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setActivePreset(preset.id);
    setRecordedUrl(preset.url);
    setDuration(preset.duration);
    setIsPlaying(false);
    setElapsed(0);
    onAudioReady(preset.url, preset.duration);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-sm p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-sm bg-red-50 border border-red-200 flex items-center justify-center text-[#C41E3A]">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0F1C13]">
              {readOnly ? 'Personal Voice Note From Sender' : 'Attach Voice Holiday Greeting'}
            </h4>
            <p className="text-[11px] text-[#4A5568]">
              {readOnly ? 'Hear the heartfelt voice note attached to your purpose-locked gift card' : 'Recorded voice note plays automatically when receiver opens gift link'}
            </p>
          </div>
        </div>

        {recordedUrl && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Audio Attached
          </span>
        )}
      </div>

      {/* Hidden native audio tag */}
      {recordedUrl && (
        <audio ref={audioPlayerRef} src={recordedUrl} preload="auto" />
      )}

      {/* Playback & Waveform View */}
      {recordedUrl ? (
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-[#C41E3A] hover:bg-[#a51830] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Visualizer Wave Bars */}
            <div className="flex-1 mx-4 flex items-center justify-center space-x-1 h-10">
              {[20, 45, 75, 30, 85, 95, 60, 40, 70, 90, 65, 35, 80, 50, 90, 70, 30, 85, 45, 60].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-[#006837] to-[#C41E3A] animate-pulse'
                      : i < 8 ? 'bg-[#006837]' : 'bg-slate-300'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * (Math.sin(Date.now() / 200 + i) + 1.2)) % 100)}%` : `${h}%`
                  }}
                />
              ))}
            </div>

            <div className="text-right font-mono text-xs text-[#006837] font-bold">
              {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {!readOnly && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-[#4A5568]">
                {activePreset ? 'Using curated studio holiday audio' : 'Using recorded microphone audio'}
              </span>
              <button
                onClick={resetRecording}
                className="text-[11px] text-[#C41E3A] hover:underline flex items-center space-x-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-record / Change</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Recording Controls */
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#C41E3A] hover:bg-[#a51830] text-white text-xs font-bold rounded-sm shadow-md transition-all active:scale-98"
              >
                <Mic className="w-4 h-4" />
                <span>Record Voice Holiday Note (Mic)</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 animate-pulse text-white text-xs font-bold rounded-sm shadow-md"
              >
                <Square className="w-4 h-4" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            )}
          </div>

          {/* Quick Studio Presets */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-[11px] text-[#006837] font-bold uppercase font-mono">
              <Music className="w-3.5 h-3.5" />
              <span>Or choose a studio holiday voice greeting:</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_HOLIDAY_GREETINGS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className="flex items-start text-left p-2.5 rounded-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-xs"
                >
                  <span className="text-base mr-2 select-none">🎙️</span>
                  <div className="flex-1">
                    <div className="font-semibold text-[#0F1C13]">{preset.title}</div>
                    <div className="text-[10px] text-[#4A5568] italic mt-0.5 line-clamp-1">"{preset.sampleText}"</div>
                  </div>
                  <span className="text-[10px] text-[#006837] font-mono ml-2 mt-0.5 font-bold">{preset.duration}s</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
