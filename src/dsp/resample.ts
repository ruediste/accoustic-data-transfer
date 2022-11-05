/* improper resampling */
export function resample(inData : any, sampleRateIn:number, sampleRateOut:number) : Float32Array {
    const out = new Float32Array(Math.round(inData.length*sampleRateOut/sampleRateIn));
    for( let i = 0; i < out.length; i++ ){
        out[i] = inData
            .slice(Math.floor(i*sampleRateIn/sampleRateOut),Math.floor(i*sampleRateIn/sampleRateOut)+1)
            .reduce((total:number,current:number)=>total+current,0);
    }
    return out;
}
