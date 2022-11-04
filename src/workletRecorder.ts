import { FskDemodulator } from "./Demodulator";

const demodulator = new FskDemodulator();

export function startRecorderProcessorInput(): void {
  const audioContext = new AudioContext();
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(async (microphone) => {
      const mediaStreamSource =
        audioContext.createMediaStreamSource(microphone);
      await audioContext.audioWorklet.addModule("recorder.worklet.js");
      const recorder = new AudioWorkletNode(audioContext, "recorder.worklet");
      mediaStreamSource.connect(recorder).connect(audioContext.destination);

      recorder.port.onmessage = (event: { data: Float32Array }) => {
        const decoded = demodulator.process(event.data);
        if (decoded !== undefined) {
          console.log(decoded);
        }
      };
    });
}
