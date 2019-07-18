import {Database, EntryType, QueryAlreadyPresentError, NoBooksForEntryError, NoEntryAtIndexError} from './Database'
import {getBooks, StatusCodeError} from './getBooks'
import {queryToQueryString, ValidQuery} from './Query'

export class NoDomainError extends Error {

    constructor() {
        super('Domain not set.')
    }

}

const maxParalledRequests = 4

export class BooksManager {

    private readonly database: Database

    constructor(location: string) {
        this.database = new Database(location)
    }

    get domain() {
        return this.database.domain
    }

    set domain(domain) {
        this.database.domain = domain
    }

    getEntries() {
        return this.database.getEntries()
    }

    add(query: ValidQuery) {
        return this.database.add(query)
    }

    private async updateOne(index: number) {
        const entry = this.database.getEntry(index)
        const query = entry.query
        const url = `https://${this.domain}/api/galleries/search?query=${queryToQueryString(query)}`
        return await getBooks(url).then(result => {
            const {lastBookRead} = entry
            let unreadCount = -1
            if (lastBookRead) {
                unreadCount = result.books.findIndex(book => book.id === lastBookRead.id)
            }
            if (unreadCount === -1) {
                unreadCount = result.books.size
            }
            return this.database.update(index, {
                totalPages: result.totalPages,
                unreadCount,
                unreadBooks: result.books.slice(0, Math.min(unreadCount, 3)),
            })
        })
    }

    async update(
        indexes: number[],
        callback?: (index: number, entry: EntryType) => void,
        errorCallback?: (index: number, error: Error) => void
    ) {
        const pending: Set<Promise<void>> = new Set()
        let next = () => {}
        for (const index of indexes) {
            if (pending.size === maxParalledRequests) {
                await new Promise(resolve => {
                    next = resolve
                })
            }
            const promise = this.updateOne(index).then(entry => {
                callback && callback(index, entry)
            }).catch(error => {
                errorCallback && errorCallback(index, error)
            }).finally(() => {
                pending.delete(promise)
                next()
            })
            pending.add(promise)
        }
        await Promise.all(Array.from(pending).map(promise => promise.catch(() => {})))
    }

    read(index: number) {
        return this.database.read(index)
    }

    remove(index: number) {
        return this.database.remove(index)
    }

    sort() {
        this.database.sort()
    }

}

export {EntryType, QueryAlreadyPresentError, NoBooksForEntryError, NoEntryAtIndexError, StatusCodeError}
