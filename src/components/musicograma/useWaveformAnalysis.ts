'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { WaveformWorkerRequest, WaveformWorkerResponse } from './waveformWorker';

const SAMPLES = 300;

type AudioContextWindow = Window & { webkitAudioContext?: typeof AudioContext };

// Decoding happens on the main thread (Web Audio API has no worker-context
// AudioContext in any browser), but decodeAudioData itself is async and does
// not block. The part that DOES block for long files is the per-block
// reduction over every PCM sample afterwards — that's offloaded to a worker.
export function useWaveformAnalysis() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback(async (file: File | Blob): Promise<number[]> => {
    if (typeof window === 'undefined') return [];
    const AudioContextCtor = window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext;
    if (!AudioContextCtor) return [];

    let arrayBuffer: ArrayBuffer;
    let audioBuffer: AudioBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      const audioCtx = audioCtxRef.current ?? new AudioContextCtor();
      audioCtxRef.current = audioCtx;
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch {
      return [];
    }

    // Copy the channel data: getChannelData's backing buffer belongs to the
    // AudioBuffer, and transferring it to the worker would neuter it.
    const channelData = audioBuffer.getChannelData(0).slice();

    return new Promise((resolve) => {
      let worker: Worker;
      try {
        worker = new Worker(new URL('./waveformWorker.ts', import.meta.url));
      } catch {
        resolve([]);
        return;
      }
      worker.onmessage = (e: MessageEvent<WaveformWorkerResponse>) => {
        resolve(e.data.waveform);
        worker.terminate();
      };
      worker.onerror = () => {
        resolve([]);
        worker.terminate();
      };
      const payload: WaveformWorkerRequest = { channelData, samples: SAMPLES };
      worker.postMessage(payload, [channelData.buffer]);
    });
  }, []);
}
