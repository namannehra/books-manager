#!/usr/bin/env node
'use strict'

const os = require('os')
const path = require('path')
const url = require('url')
const BooksManager = require('./BooksManager')

const booksManager = new BooksManager(path.resolve(os.homedir(), 'books-manager'))

const command = process.argv[2]
let validCommand = false

const getQueries = () => Object.keys(booksManager.queries)
const getQuery = number => getQueries()[Number(number) - 1]
const getQueryNumber = query => getQueries().indexOf(query) + 1
const getBook = query => booksManager.queries[query]

const printQuery = query => {
    const link = url.parse(`https://${booksManager.domain}/search/?q=${query}`).href
    console.log(`${getQueryNumber(query).toString().padStart(2)}. ${query} - ${link}`)
}

const printBook = query => {
    const book = getBook(query)
    if (book) {
        console.log(`${book.read ? 'READ' : 'UNREAD'} - ${book.title}`)
    } else {
        console.log('No results')
    }
}

const printQueryAndBook = query => {
    printQuery(query)
    printBook(query)
    console.log()
}

const handleUpdateError = (query, error) => {
    printQuery(query)
    if (error.code === 'ENOTFOUND') {
        console.error('Incorrect domain or network error')
    } else if (error.statusCode === 404) {
        console.error(error.message)
        console.error('Check domain')
    } else if (['NoDomain', 'StatusCode', 'ContentType'].some(
        errorType => error instanceof BooksManager[errorType + 'Error']
    )) {
        console.error(error.message)
    } else {
        console.error(error)
    }
    console.log()
}

if (command === 'domain') {
    validCommand = true
    const domain = process.argv[3]
    if (domain) {
        booksManager.domain = domain
    } else {
        console.log(booksManager.domain || 'Domain not set')
    }
}

if (command === 'add') {
    const query = process.argv[3]
    if (query) {
        validCommand = true
        console.log()
        if (getBook(query) === undefined) {
            booksManager.add(query)
            booksManager.update(query).then(() => {
                printQueryAndBook(query)
            }).catch(error => {
                handleUpdateError(query, error)
            })
        } else {
            console.error('Query already present')
            console.log()
        }
    }
}

if (command === 'list') {
    validCommand = true
    console.log()
    for (const query of getQueries()) {
        printQueryAndBook(query)
    }
}

if (command === 'remove') {
    const number = process.argv[3]
    if (number) {
        validCommand = true
        const query = getQuery(number)
        if (getBook(query) === undefined) {
            console.error('No query at number ' + number)
        } else {
            booksManager.remove(query)
        }
    }
}

if (command === 'update') {
    validCommand = true
    const numbers = process.argv.slice(3).map(number => Number(number))
    const queriesToUpdate = numbers.length ?
        getQueries().filter(query => numbers.includes(getQueryNumber(query))) :
        getQueries()
    ;(async () => {
        console.log()
        for (const query of queriesToUpdate) {
            try {
                await booksManager.update(query)
                printQueryAndBook(query)
            } catch (error) {
                handleUpdateError(query, error)
            }
        }
    })()
}

if (command === 'read') {
    validCommand = true
    const numbers = process.argv.slice(3).map(number => Number(number))
    const queriesToMark = numbers.length ?
        getQueries().filter(query => numbers.includes(getQueryNumber(query))) :
        getQueries()
    for (const query of queriesToMark) {
        booksManager.read(query)
    }
}

if (!validCommand) {
    console.error('Invalid command')
}