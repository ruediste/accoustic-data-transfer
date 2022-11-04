class OutputProcessor extends AudioWorkletProcessor {
    bufferSize = 4096

    desiredChunkCount=5;

    chunks=[];

    currentChunk=undefined
    currentChunkOffset=0;

    constructor() {
        super();
        this.port.onmessage=e=>{
            if (this.currentChunk==undefined){
                this.currentChunk=e.data;
                this.currentChunkOffset=0;
            }
            else
                this.chunks.push(e.data);
        }
        this.port.postMessage(this.desiredChunkCount-this.chunks.length);
    }

    process(inputs, outputs) {
        for (let i=0; i< outputs[0][0].length; i++){
            if (this.currentChunk==undefined)
                outputs[0][0][i]=0;
            else {
                outputs[0][0][i]=this.currentChunk[this.currentChunkOffset++];
                if (this.currentChunkOffset>=this.currentChunk.length)
                {
                    if (this.chunks.length==0){
                        this.currentChunk=undefined;
                    }
                    else
                    {
                        this.currentChunk=this.chunks.shift();
                        this.currentChunkOffset=0;
                        if (this.chunks.length<this.desiredChunkCount){
                            this.port.postMessage(this.desiredChunkCount-this.chunks.length);
                        }
                    }
                }
            }
        }

        return true
    }


}

registerProcessor("output.worklet", OutputProcessor)
