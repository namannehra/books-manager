import isEqual from 'https://deno.land/x/lodash@4.17.15-es/isEqual.js'

import { maxConcurrentApiCalls } from '@data/api.ts'
import { Book, fetchBooks } from '@libs/books.ts'
import { NetworkError, WrongStatusError } from '@libs/network-errors.ts'
import { queryToQueryString, queryToString, ValidQuery } from '@libs/query.ts'
import { getApiUrl } from '@utils/api.ts'
import { orderedAsyncQueue } from '@utils/ordered-async-queue.ts'

export interface Entry extends Readonly<{
    query: ValidQuery
    books: readonly Book[]
    pagesCount: number
    lastReadBookId?: string
}> {}

export type Entries = readonly Entry[]

export interface BooksManagerOptions {
    domain?: string
    initialEntries?: Entries
}

export class NoDomainError extends Error {
    constructor() {
        super('Domain not set')
    }
}

export class DuplicateQueryError extends Error {
    constructor(public readonly index: number, public readonly entry: Entry) {
        super(`Duplicate query at index ${index}. Query: '${queryToString(entry.query)}'`)
    }
}

export class NoEntryError extends Error {
    constructor(public readonly index: number) {
        super(`No entry at index ${index}`)
    }
}

export interface BooksManagerUpdateOptions {
    indexes?: number[]
    onUpdate?: (index: number, error?: NetworkError | WrongStatusError | RangeError) => void
    onAllUpdate?: () => void
}

export class BooksManager {

    private domain?: string
    private entries: Entries

    constructor(options: BooksManagerOptions) {
        this.domain = options.domain
        this.entries = options.initialEntries ?? []
    }

    getDomain() {
        return this.domain
    }

    setDomain(domain: string) {
        this.domain = domain
    }

    add(query: ValidQuery) {
        const duplicateIndex = this.entries.findIndex(entry => isEqual(entry.query, query))
        if (duplicateIndex !== -1) {
            throw new DuplicateQueryError(duplicateIndex, this.entries[duplicateIndex])
        }
        const entry = {
            query,
            books: [],
            pagesCount: 0,
        }
        const index = this.entries.length
        this.entries = [...this.entries, entry]
        return index
    }

    remove(indexes: number[]) {
        this.entries = this.entries.filter((_, index) => !indexes.includes(index))
    }

    getEntries() {
        return this.entries
    }

    private async updateOne(index: number) {
        if (!this.domain) {
            throw new NoDomainError()
        }
        const entry = this.entries[index] as Entry | undefined
        if (!entry) {
            throw new NoEntryError(index)
        }
        const queryString = queryToQueryString(entry.query)
        const { books, pagesCount } = await fetchBooks(getApiUrl(this.domain, queryString))
        const newEntry = {
            ...entry,
            books,
            pagesCount,
        }
        this.entries = [...this.entries.slice(0, index), newEntry, ...this.entries.slice(index + 1)]
    }

    update(options: BooksManagerUpdateOptions) {
        const indexes = options.indexes ?? this.entries.map((_, index) => index)
        const tasks = indexes.map(index => async () => {
            try {
                await this.updateOne(index)
                options.onUpdate?.(index)
            } catch (error) {
                options.onUpdate?.(index, error)
            }
        })
        orderedAsyncQueue({
            tasks,
            maxConcurrency: maxConcurrentApiCalls,
            onAllDone: options.onAllUpdate,
        })
    }

    read(indexes: number[]) {
        this.entries = this.entries.map((entry, index) => {
            if (!indexes.includes(index) || !entry.books.length) {
                return entry
            }
            return {
                ...entry,
                lastReadBookId: entry.books[0].id,
            }
        })
    }

    sort() {
        this.entries = this.entries.slice().sort((entry1, entry2) => {
            if (entry1.pagesCount < entry2.pagesCount) {
                return -1
            }
            if (entry1.pagesCount > entry2.pagesCount) {
                return 1
            }
            const query1 = queryToString(entry1.query)
            const query2 = queryToString(entry2.query)
            if (query1 < query2) {
                return -1
            }
            if (query1 > query2) {
                return 1
            }
            return 0
        })
    }

}
