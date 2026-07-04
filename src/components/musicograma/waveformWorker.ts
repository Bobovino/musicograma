export interface WaveformWorkerRequest {
  channelData: Float32Array;
  samples: number;
}

export interface WaveformWorkerResponse {
  waveform: number[];
}

// Cast avoids pulling in the `webworker` lib (which conflicts with the `dom`
// lib types already used by the rest of the app) just for this one file.
const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<WaveformWorkerRequest>) => void) | null;
  postMessage: (message: WaveformWorkerResponse) => void;
};

ctx.onmessage = (e) => {
  const { channelData, samples } = e.data;
  const blockSize = Math.max(1, Math.floor(channelData.length / samples));
  const filtered = new Array<number>(samples);
  for (let i = 0; i < samples; i++) {
    const blockStart = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[blockStart + j] ?? 0);
    }
    filtered[i] = sum / blockSize;
  }
  let max = 0.0001;
  for (const v of filtered) if (v > max) max = v;
  ctx.postMessage({ waveform: filtered.map((v) => v / max) });
};

export {};
