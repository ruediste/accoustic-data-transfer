import FFT from "fft.js/lib/fft";

export interface Demodulator {
  process(chunk: Float32Array): string | undefined;
}

export class FskDemodulator implements Demodulator {
  fft = new FFT(4096);
  out = this.fft.createComplexArray();

  amplitudes!: Float32Array;
  ffts: Float32Array[] = [];
  process(chunk: Float32Array) {
    this.fft.realTransform(this.out, chunk);
    this.amplitudes = new Float32Array(1024);
    for (let i = 0; i < this.amplitudes.length; i++) {
      const i4 = i * 4;
      let value = 0;
      for (let p = 0; p < 4; p++) value += this.out[i4 + p] * this.out[i4 + p];
      this.amplitudes[i] = Math.log(1 + value / 2);
    }
    this.ffts.push(this.amplitudes);
    return undefined;
  }
}
