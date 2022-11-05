import { constants } from 'buffer';
import settings from './settings';

export interface Modulator {
  send(value: string): void;
  produceChunk(sampleRate: number): Float32Array;
}

export class FskModulator implements Modulator {
  value?: string;
  valueIndex: number = 0;
  bitIndex: number = 0;
  bitTime: number = 0;

  send(value: string): void {
    if (value === "") return;
    this.value = value;
    this.valueIndex = 0;
    this.bitIndex = 0;
    this.bitTime = 0;
  }

  produceChunk(sampleRate: number): Float32Array {
    const chunk = new Float32Array(2048);
    const sampleTime = 1 / sampleRate;
    let idx = 0;
    while (true) {
      if (this.value === undefined) return chunk;
      const bitValue =
        0 !== ((this.value.codePointAt(this.valueIndex)! >> this.bitIndex) & 1);
      while (true) {
        if (idx >= chunk.length) return chunk;

        let value: number;
        if (this.bitIndex === 8) {
          value = 0;
        } else {
          value = Math.sin(
            this.bitTime *
              Math.PI *
              2 *
              (bitValue ? settings.highFrequency : settings.lowFrequency)
          );

          // ramp calculation
          if (this.bitTime < settings.rampDuration) {
            value *= this.bitTime / settings.rampDuration;
          }
          {
            const remainingBitTime = settings.bitDuration - this.bitTime;
            if (remainingBitTime < settings.rampDuration) {
              value *= remainingBitTime / settings.rampDuration;
            }
          }
        }
        chunk[idx] = value;
        idx++;
        this.bitTime += sampleTime;
        if (this.bitTime >= settings.bitDuration) {
          this.bitIndex++;
          this.bitTime = 0;
          if (this.bitIndex >= 9) {
            this.bitIndex = 0;
            this.valueIndex++;
            if (this.valueIndex >= this.value.length) {
              this.value = undefined;
            }
          }
          break;
        }
      }
    }
  }
}
