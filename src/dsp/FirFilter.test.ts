import exp from "constants";
import { FirFilter } from "./FirFilter";


test("filter empty", () => {
    const filter = new FirFilter(new Float32Array([1, 0, 0, 0, 0, 0]));
    const inputValue = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const out = new Float32Array(inputValue.length);

    filter.filter(out, inputValue);
    expect(out.toString()).toEqual(inputValue.toString());
});

test("filter two coeffs with gap", () => {
    const filter = new FirFilter(new Float32Array([1, 0, 1, 0, 0, 0]));
    const inputValue = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const out = new Float32Array(inputValue.length);

    filter.filter(out, inputValue);
    expect(out.toString()).toEqual([1, 2, 4, 6, 8, 10, 12, 14, 16, 18].toString());
});
