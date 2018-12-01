'use strict'

const https = require('https')
const JsonDb = require('node-json-db')

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
        this.config.push(`/queries/${query}`, null)
    }

    remove(query) {
        this.config.delete(`/queries/${query}`)
    }

    update(query) {
        return new Promise((resolve, reject) => {
            if (!this.domain) {
                reject(new NoDomainError())
                return
            }
            https.get(`https://${this.domain}/api/galleries/search?query=${query}`, response => {
                const {statusCode} = response
                if (statusCode !== 200) {
                    reject(new StatusCodeError(statusCode))
                    return
                }
                const contentType = response.headers['content-type']
                if (contentType !== 'application/json') {
                    reject(new ContentTypeError(contentType))
                    return
                }
                let data = ''
                response.on('data', chunk => {
                    data += chunk
                })
                response.on('end', () => {
                    const latestBook = JSON.parse(data).result[0]
                    const lastBook = this.queries[query]
                    if (latestBook && (!lastBook || latestBook.id !== lastBook.id)) {
                        this.config.push(`/queries/${query}`, {
                            id: latestBook.id,
                            /* Don't know if english title is always present */
                            title: latestBook.title.english || latestBook.title.pretty,
                            read: false,
                        })
                    }
                    resolve()
                })
            }).on('error', (error) => {
                reject(error)
            })
        })
    }

    read(query) {
        this.config.push(`/queries/${query}/read`, true)
    }

}

class NoDomainError extends Error {

    constructor() {
        super('No domain set')
    }

}

class StatusCodeError extends Error {

    constructor(statusCode) {
        super('Wrong status code: ' + statusCode)
        this.statusCode = statusCode
    }

}

class ContentTypeError extends Error {

    constructor(contentType) {
        super('Wrong content type: ' + contentType)
        this.contentType = contentType
    }

}

BooksManager.NoDomainError = NoDomainError
BooksManager.StatusCodeError = StatusCodeError
BooksManager.ContentTypeError = ContentTypeError

module.exports = BooksManager