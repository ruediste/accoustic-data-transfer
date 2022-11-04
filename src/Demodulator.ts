import FFT from "fft.js/lib/fft";

export interface Demodulator {
  process(chunk: Float32Array, sampleRate: number): string | undefined;
}

export class FskDemodulator implements Demodulator {
  fft!: FFT; 
  out!: any;

  amplitudes!: Float32Array;
  onFft: (fft: Float32Array) => void = (value) => {};

  process(chunk: Float32Array, sampleRate : number ) {
    this.fft = this.fft ?? new FFT(chunk.length);
    this.out = this.out ?? this.fft.createComplexArray();

    this.fft.realTransform(this.out, chunk);
    this.amplitudes = new Float32Array(chunk.length/2);
    for (let i = 0; i < this.amplitudes.length; i++) {
      const i2 = i*2;
      this.amplitudes[i] = Math.sqrt(Math.pow(this.out[i2],2)+Math.pow(this.out[i2+1],2))/chunk.length;
    }
    this.onFft(this.amplitudes);
    return undefined;
  }
}
