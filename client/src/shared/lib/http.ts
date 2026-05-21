type ApiErrorBody = {
    message?: string
}

export const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error && 'isAxiosError' in error) {
        const maybeError = error as { response?: { data?: ApiErrorBody } }
        return maybeError.response?.data?.message ?? fallback
    }

    if (error instanceof Error) {
        return error.message
    }

    return fallback
}
