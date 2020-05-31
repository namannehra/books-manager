import { Book } from '@libs/books.ts'
import { ValidQuery } from '@libs/query.ts'

export type Entry = Readonly<{
    query: ValidQuery
    books: readonly Book[]
    pagesCount: number
    lastReadBookId: string
}>

export type Entries = readonly Entry[]

export interface BooksManagerOptions {
    domain: string
    initialEntries?: Entries
}

export class BooksManager {

    readonly domain: string

    private entries: Entries

    constructor(options: BooksManagerOptions) {
        this.domain = options.domain
        this.entries = options.initialEntries ?? []
    }

    getEntries() {
        return this.entries
    }

}
