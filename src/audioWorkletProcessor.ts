import {fftRealHalf} from 'dsp-collection/signal/Fft'

export function startRecorderProcessorInput(): void {
    const audioContext = new AudioContext();
    navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(async (microphone) => {
            console.log("got stream");
            const mediaStreamSource = audioContext.createMediaStreamSource(microphone);
            await audioContext.audioWorklet.addModule("recorder.worklet.js");
            const recorder = new AudioWorkletNode(audioContext, "recorder.worklet");
            mediaStreamSource.connect(recorder).connect(audioContext.destination);

            recorder.port.onmessage = (event: {data:  Float32Array }) => {
                console.log(audioContext.sampleRate);
                console.log(fftRealHalf(event.data).getAbsArray());
            }
        });
}

