let t1 = 0;
let t2 = 0;

export async function startWorkletPlayback() {
  const audioCtx = new window.AudioContext();
  const sampleTime = 1 / audioCtx.sampleRate;
  const f1 = 2 * Math.PI * 261.63;
  const f2 = 2 * Math.PI * 329.63;

  await audioCtx.audioWorklet.addModule("output.worklet.js");
  const source = new AudioWorkletNode(audioCtx, "output.worklet");
  source.port.onmessage = (event: { data: number }) => {
    for (let i = 0; i < event.data; i++) {
      const buffer = new Float32Array(4096);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.sin(t1 * f1);
        buffer[i] += Math.sin(t2 * f2);
        buffer[i] /= 2;
        t1 += sampleTime;
        t2 += sampleTime;
      }
      source.port.postMessage(buffer);

      t1 = ((t1 * f1) % (2 * Math.PI)) / f1;
      t2 = ((t2 * f2) % (2 * Math.PI)) / f2;
    }
  };

  // connect the AudioBufferSourceNode to the
  // destination so we can hear the sound
  source.connect(audioCtx.destination);

  // start the source playing
  //source.start();
  audioCtx.resume();
}
