import { constants } from "buffer";
import settings from "./settings";

export interface Modulator {
  send(value: string): void;
  produceChunk(sampleRate: number): Float32Array;
}
