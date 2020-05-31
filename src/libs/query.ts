export enum QueryKeys {
    artists = 'artists',
    characters = 'characters',
    groups = 'groups',
    languages = 'languages',
    parodies = 'parodies',
    tags = 'tags',
}

/**
 * Sorted
 */
export const queryKeys = Object.values(QueryKeys).sort()

export type Query = Readonly<{
    [key in QueryKeys]?: readonly string[]
}>

const validSymbol = Symbol('valid')

type MutableValidQuery = {
    [validSymbol]: true
} & {
    [key in QueryKeys]: readonly string[]
}

/**
 * Not empty.
 * Keys and values sorted.
 * No duplicate values.
 */
export type ValidQuery = Readonly<MutableValidQuery>

export const isValidQuery = (query: Query): query is ValidQuery => validSymbol in query

export class QueryEmptyError extends Error {
    constructor(public readonly query: Query) {
        super('Query is empty')
    }
}

export const getValidQuery = (query: Query): ValidQuery => {
    if (isValidQuery(query)) {
        return query
    }
    const empty = queryKeys.every(key => {
        const values = query[key]
        return !values || !values.length
    })
    if (empty) {
        throw new QueryEmptyError(query)
    }
    const validQuery: Partial<MutableValidQuery> = {
        [validSymbol]: true
    }
    for (const queryKey of queryKeys) {
        let values = query[queryKey]
        if (values) {
            values = Array.from(new Set(values)).sort()
        } else {
            values = []
        }
        validQuery[queryKey] = values
    }
    return validQuery as ValidQuery
}

export const queryToString = (query: ValidQuery) => {
    const parts = []
    for (const key of queryKeys) {
        const values = query[key]
        if (!values.length) {
            continue
        }
        const part = `${key}: ${values.join(', ')}`
        parts.push(part)
    }
    return parts.join('; ')
}

export const queryToQueryString = (query: ValidQuery) => {
    const parts = []
    for (const key of queryKeys) {
        const values = query[key]
        if (!values.length) {
            continue
        }
        const part = values.map(value => `${key}:"${value.split(' ').join('+')}"`).join('+')
        parts.push(part)
    }
    return parts.join('+')
}
