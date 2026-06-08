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

const handledValidationErrors = new WeakSet<object>()

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
        const responseMessage = axiosError.response?.data?.message
        if (responseMessage) {
            const details = axiosError.response?.data?.details
            if (details && typeof details === "object" && Object.keys(details).length > 0) {
                return responseMessage
            }

            const parsedDetails = parseValidationDetailsFromMessage(responseMessage)
            if (parsedDetails) {
                return stripValidationDetailsFromMessage(responseMessage)
            }

            return responseMessage
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

    const responseData = error.response?.data
    const details = responseData?.details
    if (details && typeof details === "object") {
        return Object.entries(details)
            .filter(([, message]) => typeof message === "string" && message.trim().length > 0)
            .map(([field, message]) => ({ field, message }))
    }

    const parsedFromMessage = typeof responseData?.message === "string"
        ? parseValidationDetailsFromMessage(responseData.message)
        : null

    if (!parsedFromMessage) return []

    return Object.entries(parsedFromMessage).map(([field, message]) => ({ field, message }))
}

export function toastValidationFieldErrors(
    error: unknown,
    fieldLabels: Record<string, string> = {},
): boolean {
  const fieldErrors = getValidationFieldErrors(error)

  if (fieldErrors.length === 0) return false

  if (typeof error === "object" && error !== null && handledValidationErrors.has(error)) {
    return true
  }

  fieldErrors.forEach(({ field, message }) => {
    const label = fieldLabels[field]
    toast.error(label ? `${label}: ${message}` : message)
  })

  if (typeof error === "object" && error !== null) {
    handledValidationErrors.add(error)
  }

  return true
}
