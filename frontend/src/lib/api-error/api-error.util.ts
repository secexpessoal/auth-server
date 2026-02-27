import axios, { AxiosError } from 'axios'

export type DataObjectError = {
    message: string
    timestamp: string
    code: number
    details?: Record<string, string>
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
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message
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
