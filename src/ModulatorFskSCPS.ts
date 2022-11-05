import { Modulator } from "./Modulator";
import settings from "./settings";

export class ModulatorFskSCPS implements Modulator {
  value?: string;
  valueIndex: number = 0;
  bitIndex: number = 0;
  sendingStartBit = false;

  send(value: string): void {
    if (value === "") return;
    this.value = value;
    this.valueIndex = 0;
    this.bitIndex = 0;
    this.sendingStartBit = true;
  }

  produceChunk(sampleRate: number): Float32Array {
    const chunk = new Float32Array(2048);

    if (this.value === undefined) return chunk;

    // the second start bit is just a gap
    if (this.sendingStartBit && this.bitIndex == 5) {
      this.sendingStartBit = false;
      this.bitIndex = 0;
      return chunk;
    }

    // the 8th bit is the gap, so nothing to do
    if (this.bitIndex < 8) {
      const sampleTime = 1 / sampleRate;

      const bitValue = this.sendingStartBit
        ? false
        : 0 !==
          ((this.value.codePointAt(this.valueIndex)! >> this.bitIndex) & 1);

      // generate sine for the current bit (whole chunk)
      let t = 0;
      const rampSamples = chunk.length / 10;
      for (let i = 0; i < chunk.length; i++) {
        let value = Math.sin(
          t *
            Math.PI *
            2 *
            (bitValue ? settings.highFrequency : settings.lowFrequency)
        );

        // ramp calculation
        if (i < rampSamples) {
          value *= i / rampSamples;
        }
        {
          const remainingSamples = chunk.length - i;
          if (remainingSamples < rampSamples) {
            value *= remainingSamples / rampSamples;
          }
        }

        chunk[i] = value;

        t += sampleTime;
      }
    }

    // switch to next bit
    this.bitIndex++;
    if (this.bitIndex >= 9) {
      this.bitIndex = 0;
      this.valueIndex++;
      if (this.valueIndex >= this.value.length) {
        this.value = undefined;
      }
    }
    return chunk;
  }
}
