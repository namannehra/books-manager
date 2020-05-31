export enum QueryKey {
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
export const queryKeys = Object.values(QueryKey).sort()

export type Query = ReadonlyMap<QueryKey, readonly string[]>

const validSymbol = Symbol('valid')

/**
 * Not empty.
 * Keys and values sorted.
 * No duplicate values.
 * No empty values.
 */
export interface ValidQuery extends Readonly<{
    [validSymbol]: true
    query: Query
}> {}

export class QueryEmptyError extends Error {
    constructor(public readonly query: Query) {
        super('Query is empty')
    }
}

export const getValidQuery = (query: Query): ValidQuery => {
    let empty = true
    for (const values of query.values()) {
        if (values.length) {
            empty = false
            break
        }
    }
    if (empty) {
        throw new QueryEmptyError(query)
    }
    const newQuery = new Map<QueryKey, readonly string[]>()
    for (const queryKey of queryKeys) {
        let values = query.get(queryKey)
        if (values?.length) {
            newQuery.set(queryKey, Array.from(new Set(values)).sort())
        }
    }
    const validQuery: ValidQuery = {
        [validSymbol]: true,
        query,
    }
    return validQuery
}

export const unsafeCastAsValidQuery = (query: Query): ValidQuery => ({
    [validSymbol]: true,
    query,
})

export const queryToString = (validQuery: ValidQuery) => {
    const parts = []
    for (const [key, values] of validQuery.query.entries()) {
        const part = `${key}: ${values.join(', ')}`
        parts.push(part)
    }
    return parts.join('; ')
}

export const queryToQueryString = (validQuery: ValidQuery) => {
    const parts = []
    for (const [key, values] of validQuery.query.entries()) {
        const part = values.map(value => `${key}:"${value.split(' ').join('+')}"`).join('+')
        parts.push(part)
    }
    return parts.join('+')
}
