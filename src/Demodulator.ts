import FFT from "fft.js/lib/fft";
import settings from './settings';

export interface Demodulator {
  process(chunk: Float32Array, sampleRate: number): string | undefined;
}

export class FskDemodulator implements Demodulator {
  fft!: FFT; 
  out!: any;
  processedChunks:number=0;

  amplitudes!: Float32Array;
  onFft: (fft: Float32Array, energyHigh:number, energyLow:number, symbolTime:number, symbolValue:number ) => void = (value) => {};

  process(chunk: Float32Array, sampleRate : number ) {
    this.fft = this.fft ?? new FFT(chunk.length);
    this.out = this.out ?? this.fft.createComplexArray();

    this.fft.realTransform(this.out, chunk);
    this.amplitudes = new Float32Array(chunk.length/2);
    for (let i = 0; i < this.amplitudes.length; i++) {
      const i2 = i*2;
      this.amplitudes[i] = Math.sqrt(Math.pow(this.out[i2],2)+Math.pow(this.out[i2+1],2))/Math.sqrt(chunk.length);
    }


    const fftBinHighFrequency = Math.round(settings.highFrequency/(sampleRate/chunk.length));
    const fftBinLowFrequency = Math.round(settings.lowFrequency/(sampleRate/chunk.length));

    const energyHigh = this.amplitudes[fftBinHighFrequency] +this.amplitudes[fftBinHighFrequency+1]+this.amplitudes[fftBinHighFrequency-1];
    const energyLow = this.amplitudes[fftBinLowFrequency] +this.amplitudes[fftBinLowFrequency+1]+this.amplitudes[fftBinLowFrequency-1];

    const symbolLogRation = Math.log((energyHigh+Number.EPSILON)/(energyLow+Number.EPSILON));

    this.onFft(this.amplitudes, energyHigh, energyLow,
      Math.floor(this.processedChunks*chunk.length/sampleRate/settings.bitDuration),
      Math.abs(symbolLogRation)<settings.logRatioThreshold?0:Math.sign(symbolLogRation));
    ++this.processedChunks;
    return undefined;
  }
}
