import settings from "./settings";

let audioCtx: AudioContext;
const modulator = settings.createModulator();
let initialized = false;

export async function workletPlayback(value: string) {
  modulator.send(value);

  if (!initialized) {
    audioCtx = new AudioContext();
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
