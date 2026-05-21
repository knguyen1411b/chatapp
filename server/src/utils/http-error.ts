import { ZodError } from 'zod'

export const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof ZodError) {
        return error.issues[0]?.message ?? fallback
    }

    if (error instanceof Error) {
        return error.message
    }

    return fallback
}
