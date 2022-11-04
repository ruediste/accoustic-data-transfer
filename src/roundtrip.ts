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
    const chunk = modulator.produceChunk(44000);
    const decoded = demodulator.process(chunk);
    if (decoded !== undefined) {
      result += decoded;
    }
  }
  console.log("Roundtrip Result", result);
  return ffts;
}
