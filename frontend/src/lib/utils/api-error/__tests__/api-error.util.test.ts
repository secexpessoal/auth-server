import { describe, it, expect } from "vitest";
import { getErrorMessage, getValidationFieldErrors, type DataObjectError } from "@lib/utils/api-error/api-error.util";
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

  it("Should extract validation field errors from a valid AxiosError containing details", () => {
    const backendResponse: DataObjectError = {
      message: "Erro de validação nos campos informados",
      code: "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
      details: {
        username: "O nome do usuário é obrigatório",
        registration: "A matrícula é obrigatória",
      },
    };

    const axiosError = new AxiosError(
      "Request failed with status code 400",
      "400",
      { headers: new AxiosHeaders() } as unknown as InternalAxiosRequestConfig,
      {},
      {
        status: 400,
        statusText: "Bad Request",
        data: backendResponse,
        headers: {},
        config: { headers: new AxiosHeaders() } as unknown as InternalAxiosRequestConfig,
      },
    );

    const details = getValidationFieldErrors(axiosError);

    expect(details).toEqual([
      { field: "username", message: "O nome do usuário é obrigatório" },
      { field: "registration", message: "A matrícula é obrigatória" },
    ]);
  });

  it("Should extract validation field errors from legacy message payloads", () => {
    const backendResponse: DataObjectError = {
      message: "Erro de validação nos campos informados: {workRegime=O regime de trabalho é obrigatório, registration=A matrícula é obrigatória, position=O cargo é obrigatório}",
      code: "BAD_REQUEST",
      timestamp: new Date().toISOString(),
    };

    const axiosError = new AxiosError(
      "Request failed with status code 400",
      "400",
      { headers: new AxiosHeaders() } as unknown as InternalAxiosRequestConfig,
      {},
      {
        status: 400,
        statusText: "Bad Request",
        data: backendResponse,
        headers: {},
        config: { headers: new AxiosHeaders() } as unknown as InternalAxiosRequestConfig,
      },
    );

    const details = getValidationFieldErrors(axiosError);

    expect(details).toEqual([
      { field: "workRegime", message: "O regime de trabalho é obrigatório" },
      { field: "registration", message: "A matrícula é obrigatória" },
      { field: "position", message: "O cargo é obrigatório" },
    ]);
  });

  it("Should strip legacy validation details from the top-level error message", () => {
    const backendResponse: DataObjectError = {
      message: "Erro de validação nos campos informados: {workRegime=O regime de trabalho é obrigatório}",
      code: "BAD_REQUEST",
      timestamp: new Date().toISOString(),
    };

    const axiosError = new AxiosError(
      "Request failed with status code 400",
      "400",
      { headers: new AxiosHeaders() } as unknown as InternalAxiosRequestConfig,
      {},
      {
        status: 400,
        statusText: "Bad Request",
        data: backendResponse,
        headers: {},
        config: { headers: new AxiosHeaders() } as unknown as InternalAxiosRequestConfig,
      },
    );

    const message = getErrorMessage(axiosError);
    expect(message).toBe("Erro de validação nos campos informados");
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
