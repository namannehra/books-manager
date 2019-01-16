'use strict'

const https = require('https')

const getText = url => new Promise((resolve, reject) => {
    https.get(url, response => {
        const {statusCode} = response
        if (statusCode !== 200) {
            reject(new StatusCodeError(statusCode))
            return
        }
        let text = ''
        response.on('data', data => {
            text += data
        })
        response.on('end', () => {
            resolve(text)
        })
    }).on('error', error => {
        reject(error)
    })
})

class StatusCodeError extends Error {

    constructor(statusCode) {
        super(`Wrong status code. Expected 200. Found: ${statusCode}.`)
        this.statusCode = statusCode
    }

}

getText.StatusCodeError = StatusCodeError

module.exports = getText