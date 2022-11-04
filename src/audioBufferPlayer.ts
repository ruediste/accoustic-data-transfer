export function startPlayback() : void {
    const audioCtx = new window.AudioContext();
    const arrayBuffer =audioCtx.createBuffer(
        1, audioCtx.sampleRate * 3, audioCtx.sampleRate
    );
    const channelData=arrayBuffer.getChannelData(0);
    for(let i=0; i<arrayBuffer.length; i++){
        channelData[i] = Math.sin(2*Math.PI * i/audioCtx.sampleRate*261.63);
        channelData[i] += Math.sin(2*Math.PI * i/audioCtx.sampleRate*329.63);
        channelData[i] /= 2;
    }
    const source = audioCtx.createBufferSource();

    // set the buffer in the AudioBufferSourceNode
    source.buffer = arrayBuffer;

    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(audioCtx.destination);

    // start the source playing
    source.start();
}
