'use strict'

const https = require('https')
const htmlParser = require('htmlparser2')

const getBooks = url => new Promise((resolve, reject) => {
    https.get(url, response => {
        const {statusCode} = response
        if (statusCode !== 200) {
            response.destroy()
            reject(new StatusCodeError(statusCode))
            return
        }
        const books = []
        let lastHref
        let isName = false
        const parser = new htmlParser.Parser({
            onattribute(name, value) {
                if (name === 'href') {
                    lastHref = value
                } else if (name === 'class' && value === 'caption') {
                    isName = true
                }
            },
            ontext(text) {
                if (isName) {
                    isName = false
                    books.push({
                        id: lastHref.slice(3, -1),
                        name: text,
                    })
                }
            },
            onend() {
                resolve(books)
            }
        }, {
            lowerCaseTags: false,
        })
        response.pipe(parser)
    })
})

class StatusCodeError extends Error {

    constructor(statusCode) {
        super(`Wrong status code. Expected 200. Found: ${statusCode}.`)
        this.statusCode = statusCode
    }

}

getBooks.StatusCodeError = StatusCodeError

module.exports = getBooks