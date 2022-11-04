import { fftRealHalf } from "dsp-collection/signal/Fft";

export interface Demodulator {
  process(chunk: Float32Array): string | undefined;
}

export class FskDemodulator implements Demodulator {
  process(chunk: Float32Array) {
    console.log(fftRealHalf(chunk).getAbsArray());
    return undefined;
  }
}
