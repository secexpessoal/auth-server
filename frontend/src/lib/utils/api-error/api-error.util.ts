import type { AxiosError } from 'axios';
import axios from 'axios'
import toast from "react-hot-toast";

export type DataObjectError = {
    code: number | string
    message: string
    timestamp: string
    error?: string
    path?: string
    traceId?: string
    details?: Record<string, string>
}

export type ValidationFieldError = {
    field: string
    message: string
}

const handledApiErrors = new WeakSet<object>()

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null
}

const extractFirstJsonObject = (value: string): string | null => {
    const startIndex = value.indexOf("{")
    if (startIndex === -1) return null

    let depth = 0
    let inString = false
    let escaped = false

    for (let index = startIndex; index < value.length; index += 1) {
        const char = value[index]

        if (escaped) {
            escaped = false
            continue
        }

        if (char === "\\") {
            escaped = true
            continue
        }

        if (char === "\"") {
            inString = !inString
            continue
        }

        if (inString) continue

        if (char === "{") depth += 1
        if (char === "}") depth -= 1

        if (depth === 0) {
            return value.slice(startIndex, index + 1)
        }
    }

    return null
}

const parseErrorPayload = (data: unknown): Partial<DataObjectError> | null => {
    if (isRecord(data)) return data as Partial<DataObjectError>

    if (typeof data !== "string") return null

    const trimmed = data.trim()
    if (!trimmed || trimmed.toLowerCase().includes("<html")) return null

    const jsonObject = extractFirstJsonObject(trimmed)
    if (jsonObject) {
        try {
            const parsed = JSON.parse(jsonObject)
            if (isRecord(parsed)) return parsed as Partial<DataObjectError>
        } catch (_error) {
            // Mantem fallback abaixo para strings que nao sejam JSON valido.
        }
    }

    return { message: trimmed }
}

const parseValidationDetailsFromMessage = (message: string): Record<string, string> | null => {
    const startIndex = message.indexOf("{")
    const endIndex = message.lastIndexOf("}")

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return null

    const rawPairs = message.slice(startIndex + 1, endIndex)
    const details: Record<string, string> = {}

    for (const entry of rawPairs.split(",")) {
        const separatorIndex = entry.indexOf("=")
        if (separatorIndex === -1) continue

        const field = entry.slice(0, separatorIndex).trim()
        const value = entry.slice(separatorIndex + 1).trim()
        if (!field || !value) continue

        details[field] = value
    }

    return Object.keys(details).length > 0 ? details : null
}

const stripValidationDetailsFromMessage = (message: string): string => {
    const index = message.indexOf("{")
    if (index === -1) return message

    return message.slice(0, index).trim().replace(/:$/, "")
}

/**
 * Extrai a mensagem de um erro de API seguindo o contrato DataObjectError.
 * @param error Erro lançado pela API (geralmente AxiosError)
 * @param fallback Mensagem padrão caso o erro não contenha uma mensagem específica
 * @returns {string} A mensagem de erro mapeada do backend ou a fallback
 */
export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<DataObjectError>
        const payload = parseErrorPayload(axiosError.response?.data)
        const responseMessage = typeof payload?.message === "string" ? payload.message : undefined
        if (responseMessage) {
            const details = payload?.details
            if (details && typeof details === "object" && Object.keys(details).length > 0) {
                return responseMessage
            }

            const parsedDetails = parseValidationDetailsFromMessage(responseMessage)
            if (parsedDetails) {
                return stripValidationDetailsFromMessage(responseMessage)
            }

            return responseMessage
        }

        if (axiosError.response) {
            return fallback
        }
    }

    if (error instanceof Error && error.message) {
        // NOTE: Evita retornar mensagens estranhas do erro de rede.
        if (error.message !== 'Network Error') {
            return error.message
        }
    }

    return fallback
}

export function getValidationFieldErrors(error: unknown): ValidationFieldError[] {
    if (!axios.isAxiosError(error)) return []

    const responseData = parseErrorPayload(error.response?.data)
    const details = responseData?.details
    if (details && typeof details === "object") {
        const entries = Object.entries(details) as Array<[string, string]>;
        return entries
            .filter(([, message]) => typeof message === "string" && message.trim().length > 0)
            .map(([field, message]) => ({ field, message }));
    }

    const parsedFromMessage = typeof responseData?.message === "string"
        ? parseValidationDetailsFromMessage(responseData.message)
        : null

    if (!parsedFromMessage) return []

    return Object.entries(parsedFromMessage).map(([field, message]) => ({ field, message: String(message) }))
}

export function toastValidationFieldErrors(
    error: unknown,
    fieldLabels: Record<string, string> = {},
): boolean {
  const fieldErrors = getValidationFieldErrors(error)

  if (fieldErrors.length === 0) return false

  if (isApiErrorHandled(error)) {
    return true
  }

  fieldErrors.forEach(({ field, message }) => {
    const label = fieldLabels[field]
    toast.error(label ? `${label}: ${message}` : message)
  })

  markApiErrorHandled(error)

  return true
}

export function isApiErrorHandled(error: unknown): boolean {
  return typeof error === "object" && error !== null && handledApiErrors.has(error)
}

export function markApiErrorHandled(error: unknown): void {
  if (typeof error === "object" && error !== null) {
    handledApiErrors.add(error)
  }
}

export function toastApiError(error: unknown, fallback = "Ocorreu um erro inesperado"): boolean {
  if (isApiErrorHandled(error)) return true

  toast.error(getErrorMessage(error, fallback))
  markApiErrorHandled(error)
  return true
}
