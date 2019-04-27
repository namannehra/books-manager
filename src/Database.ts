import fs from 'fs'
import {List, Record, RecordOf} from 'immutable'

import {Book, BookProps, BookType} from './Book'
import {Query, QueryType, ValidQuery} from './Query'

type DataQuery = {
    artists?: string[],
    characters?: string[],
    groups?: string[],
    languages?: string[],
    parodies?: string[],
    tags?: string[],
}

type DataEntry = {
    query: DataQuery,
    totalPages: number,
    unreadCount: number,
    unreadBooks: BookProps[],
    lastBookRead: BookProps | null,
}

type UpdateData = {
    totalPages: number,
    unreadCount: number,
    unreadBooks: List<BookType>,
}

type EntryProps = UpdateData & {
    query: QueryType,
    lastBookRead: BookType | null,
}

const Entry = Record({
    query: Query(),
    totalPages: 0,
    unreadCount: 0,
    unreadBooks: List(),
    lastBookRead: null,
} as EntryProps)

export type EntryType = RecordOf<EntryProps>

const dataQueryToQuery = (query: DataQuery) => new ValidQuery(Query(Object.entries(query).map(
    ([parameter, terms]) => [parameter, terms ? List(terms) : List()]
)))

const dataEntryToEntry = (entry: DataEntry) => Entry({
    query: dataQueryToQuery(entry.query),
    totalPages: entry.totalPages,
    unreadCount: entry.unreadCount,
    unreadBooks: List(entry.unreadBooks.map(book => Book(book))),
    lastBookRead: entry.lastBookRead ? Book(entry.lastBookRead) : null,
})

export class QueryAlreadyPresentError extends Error {

    readonly query: ValidQuery

    constructor(query: ValidQuery) {
        super(`Query already present. Query: ${query}.`)
        this.query = query
    }

}

export class NoEntryAtIndexError extends Error {

    readonly index: number

    constructor(index: number) {
        super(`No entry at index ${index}.`)
        this.index = index
    }

}

export class NoBooksForEntryError extends Error {

    readonly entry: EntryType

    constructor(entry: EntryType) {
        super(`No books in entry. Entry: ${entry}.`)
        this.entry = entry
    }

}

export class Database {

    readonly location: string
    private readonly data: {
        domain: string,
        entries: DataEntry[],
    }

    constructor(location: string) {
        this.location = location
        try {
            const file = fs.readFileSync(location, {
                encoding: 'utf8',
            })
            this.data = JSON.parse(file)
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error
            }
            this.data = {
                domain: '',
                entries: [],
            }
            this.updateFile()
        }
    }

    updateFile() {
        fs.writeFileSync(this.location, JSON.stringify(this.data, undefined, 4))
    }

    get domain() {
        return this.data.domain
    }

    set domain(domain) {
        if (domain) {
            this.data.domain = domain
        } else {
            delete this.data.domain
        }
        this.updateFile()
    }

    getEntries() {
        return this.data.entries.map(dataEntryToEntry)
    }

    getEntry(index: number) {
        const entry = this.data.entries[index]
        if (!entry) {
            throw new NoEntryAtIndexError(index)
        }
        return dataEntryToEntry(entry)
    }

    add(query: ValidQuery): [number, EntryType] {
        if (this.data.entries.some(entry => dataQueryToQuery(entry.query).equals(query))) {
            throw new QueryAlreadyPresentError(query)
        }
        const dataQuery: DataQuery = {}
        for (const [parameter, terms] of query) {
            if (terms.size) {
                dataQuery[parameter] = terms.toArray()
            }
        }
        const length = this.data.entries.push({
            query: dataQuery,
            totalPages: 0,
            unreadCount: 0,
            unreadBooks: [],
            lastBookRead: null,
        })
        this.updateFile()
        const index = length - 1
        return [index, dataEntryToEntry(this.data.entries[index])]
    }

    update(index: number, data: UpdateData) {
        const entry = this.data.entries[index]
        if (!entry) {
            throw new NoEntryAtIndexError(index)
        }
        Object.assign(entry, data)
        this.updateFile()
        return dataEntryToEntry(entry)
    }

    read(index: number) {
        const entry = this.data.entries[index]
        if (!entry) {
            throw new NoEntryAtIndexError(index)
        }
        const latestBook = entry.unreadBooks[0]
        if (!latestBook) {
            throw new NoBooksForEntryError(dataEntryToEntry(entry))
        }
        entry.unreadCount = 0
        entry.unreadBooks = []
        entry.lastBookRead = latestBook
        this.updateFile()
        return dataEntryToEntry(entry)
    }

    remove(index: number) {
        const {entries} = this.data
        const entry = entries[index]
        if (!entry) {
            throw new NoEntryAtIndexError(index)
        }
        entries.splice(index, 1)
        this.updateFile()
        return dataEntryToEntry(entry)
    }

    sort() {
        this.data.entries.sort((entry1, entry2) => entry2.totalPages - entry1.totalPages)
        this.updateFile()
    }

}