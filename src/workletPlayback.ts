import { FskModulator } from "./Modulator";

const audioCtx = new window.AudioContext();
const modulator = new FskModulator();
let initialized = false;

export async function workletPlayback(value: string) {
  modulator.send(value);

  if (!initialized) {
    initialized = true;
    await audioCtx.audioWorklet.addModule("output.worklet.js");
    const source = new AudioWorkletNode(audioCtx, "output.worklet");
    source.port.onmessage = (event: { data: number }) => {
      for (let i = 0; i < event.data; i++) {
        source.port.postMessage(modulator.produceChunk(audioCtx.sampleRate));
      }
    };
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(audioCtx.destination);

    // start the source playing
    //source.start();
    audioCtx.resume();
  }
}
