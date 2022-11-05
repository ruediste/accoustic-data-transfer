import FFT from "fft.js/lib/fft";
import settings from "./settings";

export interface Demodulator {
  process(chunk: Float32Array, sampleRate: number): string | undefined;
}
