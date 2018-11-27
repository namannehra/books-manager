'use strict'

const https = require('https')
const JsonDb = require('node-json-db')

class BooksManager {

    constructor(config) {
        this.config = new JsonDb(config, true, true)
    }

    get domain() {
        return this.config.getData('/domain')
    }

    set domain(domain) {
        this.config.push('/domain', domain)
    }

    get queries() {
        return this.config.getData('/queries')
    }

    add(query) {
        this.config.push(`/queries/${query}`, null)
    }

    remove(query) {
        this.config.delete(`/queries/${query}`)
    }

    read(query) {
        this.config.push(`/queries/${query}/read`, false)
    }

    async *update() {
        for (const [query, lastBook] of Object.entries(this.queries)) {
            const response = await new Promise(resolve => {
                https.get(`https://${this.domain}/api/galleries/search?query=${query}`, response => {
                    let data = ''
                    response.on('data', chunk => {
                        data += chunk
                    })
                    response.on('end', () => {
                        resolve(JSON.parse(data))
                    })
                })
            })
            const latestBook = response.result[0]
            if (latestBook && (!lastBook || latestBook.id !== lastBook.id)) {
                this.config.push(`/queries/${query}`, {
                    id: latestBook.id,
                    title: latestBook.title.pretty,
                    read: false,
                })
            }
            yield [query, this.config.getData(`/queries/${query}`)]
        }
    }

}

module.exports = BooksManager