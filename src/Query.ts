import {List, Record, RecordOf} from 'immutable'
import querystring from 'querystring'

export type Parameter = 'artists' | 'characters' | 'groups' | 'languages' | 'parodies' | 'tags'

export const parameters: List<Parameter> = List(['artists', 'characters', 'groups', 'languages', 'parodies', 'tags'])

export const parametersSingular = {
    artists: 'artist',
    characters: 'character',
    groups: 'group',
    languages: 'language',
    parodies: 'parody',
    tags: 'tag',
}

export type QueryProps = {
    artists: List<string>
    characters: List<string>
    groups: List<string>
    languages: List<string>
    parodies: List<string>
    tags: List<string>
}

export const Query = Record({
    artists: List(),
    characters: List(),
    groups: List(),
    languages: List(),
    parodies: List(),
    tags: List(),
} as QueryProps)

export type QueryType = RecordOf<QueryProps>

export class InvalidTermError extends Error {

    readonly term: string

    constructor(term: string) {
        super(`Invalid term: "${term}".`)
        this.term = term
    }

}

export class EmptyQueryError extends Error {

    constructor() {
        super('Query is empty.')
    }

}

export class ValidQuery extends Query {

    constructor(query: QueryType) {
        let sortedQuery = Query()
        let empty = true
        for (const [parameter, terms] of query) {
            if (terms.size) {
                empty = false
            }
            for (const term of terms) {
                if (!/^[a-z0-9-.]+( [a-z0-9-.]+)*$/.test(term)) {
                    throw new InvalidTermError(term)
                }
            }
            sortedQuery = sortedQuery.set(parameter, terms.sort())
        }
        if (empty) {
            throw new EmptyQueryError()
        }
        super(sortedQuery)
    }

}

export const queryToString = (query: QueryType) => {
    let parts = List()
    for (const [parameter, terms] of query) {
        if (terms.size) {
            parts = parts.concat(parameter + ': ' + terms.join(', '))
        }
    }
    return parts.join('; ')
}

export const queryToQueryString = (query: QueryType) => {
    const queryStringData: {
        [key: string]: string[],
    } = {}
    for (const [parameter, terms] of query) {
        if (terms.size) {
            queryStringData[parametersSingular[parameter]] = terms.toArray().map(term => `"${term}"`)
        }
    }
    return querystring.stringify(queryStringData, '+', ':')
}