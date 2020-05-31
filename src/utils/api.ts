import { api } from '@data/api.ts'

export const getApiUrl = (domain: string, query: string) => (
    `https://${domain}/${api}?query=${query}`
)
