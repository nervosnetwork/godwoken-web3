import { envConfig } from "../../base/env-config";

let enableList = ["Eth", "Web3", "Net", "Gw", "Poly"];
if (envConfig.enableDebugRpc === "true") {
  enableList.push("Debug");
}

export const list = enableList;

export * from "./eth";
export * from "./web3";
export * from "./net";
export * from "./gw";
export * from "./poly";
export * from "./debug";
