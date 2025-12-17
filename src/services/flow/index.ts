import { FlowClient } from "./client";
import getFlowConfig from "./config";
export { FlowClient } from "./client";

let flowClientInstance: FlowClient | null = null;

export const getFlowClient = (): FlowClient => {
  if (!flowClientInstance) {
    const config = getFlowConfig();
    flowClientInstance = new FlowClient(config);
  }
  return flowClientInstance;
};
