import { describe, it, expect } from "vitest";
import { getErrorMessage, type DataObjectError } from "./api-error.util";
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

describe("API Error Mapper Utility", () => {
  it("Should extract message from a valid AxiosError containing DataObjectError", () => {
    const backendResponse: DataObjectError = {
      message: "Email já cadastrado na base de dados.",
      code: 409,
      timestamp: new Date().toISOString(),
    };

    const axiosError = new AxiosError(
      "Request failed with status code 409",
      "409",
      { headers: new AxiosHeaders() } as unknown as InternalAxiosRequestConfig,
      {},
      {
        status: 409,
        statusText: "Conflict",
        data: backendResponse,
        headers: {},
        config: { headers: new AxiosHeaders() } as unknown as InternalAxiosRequestConfig,
      },
    );

    const message = getErrorMessage(axiosError);
    expect(message).toBe("Email já cadastrado na base de dados.");
  });

  it("Should return fallback string when the error is a normal exception", () => {
    const error = new Error("Random JS Error");

    const message = getErrorMessage(error, "Erro genérico de UI");
    expect(message).toBe("Random JS Error");
  });

  it("Should ignore native unhandled network errors leaking their string and return fallback", () => {
    const error = new Error("Network Error");

    const message = getErrorMessage(error, "Erro genérico de conexão");
    expect(message).toBe("Erro genérico de conexão");
  });

  it("Should return fallback string when the error is null or undefined string", () => {
    const message = getErrorMessage(null, "Erro desconhecido");
    expect(message).toBe("Erro desconhecido");
  });
});
