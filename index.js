'use strict'

const url = require('url')
const BooksManager = require('./BooksManager')

const booksManager = new BooksManager(__dirname + '/config')

const command = process.argv[2]
let validCommand = false

const getQuery = number => Object.keys(booksManager.queries)[Number(number) - 1]

if (command === 'domain') {
    validCommand = true
    const domain = process.argv[3]
    if (domain) {
        booksManager.domain = domain
    } else {
        console.log(booksManager.domain)
    }
}

if (command === 'add') {
    const query = process.argv[3]
    if (query) {
        validCommand = true
        booksManager.add(query)
    }
}

if (command === 'list') {
    validCommand = true
    Object.keys(booksManager.queries).forEach((query, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${query}`)
    })
}

if (command === 'remove') {
    const query = getQuery(process.argv[3])
    if (query) {
        validCommand = true
        booksManager.remove(query)
    }
}

if (command === 'update') {
    validCommand = true
    ;(async () => {
        console.log()
        let number = 1
        for await (const [query, lastBook] of booksManager.update()) {
            const link = url.parse(`https://${booksManager.domain}/search/?q=${query}`).href
            console.log(`${number.toString().padStart(2)}. ${query} - ${link}`)
            if (lastBook) {
                console.log((lastBook.read ? '' : 'UNREAD - ') + lastBook.title)
            } else {
                console.log('No results')
            }
            console.log()
            number++
        }
    })()
}

if (command === 'read') {
    validCommand = true
    for (const number of process.argv.slice(3)) {
        const query = getQuery(number)
        if (query) {
            booksManager.read(query)
        }
    }
}

if (!validCommand) {
    console.error('Invalid command')
}