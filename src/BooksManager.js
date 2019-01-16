'use strict'

const JsonDb = require('node-json-db')

const getLatestBook = require('./getLatestBook')

class BooksManager {

    constructor(config) {
        this.config = new JsonDb(config, true, true)
    }

    get domain() {
        if (this.config.exists('/domain')) {
            return this.config.getData('/domain')
        }
        return ''
    }

    set domain(domain) {
        this.config.push('/domain', domain)
    }

    get queries() {
        if (this.config.exists('/queries')) {
            return this.config.getData('/queries')
        }
        return {}
    }

    add(query) {
        query = query.toLowerCase()
        if (this.queries[query] !== undefined) {
            throw new QueryAlreadyPresentError(query)
        }
        this.config.push(`/queries/${query}`, null)
    }

    remove(query) {
        if (this.queries[query] === undefined) {
            throw new QueryDoesNotExistError(query)
        }
        this.config.delete(`/queries/${query}`)
    }

    update(query) {
        if (this.queries[query] === undefined) {
            throw new QueryDoesNotExistError(query)
        }
        if (!this.domain) {
            return Promise.reject(new NoDomainError())
        }
        return getLatestBook(`https://${this.domain}/search/?q=${query}`).then(book => {
            if (!book) {
                return
            }
            const lastBook = this.queries[query] && this.queries[query].book
            if (book !== lastBook) {
                this.config.push(`/queries/${query}`, {
                    book,
                    read: false,
                })
            }
        })
    }

    read(query) {
        if (!this.queries[query]) {
            throw new QueryDoesNotExistError()
        }
        this.config.push(`/queries/${query}/read`, true)
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
BooksManager.StatusCodeError = getLatestBook.StatusCodeError

module.exports = BooksManager