import settings from "./settings";

class WorkletRecorder {
  demodulator = settings.createDemodulator();
  audioContext!: AudioContext;
  initialized = false;

  onChunkRecorded: (chunk: Float32Array) => void = (chunk) => {};

  pauseRecorder() {
    this.audioContext.suspend();
  }

  startRecorder(): void {
    if (!this.initialized) {
      this.initialized = true;
      this.audioContext = new AudioContext();
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(async (microphone) => {
          const mediaStreamSource =
            this.audioContext.createMediaStreamSource(microphone);
          await this.audioContext.audioWorklet.addModule("recorder.worklet.js");
          const recorder = new AudioWorkletNode(
            this.audioContext,
            "recorder.worklet"
          );
          mediaStreamSource
            .connect(recorder)
            .connect(this.audioContext.destination);

          recorder.port.onmessage = (event: { data: Float32Array }) => {
            this.onChunkRecorded(event.data);
            const decoded = this.demodulator.process(
              event.data,
              this.audioContext.sampleRate
            );
            if (decoded !== undefined) {
              console.log(decoded);
            }
          };
        });
    }
    this.audioContext.resume();
  }
}

export const workletRecorder = new WorkletRecorder();
