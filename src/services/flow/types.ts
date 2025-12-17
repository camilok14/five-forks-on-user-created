export interface FlowConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface CustomerCreateRequest {
  name: string;
  email: string;
  externalId: string;
}

export interface CustomerCreateResponse {
  customerId: string;
  name: string;
  email: string;
  status: string;
  registerUrl?: string;
}

export interface CustomerRegisterRequest {
  customerId: string;
  url_return: string;
}

export interface CustomerRegisterResponse {
  url: string;
  token: string;
}

export interface CustomerRegisterStatusRequest {
  token: string;
}

export interface CustomerRegisterStatusResponse {
  status: 1 | 2 | 3 | 4;
  cardNumber?: string;
  customerId?: string;
}

export enum RegisterStatus {
  PENDING = 1,
  COMPLETED = 2,
  REJECTED = 3,
  EXPIRED = 4,
}

export interface CustomerChargeRequest {
  customerId: string;
  amount: number;
  currency: string;
  subject: string;
  commerceOrder?: string;
  email?: string;
  urlConfirmation?: string;
  urlReturn?: string;
}

export interface CustomerChargeResponse {
  flowOrder: number;
  url: string;
  token: string;
}

export interface FlowError {
  code: number;
  message: string;
}

/**
 * An Error that carries Flow's status code alongside the message returned by the API.
 */
export class FlowApiError extends Error {
  code: number;

  /**
   * Wraps Flow responses that include an error code while preserving the built-in Error behavior.
   * @param {string} message - Human-readable text describing the failure.
   * @param {number} code - Numeric Flow status code for the failed operation.
   */
  constructor(message: string, code: number) {
    super(message);
    this.name = "FlowApiError";
    this.code = code;
  }
}
