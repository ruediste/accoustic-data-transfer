import { FskDemodulator } from "./Demodulator";
import { FskModulator } from "./Modulator";

export function performRoundtrip() {
  const modulator = new FskModulator();
  const demodulator = new FskDemodulator();

  const ffts: Float32Array[] = [];
  demodulator.onFft = (fft, energyHigh, energyLow, symbolTime, symbolValue) => {
    ffts.push(fft);
    console.log("EH: " + energyHigh + " EL: " + energyLow + " SymbolT: " + symbolTime + " SymbolV " + symbolValue);
  };

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
    const decoded = demodulator.process(chunk, sampleRate);
    if (decoded !== undefined) {
      result += decoded;
    }
  }
  console.log("Roundtrip Result", result);
  return ffts;
}
