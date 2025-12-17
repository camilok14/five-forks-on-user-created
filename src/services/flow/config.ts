import { FlowConfig } from "./types";

const getFlowConfig = (): FlowConfig => {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;
  const baseUrl = process.env.FLOW_BASE_URL;

  if (!apiKey || !secretKey || !baseUrl) {
    throw new Error(
      "Flow API configuration is missing. Please set FLOW_API_KEY, FLOW_SECRET_KEY, and FLOW_BASE_URL environment variables."
    );
  }

  return {
    apiKey: apiKey,
    secretKey: secretKey,
    baseUrl: baseUrl,
  };
};

export default getFlowConfig;
