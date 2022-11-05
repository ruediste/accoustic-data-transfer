import FFT from "fft.js";
import { Demodulator } from "./Demodulator";
import settings from "./settings";

export class DemodulatorFskSCPS implements Demodulator {
  fft!: FFT;
  out!: any;
  processedChunks: number = 0;

  amplitudes!: Float32Array;

  process(chunk: Float32Array, sampleRate: number) {
    this.fft = this.fft ?? new FFT(chunk.length);
    this.out = this.out ?? this.fft.createComplexArray();

    this.fft.realTransform(this.out, chunk);
    this.amplitudes = new Float32Array(chunk.length / 2);
    for (let i = 0; i < this.amplitudes.length; i++) {
      const i2 = i * 2;
      this.amplitudes[i] =
        Math.sqrt(Math.pow(this.out[i2], 2) + Math.pow(this.out[i2 + 1], 2)) /
        Math.sqrt(chunk.length);
    }

    const fftBinHighFrequency = Math.round(
      settings.highFrequency / (sampleRate / chunk.length)
    );
    const fftBinLowFrequency = Math.round(
      settings.lowFrequency / (sampleRate / chunk.length)
    );

    const energyHigh =
      this.amplitudes[fftBinHighFrequency] +
      this.amplitudes[fftBinHighFrequency + 1] +
      this.amplitudes[fftBinHighFrequency - 1];
    const energyLow =
      this.amplitudes[fftBinLowFrequency] +
      this.amplitudes[fftBinLowFrequency + 1] +
      this.amplitudes[fftBinLowFrequency - 1];

    const symbolLogRation = Math.log(
      (energyHigh + Number.EPSILON) / (energyLow + Number.EPSILON)
    );

    console.log(
      "EH: " +
        energyHigh +
        " EL: " +
        energyLow +
        " SymbolT: " +
        Math.floor(
          (this.processedChunks * chunk.length) /
            sampleRate /
            settings.bitDuration
        ) +
        " SymbolV " +
        (Math.abs(symbolLogRation) < settings.logRatioThreshold
          ? 0
          : Math.sign(symbolLogRation))
    );

    ++this.processedChunks;
    return undefined;
  }
}
