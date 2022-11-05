import { Demodulator } from "./Demodulator";
import { Modulator } from "./Modulator";
import settings from "./settings";

export function performRoundtrip() {
  const modulator: Modulator = settings.createModulator();
  const demodulator: Demodulator = settings.createDemodulator();

  const chunks: Float32Array[] = [];

  const input = "ABC";
  let result = "";
  modulator.send(input);

  const sampleRate = 44000;

  // rx/tx offset
  modulator.produceChunk(sampleRate);
  modulator.produceChunk(sampleRate);
  modulator.produceChunk(sampleRate);

  for (let i = 0; i < 100; i++) {
    const chunk = modulator.produceChunk(sampleRate);
    chunks.push(chunk);
    const decoded = demodulator.process(chunk, sampleRate);
    if (decoded !== undefined) {
      result += decoded;
    }
  }
  console.log("Roundtrip Result", result);
  return chunks;
}
