import { resample } from "./resample";

test("double samples",()=>
{
    let out:Float32Array=resample([1,2,3,4,5,6],1,2);
    expect(out.toString()).toBe([1,1,2,2,3,3,4,4,5,5,6,6].toString())
});

test("2/3 samples",()=>
{
    let out:Float32Array=resample([1,2,3,4,5,6],2,3);
    expect(out.toString()).toBe([1,1,2,3,3,4,5,5,6].toString())
});
