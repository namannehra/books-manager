import { BooksManager, BooksManagerUpdateOptions, Entry } from '@libs/books-manager.ts'
import { DatabaseEntry, readFromDatabase, writeToDatabase } from '@libs/database.ts'
import { QueryKey, unsafeCastAsValidQuery, ValidQuery } from '@libs/query.ts'

const databaseEntryToEntry = (databaseEntry: DatabaseEntry): Entry => {
    const entries = Object.entries(databaseEntry.query) as [QueryKey, readonly string[]][]
    return {
        query: unsafeCastAsValidQuery(new Map(entries)),
        books: databaseEntry.books,
        pagesCount: databaseEntry.pagesCount,
        lastReadBookId: databaseEntry.lastReadBookId,
    }
}

const entryToEntryDatabase = (entry: Entry): DatabaseEntry => ({
    query: Object.fromEntries(entry.query.query.entries()),
    books: entry.books,
    pagesCount: entry.pagesCount,
    lastReadBookId: entry.lastReadBookId,
})

export class BooksManagerWithDatabase {

    private booksManager: BooksManager

    constructor(public readonly databasePath: string) {
        const data = readFromDatabase(databasePath)
        this.booksManager = new BooksManager({
            domain: data.domain,
            initialEntries: data.entries.map(databaseEntryToEntry),
        })
    }

    private writeToDatabase() {
        writeToDatabase(this.databasePath, {
            domain: this.booksManager.getDomain(),
            entries: this.booksManager.getEntries().map(entryToEntryDatabase),
        })
    }

    getDomain() {
        return this.booksManager.getDomain()
    }

    setDomain(domain: string) {
        this.booksManager.setDomain(domain)
        this.writeToDatabase()
    }

    getEntries() {
        return this.booksManager.getEntries()
    }

    add(query: ValidQuery) {
        const index = this.booksManager.add(query)
        this.writeToDatabase()
        return index
    }

    remove(indexes: number[]) {
        this.booksManager.remove(indexes)
        this.writeToDatabase()
    }

    update(options: BooksManagerUpdateOptions) {
        this.booksManager.update({
            indexes: options.indexes,
            onUpdate: (index, error) => {
                if (!error) {
                    this.writeToDatabase()
                }
                options.onUpdate?.(index, error)
            },
            onAllUpdate: options.onAllUpdate,
        })
    }

    read(indexes: number[]) {
        this.booksManager.read(indexes)
        this.writeToDatabase()
    }

    sort() {
        this.booksManager.sort()
        this.writeToDatabase()
    }

}
