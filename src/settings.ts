import { DemodulatorFsk } from "./DemodulatorFsk";
import { DemodulatorFskSCPS } from "./DemodulatorFskSCPS";
import { ModulatorFsk } from "./ModulatorFsk";
import { ModulatorFskSCPS } from "./ModulatorFskSCPS";

const settings = {
  bitDuration: 0.25,
  rampDuration: 0.01,
  lowFrequency: 17700,
  highFrequency: 18000,
  logRatioThreshold: 2.2,

  chunkSize: 2048,

  createModulator: () => new ModulatorFskSCPS(),
  createDemodulator: () => new DemodulatorFskSCPS(),
};
export default settings;
