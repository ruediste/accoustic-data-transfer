import FFT from "fft.js";
import { setSyntheticLeadingComments } from "typescript";
import { Demodulator } from "./Demodulator";
import settings from "./settings";

function goertzel(x: Float32Array, k: number): { I: number; Q: number } {
  const N = x.length;
  const w = (2 * Math.PI * k) / N;
  const cw = Math.cos(w);
  const c = 2 * cw;
  const sw = Math.sin(w);
  let z1 = 0;
  let z2 = 0;
  for (let n = 1; n < N; n++) {
    const z0 = x[n] + c * z1 - z2;
    z2 = z1;
    z1 = z0;
  }
  const I = cw * z1 - z2;
  const Q = sw * z1;
  return { I, Q };
}

class GapFinder implements Demodulator {
  chunks: Float32Array[] = [];
  fft = new FFT(settings.chunkSize);
  out = this.fft.createComplexArray();
  buffer = new Float32Array(settings.chunkSize);

  currentSampleIndex = 0;
  currentSampleNr = 0;

  hasSignal = true;

  amplitudeThreshold = 1;
  gapStart = 0;

  gapFound = false;
  lastGapEndSampleNr = 0;

  goertzelAmp(x: Float32Array, k: number): number {
    this.fft.realTransform(this.out, x);
    const I = this.out[k * 2];
    const Q = this.out[k * 2 + 1];
    // const { I, Q } = goertzel(x, k);
    return Math.sqrt(I * I + Q * Q);
  }

  process(chunk: Float32Array, sampleRate: number) {
    this.chunks.push(chunk);

    while (this.chunks.length > 1) {
      const chunkSize = settings.chunkSize;
      const fftBinHighFrequency = Math.round(
        settings.highFrequency / (sampleRate / chunk.length)
      );
      const fftBinLowFrequency = Math.round(
        settings.lowFrequency / (sampleRate / chunk.length)
      );

      // fill buffer
      {
        let chunkIdx = 0;
        let idx = this.currentSampleIndex;
        for (let i = 0; i < chunkSize; i++) {
          this.buffer[i] = this.chunks[chunkIdx][idx++];
          if (idx >= chunkSize) {
            idx = 0;
            chunkIdx++;
          }
        }
      }

      // perform goertzel
      const al = this.goertzelAmp(this.buffer, fftBinHighFrequency);
      const ah = this.goertzelAmp(this.buffer, fftBinHighFrequency);

      const newHasSignal =
        al > this.amplitudeThreshold || ah > this.amplitudeThreshold;
      if (this.hasSignal == true && newHasSignal == false) {
        this.gapStart = this.currentSampleNr;
      }
      if (this.hasSignal == false && newHasSignal == true) {
        const gapEnd = Math.round(
          (this.gapStart + this.currentSampleNr) / 2 + chunkSize
        );
        console.log(
          "Gap End. GapStart: ",
          this.gapStart,
          " Now: ",
          this.currentSampleNr,
          "Gap Length",
          this.currentSampleNr - this.gapStart,
          "startChunk",
          Math.round(this.gapStart / chunkSize),
          "gapEnd",
          gapEnd
        );
        this.gapFound = true;
        this.lastGapEndSampleNr = gapEnd;
      }
      this.hasSignal = newHasSignal;

      // switch to next sample
      this.currentSampleNr++;
      this.currentSampleIndex++;
      if (this.currentSampleIndex >= chunkSize) {
        this.chunks.shift();
        this.currentSampleIndex = 0;
      }
    }
    return undefined;
  }
}
export class DemodulatorFskSCPS implements Demodulator {
  chunks: Float32Array[] = [];
  fft = new FFT(settings.chunkSize);
  out = this.fft.createComplexArray();
  buffer = new Float32Array(settings.chunkSize);

  currentSampleIndex = 0;
  currentSampleNr = 0;

  byteStarted = false;
  byteStartSampleNr = 0;
  bitIndex = 0;
  charValue = 0;

  gapFinder = new GapFinder();
  chunkShiftCount = 0;

  amplitude(bin: number) {
    return Math.sqrt(
      this.out[bin * 2] * this.out[bin * 2] +
        this.out[bin * 2 + 1] * this.out[bin * 2 + 1]
    );
  }
  process(chunk: Float32Array, sampleRate: number) {
    this.chunks.push(chunk);
    this.gapFinder.process(chunk, sampleRate);
    let result = "";
    const chunkSize = settings.chunkSize;
    const fftBinHighFrequency = Math.round(
      settings.highFrequency / (sampleRate / chunk.length)
    );
    const fftBinLowFrequency = Math.round(
      settings.lowFrequency / (sampleRate / chunk.length)
    );

    if (!this.byteStarted) {
      if (this.gapFinder.gapFound) {
        console.log("byte started");
        this.gapFinder.gapFound = false;
        this.byteStarted = true;
        this.byteStartSampleNr = this.gapFinder.lastGapEndSampleNr;
        this.bitIndex = 0;
        this.charValue = 0;

        if (this.currentSampleNr < this.byteStartSampleNr) {
          const remaining = this.byteStartSampleNr - this.currentSampleNr;
          this.currentSampleIndex += remaining;
          this.currentSampleNr += remaining;
        }
      }
    }

    if (this.byteStarted) {
      while (this.currentSampleIndex > chunkSize && this.chunks.length > 0) {
        console.log("chunkShift start");
        this.currentSampleIndex -= chunkSize;
        this.chunks.shift();
        this.chunkShiftCount++;
      }

      while (this.chunks.length > 1) {
        // fill buffer
        {
          let chunkIdx = 0;
          let idx = this.currentSampleIndex;
          console.log(
            "fill buffer. chunkShiftCount",
            this.chunkShiftCount,
            "idx",
            idx
          );
          for (let i = 0; i < chunkSize; i++) {
            this.buffer[i] = this.chunks[chunkIdx][idx++];
            if (idx >= chunkSize) {
              idx = 0;
              chunkIdx++;
            }
          }
        }

        // perform fft
        this.fft.realTransform(this.out, this.buffer);

        const energyHigh =
          this.amplitude(fftBinHighFrequency) +
          this.amplitude(fftBinHighFrequency + 1) +
          this.amplitude(fftBinHighFrequency - 1);
        const energyLow =
          this.amplitude(fftBinLowFrequency) +
          this.amplitude(fftBinLowFrequency + 1) +
          this.amplitude(fftBinLowFrequency - 1);

        console.log(
          "sampleNr",
          this.currentSampleNr,
          "bitIndex",
          this.bitIndex,
          "eh",
          energyHigh,
          "el",
          energyLow
        );
        // update char value
        if (energyHigh > energyLow) this.charValue += 1 << this.bitIndex;
        this.bitIndex++;
        if (this.bitIndex >= 7) {
          console.log("byte ended, value", this.charValue);
          this.byteStarted = false;
          result += String.fromCharCode(this.charValue);
        }

        // switch to next sample
        this.currentSampleNr += chunkSize;
        this.currentSampleIndex += chunkSize;
        if (this.currentSampleIndex >= chunkSize) {
          console.log("chunkShift end");
          this.chunks.shift();
          this.currentSampleIndex -= chunkSize;
          this.chunkShiftCount++;
        }
      }
    }
    if (result === "") return undefined;
    else return result;
  }
}
