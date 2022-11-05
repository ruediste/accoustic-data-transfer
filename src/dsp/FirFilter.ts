export class FirFilter {
    filterCoefficients!: Float32Array;
    filterTaps!: Float32Array;

    constructor(filterCoefficients: Float32Array) {
        this.filterCoefficients = filterCoefficients;
        this.filterTaps = new Float32Array(filterCoefficients.length);
    }

    filter(outArray: Float32Array, inArray: Float32Array) {
        for (let i = 0; i < outArray.length; i++) {
            this.filterTaps.copyWithin(1, 0);
            this.filterTaps[0] = inArray[i];
            outArray[i] = this.filterTaps.reduce((previousValue, currentValue, currentIndex) => previousValue + currentValue * this.filterCoefficients[currentIndex]);
        }
    }
}
