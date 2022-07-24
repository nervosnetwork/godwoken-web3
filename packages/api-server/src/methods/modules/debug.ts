import { prof } from "../../decorator";
import heapdump from "heapdump";
import path from "path";

const PROF_TIME_MS = 25000; // 25s

export class Debug {
  constructor() {}

  @prof(PROF_TIME_MS)
  async prof(_args: []): Promise<string> {
    return "ok";
  }

  async heapdump() {
    const f = path.join(`${Date.now()}.heapsnapshot`);
    await heapdump.writeSnapshot(f);
    return "ok";
  }
}
