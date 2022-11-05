import { DemodulatorFsk } from "./DemodulatorFsk";
import { ModulatorFsk } from "./ModulatorFsk";
import { ModulatorFskSCPS } from "./ModulatorFskSCPS";

const settings = {
  bitDuration: 0.25,
  rampDuration: 0.01,
  lowFrequency: 17700,
  highFrequency: 18000,
  logRatioThreshold: 2.2,

  createModulator: () => new ModulatorFsk(),
  createDemodulator: () => new DemodulatorFsk(),
};
export default settings;
