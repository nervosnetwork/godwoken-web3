import { asyncSleep } from "./util";
import path from "path";
import fs from "fs";

const Profiler = require("v8-profiler-node8");

export function prof(timeMs?: number) {
  return function (
    _target: any,
    _name: string,
    descriptor: TypedPropertyDescriptor<(args: any) => Promise<any>>
  ) {
    const oldFunc = descriptor.value;
    descriptor.value = async function (p: any) {
      Profiler.startProfiling("CPU profile");
      const result = await oldFunc?.apply(this, p);
      // stop profile
      if (timeMs != null) {
        await asyncSleep(timeMs);
      }
      const profile = Profiler.stopProfiling();
      const cpuprofile = path.join(`${Date.now()}.cpuprofile`);
      profile
        .export()
        .pipe(fs.createWriteStream(cpuprofile))
        .on("finish", () => profile.delete());

      return result;
    };
    return descriptor;
  };
}
