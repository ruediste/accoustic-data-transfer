export function firBP(
    passbandRippleDB: number = 0.14,
    stopBandAttenuation: number = 52,
    filterEdge: number[],
    sampleRate: number): Float32Array {

    // passbandRippleDB == Ap = 0.14; %dB maximum passband ripple
    // stopBandAttenuation == Aadesirable = 52; % dB minimum stopband attenuation

    const Ap = passbandRippleDB;
    const Aadesirable = stopBandAttenuation;

    const wa1 = filterEdge[0] * 2 * Math.PI; // filterEdge[0]*2*Math.PI ==  wa1 = 400; % rad / s lower stopband edge
    const wp1 = filterEdge[1] * 2 * Math.PI; // filterEdge[1]*2*Math.PI ==  wp1 = 500; % rad / s lower passband edge
    const wp2 = filterEdge[2] * 2 * Math.PI; // filterEdge[2]*2*Math.PI ==  wp2 = 800; % rad / s upper passband edge
    const wa2 = filterEdge[3] * 2 * Math.PI; // filterEdge[3]*2*Math.PI ==  wa2 = 950; % rad / s upper stopband edge
    const ws = sampleRate * 2 * Math.PI;     // sampleRate*2*Math.PI == ws = 2400; % rad / s sampling frequency
    const T = 1 / sampleRate;

    const Bt = Math.min(wp1 - wa1, wa2 - wp2);
    const wc1 = wp1 - Bt / 2;
    const wc2 = wp2 + Bt / 2;

    const dp = ((Math.pow(10, (0.05 * Ap))) - 1) / ((Math.pow(10, (0.05 * Ap))) + 1);
    const da = Math.pow(10, (-0.05 * Aadesirable));
    const d = Math.min(dp, da);

    const Aa = -20 * Math.log10(d);
    let alpha;
    // kaiser window
    if (Aa <= 21) {
        alpha = 0;
    } else if (Aa <= 50) {
        alpha = (0.5842 * ((Aa - 21) ^ 0.4)) + (0.07886 * (Aa - 21));
    } else {
        alpha = 0.1102 * (Aa - 8.7);
    }
    let D;
    if (Aa <= 21) {
        D = 0.9222;
    } else {
        D = (Aa - 7.95) / 14.36;
    }

    let N = Math.ceil((ws * D / Bt) + 1);
    if (N % 2 === 0) {
        N = N + 1;
    }

    console.log("Filter order: " + N);

    const wk = new Float32Array(N);
    for (let n = -(N - 1) / 2; n < (N - 1) / 2; n++) {
        let beta = alpha * (1 - (2 * n / (N - 1)) ^ 2) ^ 0.5;
        let numerator = bessel(beta);
        let denominator = bessel(alpha);
        wk[n + (N - 1) / 2] = numerator / denominator;
    }

    let h = new Float32Array(N);
    for (let n = -(N - 1) / 2; n < (N - 1) / 2; n++) {
        if (n == 0) {
            h[n + (N - 1) / 2 + 1] = (2 / ws) * (wc2 - wc1);
        } else {
            h[n + (N - 1) / 2 + 1] = (1 / (n * Math.PI)) * (Math.sin(wc2 * n * T) - Math.sin(wc1 * n * T));
        }
    }
    return h;
}

function bessel(x: number) {
    let k = 1;
    let result = 0;
    let term = 10;
    while (term > Math.pow(10, (-6))) {
        term = (((x / 2) ^ k) / (factorial(k))) ^ 2;
        result = result + term;
        k = k + 1;
    }
    return result + 1;
}

function factorial(num: number) {
    var rval = 1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}
