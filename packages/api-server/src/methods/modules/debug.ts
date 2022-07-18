import { prof } from "../../decorator";

const PROF_TIME_MS = 25000; // 25s

export class Debug {
  constructor() {}

  @prof(PROF_TIME_MS)
  async prof(_args: []): Promise<string> {
    return "ok";
  }
}
