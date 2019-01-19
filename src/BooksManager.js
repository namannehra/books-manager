'use strict'

const JsonDb = require('node-json-db')

const getBooks = require('./getBooks')

class BooksManager {

    constructor(config) {
        this.config = new JsonDb(config, true, true)
    }

    get domain() {
        return this.config.exists('/domain') ? this.config.getData('/domain') : ''
    }

    set domain(domain) {
        this.config.push('/domain', domain)
    }

    get booksToShow() {
        return this.config.exists('/booksToShow') ? this.config.getData('/booksToShow') : 3
    }

    set booksToShow(booksToShow) {
        this.config.push('/booksToShow', booksToShow)
    }

    get queries() {
        return this.config.exists('/queries') ? this.config.getData('/queries') : {}
    }

    add(query) {
        if (this.config.exists('/queries/' + query)) {
            throw new QueryAlreadyPresentError(query)
        }
        this.config.push('/queries/' + query, {
            unreadCount: 0,
            unreadBooks: [],
            lastBookRead: null,
        })
    }

    remove(query) {
        if (!this.config.exists('/queries/' + query)) {
            throw new QueryDoesNotExistError(query)
        }
        this.config.delete('/queries/' + query)
    }

    async update(query) {
        if (!this.config.exists('/queries/' + query)) {
            throw new QueryDoesNotExistError(query)
        }
        if (!this.domain) {
            throw new NoDomainError()
        }
        const unreadBooks = []
        for (const book of await getBooks(`https://${this.domain}/search/?q=${query}`)) {
            if (this.queries[query].lastBookRead && book.id === this.queries[query].lastBookRead.id) {
                break
            }
            unreadBooks.push(book)
        }
        this.config.push('/queries/' + query, {
            unreadCount: unreadBooks.length,
            unreadBooks: unreadBooks.slice(0, this.booksToShow),
        })
    }

    read(query) {
        if (!this.config.exists('/queries/' + query)) {
            throw new QueryDoesNotExistError()
        }
        this.config.push('/queries/' + query, {
            unreadCount: 0,
            unreadBooks: [],
            lastBookRead: this.queries[query].unreadBooks[0] || null,
        })
    }

}

class QueryAlreadyPresentError extends Error {

    constructor(query) {
        super(`Query already present. query: ${query}.`)
        this.query = query
    }

}

class QueryDoesNotExistError extends Error {

    constructor(query) {
        super(`Query does not exist. query: ${query}.`)
        this.query = query
    }

}

class NoDomainError extends Error {

    constructor() {
        super('Domain not set.')
    }

}

BooksManager.QueryAlreadyPresentError = QueryAlreadyPresentError
BooksManager.QueryDoesNotExistError = QueryDoesNotExistError
BooksManager.NoDomainError = NoDomainError
BooksManager.StatusCodeError = getBooks.StatusCodeError

module.exports = BooksManager