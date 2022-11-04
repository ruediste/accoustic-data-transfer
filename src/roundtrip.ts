import { FskDemodulator } from "./Demodulator";
import { FskModulator } from "./Modulator";

export function performRoundtrip() {
  const modulator = new FskModulator();
  const demodulator = new FskDemodulator();

  const ffts: Float32Array[] = [];
  demodulator.onFft = (fft) => ffts.push(fft);

  const input = "A";
  let result = "";
  modulator.send(input);
  for (let i = 0; i < 100; i++) {
    const sampleRate = 44000;
    const chunk = modulator.produceChunk(sampleRate);
    const decoded = demodulator.process(chunk, sampleRate);
    if (decoded !== undefined) {
      result += decoded;
    }
  }
  console.log("Roundtrip Result", result);
  return ffts;
}
