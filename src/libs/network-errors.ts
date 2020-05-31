export class NetworkError extends Error {
    constructor(public readonly originalError: Error) {
        super('Network error')
    }
}

export class WrongStatusError extends Error {
    constructor(public readonly code: number, public readonly message: string) {
        super(`Worng status: ${code} (${message})`)
    }
}
