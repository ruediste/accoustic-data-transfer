export function firBP(
    passbandRipple: number = 0.05 /* [dB] */,
    stopBandAttenuation: number = 35  /* [dB] */,
    filterEdge: number[]  /* (lower att freq, lower pass freq, upper pass freq, upper att freq) [Hz] */,
    sampleRate: number /* Hz */): Float32Array {

    const Ap = passbandRipple;
    const Aa = stopBandAttenuation;

    const faL = filterEdge[0]
    const fpL = filterEdge[1]
    const fpU = filterEdge[2]
    const faU = filterEdge[3]
    const fs = sampleRate

    const Bt = Math.min(fpL - faL, faU - fpU);
    const fc1 = fpL - Bt / 2;
    const fc2 = fpU + Bt / 2;
    const T = 1 / fs;

    const dp = (Math.pow(10, Ap / 20) - 1) / (Math.pow(10, Ap / 20) + 1);
    const da = Math.pow(10, -Aa / 20);
    const d = Math.min(dp, da);

    const actualAa = -20 * Math.log10(d);

    let alpha;
    // kaiser window
    if (actualAa <= 21) {
        alpha = 0;
    } else if (actualAa <= 50) {
        alpha = 0.5842 * Math.pow((actualAa - 21), 0.4) + 0.07886 * (actualAa - 21);
    } else {
        alpha = 0.1102 * (actualAa - 8.7);
    }

    let D;
    if (actualAa <= 21) {
        D = 0.9222;
    } else {
        D = (actualAa - 7.95) / 14.36;
    }

    let N = Math.ceil(fs * D / Bt + 1);
    if (N % 2 === 0) {
        N = N + 1;
    }

    console.log("Filter order: " + N);

    const kaiserWindow = new Float32Array(N);
    const denominator = bessel(alpha);
    for (let n = -(N - 1) / 2; n <= (N - 1) / 2; n++) {
        let beta = alpha * Math.sqrt(1 - Math.pow(Math.abs(2 * n / (N - 1)), 2));
        let numerator = bessel(beta);
        kaiserWindow[n + (N - 1) / 2] = numerator / denominator;
    }

    let h = new Float32Array(N);
    for (let n = -(N - 1) / 2; n <= (N - 1) / 2; n++) {
        if (n == 0) {
            h[n + (N - 1) / 2] = (2 / fs) * (fc2 - fc1);
        } else {
            h[n + (N - 1) / 2] = (1 / (n * Math.PI)) * (Math.sin(2 * Math.PI * fc2 * n * T) - Math.sin(2 * Math.PI * fc1 * n * T));
        }

        h[n + (N - 1) / 2] *= kaiserWindow[n + (N - 1) / 2];
    }
    return h;
}

function bessel(x: number): number {
    let result = 0;
    let term = 1;
    let k = 1;
    while (term > Math.pow(10, -6)) {
        result += term;
        term = Math.pow(Math.pow(x / 2, k) / factorial(k), 2);
        ++k;
    }
    return result;
}

function factorial(num: number): number {
    let rval = 1;
    for (let i = 2; i <= num; ++i) {
        rval *= i;
    }
    return rval;
}
