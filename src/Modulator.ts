export interface Modulator {
  send(value: string): void;
  produceChunk(sampleRate: number): Float32Array;
}

export class FskModulator implements Modulator {
  value?: string;
  valueIndex: number = 0;
  bitIndex: number = 0;
  bitTime: number = 0;

  factor = 10;
  bitDuration = 10 / this.factor;
  rampDuration = 1 / 100 / this.factor;
  lowFrequency = 261.63 * this.factor;
  highFrequency = 329.63 * this.factor;

  send(value: string): void {
    if (value === "") return;
    this.value = value;
    this.valueIndex = 0;
    this.bitIndex = 0;
    this.bitTime = 0;
  }

  produceChunk(sampleRate: number): Float32Array {
    const chunk = new Float32Array(4096);
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
              (bitValue ? this.highFrequency : this.lowFrequency)
          );
          if (this.bitTime < this.rampDuration) {
            value *= this.bitTime / this.rampDuration;
          }
          {
            const remainingBitTime = this.bitDuration - this.bitTime;
            if (remainingBitTime < this.rampDuration) {
              value *= remainingBitTime / this.rampDuration;
            }
          }
        }
        chunk[idx] = value;
        idx++;
        this.bitTime += sampleTime;
        if (this.bitTime >= this.bitDuration) {
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
