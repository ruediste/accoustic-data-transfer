export class Mixer{
    sampleNumber : number = 0;
    phaseCorrection : number = 0;

    frequency!: number;
    sampleRate!: number;

    constructor(frequency: number, sampleRate: number) {
        this.frequency=frequency;
        this.sampleRate=sampleRate;
    }

    mixIQ(outI : any, outQ : any, inData : any) : void {
        for(let i = 0; i < inData.length; i++)
        {
            outI[i] = Math.cos(2*Math.PI*this.frequency * this.sampleNumber/this.sampleRate + this.phaseCorrection) * inData[i];
            outQ[i] = Math.sin(2*Math.PI*this.frequency * this.sampleNumber/this.sampleRate + this.phaseCorrection) * inData[i];

            this.sampleNumber++;
            if (2*Math.PI*this.frequency * this.sampleNumber/this.sampleRate > 2*Math.PI){
                this.phaseCorrection += (2*Math.PI*this.frequency * this.sampleNumber/this.sampleRate) - 2*Math.PI;
                this.sampleNumber = 0;
            }
            if(this.phaseCorrection > 2*Math.PI){
                this.phaseCorrection -= 2*Math.PI;
            }
        }
    }
}

