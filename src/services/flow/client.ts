import CryptoJS from "crypto-js";
import {
  FlowConfig,
  CustomerCreateRequest,
  CustomerCreateResponse,
  CustomerRegisterRequest,
  CustomerRegisterResponse,
  CustomerRegisterStatusRequest,
  CustomerRegisterStatusResponse,
  CustomerChargeRequest,
  CustomerChargeResponse,
  FlowApiError,
} from "./types";

/**
 * Wrapper around Flow's HTTP API that signs requests with HMAC-SHA256
 * and exposes customer lifecycle helpers such as creation, registration,
 * registration status checking, and charging.
 *
 * @example
 * const client = new FlowClient({
 *   baseUrl: "https://api.flow.io",
 *   apiKey: "flow_api_key",
 *   secretKey: "flow_secret_key",
 * });
 */
export class FlowClient {
  private config: FlowConfig;

  /**
   * Constructs a FlowClient using the provided configuration for requests.
   * @param {FlowConfig} config - Flow API connection details (base URL, API key, secret key).
   */
  constructor(config: FlowConfig) {
    this.config = config;
  }

  /**
   * Sign the provided request parameters using HMAC-SHA256 and the configured
   * secret key. This method sorts the entries alphabetically, concatenates
   * each key immediately followed by its value, and returns the hexadecimal
   * representation of the signature so that Flow can verify the request integrity.
   *
   * @param {Record<string, string | number>} params - Parameters that should be included in the signature.
   * @return {string} The HMAC-SHA256 signature of the sorted parameters using the secret key.
   */
  private sign(params: Record<string, string | number>): string {
    // Sort parameters alphabetically by key name
    const sortedKeys = Object.keys(params).sort();

    // Concatenate as: key1value1key2value2...
    const toSign = sortedKeys
      .map((key) => `${key}${params[key]}`)
      .join("");

    // Debug logging
    console.log("🔐 Signing parameters:");
    console.log("  Parameters:", JSON.stringify(params, null, 2));
    console.log("  Sorted keys:", sortedKeys);
    console.log("  String to sign:", toSign);
    console.log("  Secret key (first 5 chars):", this.config.secretKey.substring(0, 5) + "...");

    // Sign with HMAC-SHA256 using the secret key
    // eslint-disable-next-line new-cap
    const signature = CryptoJS.HmacSHA256(toSign, this.config.secretKey).toString(
      CryptoJS.enc.Hex
    );

    console.log("  Generated signature:", signature);

    return signature;
  }

  /**
   * Generic method to make a signed request to the Flow API.
   * @template T The expected type of the response payload.
   * @param {string} endpoint The API endpoint to call.
   * @param {"GET" | "POST"} method The HTTP method to use.
   * @param {Record<string, string | number>} params The parameters for the request.
   * @return {Promise<T>} A promise that resolves with the response data.
   */
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST",
    params: Record<string, string | number>
  ): Promise<T> {
    try {
      const paramsWithApiKey = {
        apiKey: this.config.apiKey,
        ...params,
      };

      const signature = this.sign(paramsWithApiKey);
      const signedParams = {
        ...paramsWithApiKey,
        s: signature,
      };

      const url = `${this.config.baseUrl}${endpoint}`;
      let response: Response;

      console.log("📡 Making request:");
      console.log("  Method:", method);
      console.log("  URL:", url);
      console.log("  Endpoint:", endpoint);

      if (method === "GET") {
        // Sort parameters alphabetically for GET request
        const sortedEntries = Object.entries(signedParams)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => [key, String(value)]);
        const queryString = new URLSearchParams(sortedEntries).toString();
        console.log("  Query string:", queryString);
        response = await fetch(`${url}?${queryString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        // Sort parameters alphabetically for POST request body
        const sortedEntries = Object.entries(signedParams)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => [key, String(value)]);
        const formData = new URLSearchParams(sortedEntries);
        console.log("  Body (sorted):", formData.toString());
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });
      }

      console.log("  Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Unknown error",
          code: response.status,
        }));
        throw new FlowApiError(
          errorData.message || `HTTP error ${response.status}`,
          errorData.code || response.status
        );
      }

      const data = await response.json();

      if (data.code && data.code !== 0) {
        throw new FlowApiError(data.message || "API error", data.code);
      }

      return data as T;
    } catch (error) {
      if (error instanceof FlowApiError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new FlowApiError(error.message, 500);
      }

      throw new FlowApiError("Unknown error occurred", 500);
    }
  }

  /**
   * Creates a new customer in Flow.
   * @param {CustomerCreateRequest} request - The customer creation request.
   * @return {Promise<CustomerCreateResponse>} A promise that resolves with the customer creation response.
   */
  async createCustomer(
    request: CustomerCreateRequest
  ): Promise<CustomerCreateResponse> {
    const params: Record<string, string | number> = {
      name: request.name,
      email: request.email,
      externalId: request.externalId,
    };

    return this.makeRequest<CustomerCreateResponse>(
      "/customer/create",
      "POST",
      params
    );
  }

  /**
   * Retrieves the registration status of a customer.
   * @param {CustomerRegisterStatusRequest} request - The customer registration status request.
   * @return {Promise<CustomerRegisterStatusResponse>} A promise that resolves with the customer registration status response.
   */
  async registerCustomer(
    request: CustomerRegisterRequest
  ): Promise<CustomerRegisterResponse> {
    const params = {
      customerId: request.customerId,
      url_return: request.url_return,
    };

    return this.makeRequest<CustomerRegisterResponse>(
      "/customer/register",
      "POST",
      params
    );
  }

  /**
   * Retrieves the registration status of a customer.
   * @param {CustomerRegisterStatusRequest} request - The customer registration status request.
   * @return {Promise<CustomerRegisterStatusResponse>} A promise that resolves with the customer registration status response.
   */
  async getRegisterStatus(
    request: CustomerRegisterStatusRequest
  ): Promise<CustomerRegisterStatusResponse> {
    const params = {
      token: request.token,
    };

    return this.makeRequest<CustomerRegisterStatusResponse>(
      "/customer/getRegisterStatus",
      "GET",
      params
    );
  }

  /**
   * Charges a customer using Flow.
   * @param {CustomerChargeRequest} request - The customer charge request.
   * @return {Promise<CustomerChargeResponse>} A promise that resolves with the customer charge response.
   */
  async chargeCustomer(
    request: CustomerChargeRequest
  ): Promise<CustomerChargeResponse> {
    const params: Record<string, string | number> = {
      customerId: request.customerId,
      amount: request.amount,
      currency: request.currency,
      subject: request.subject,
    };

    // Add optional parameters if provided
    if (request.commerceOrder) {
      params.commerceOrder = request.commerceOrder;
    }
    if (request.email) {
      params.email = request.email;
    }
    if (request.urlConfirmation) {
      params.urlConfirmation = request.urlConfirmation;
    }
    if (request.urlReturn) {
      params.urlReturn = request.urlReturn;
    }

    return this.makeRequest<CustomerChargeResponse>(
      "/customer/charge",
      "POST",
      params
    );
  }
}
