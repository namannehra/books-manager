#!/usr/bin/env node
'use strict'

const cliTruncate = require('cli-truncate')
const os = require('os')
const path = require('path')
const url = require('url')

const BooksManager = require('./src/BooksManager')

const booksManager = new BooksManager(path.resolve(os.homedir(), 'books-manager'))

const command = process.argv[2]
let validCommand = false

const getQueriesArray = () => Object.keys(booksManager.queries)
const getQueryNumber = query => getQueriesArray().indexOf(query) + 1
const getQueryFromNumber = number => getQueriesArray()[Number(number) - 1]
const getQueryValue = query => booksManager.queries[query]

const printQuery = query => {
    const link = url.parse(`https://${booksManager.domain}/search/?q=${query}`).href
    console.log(`${getQueryNumber(query).toString().padStart(2)}. ${query} - ${link}`)
}

const printBook = query => {
    const queryValue = getQueryValue(query)
    if (queryValue) {
        const book = cliTruncate(queryValue.book, process.stdout.columns - (queryValue.read ? 7 : 9))
        process.stdout.write(`${queryValue.read ? 'READ' : '\x1b[7mUNREAD\x1b[0m'} - ${book}\n`)
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
    if (error.code === 'ERR_INVALID_DOMAIN_NAME') {
        console.error('Invalid domain')
    } else if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND') {
        console.error('Incorrect domain or network error')
    } else if (error instanceof BooksManager.NoDomainError || error instanceof BooksManager.StatusCodeError) {
        console.error(error.message)
    } else {
        throw error
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
    const query = process.argv[3].toLowerCase()
    if (query) {
        validCommand = true
        try {
            booksManager.add(query)
        } catch (error) {
            if (error instanceof BooksManager.QueryAlreadyPresentError) {
                console.error(error.message)
                return
            }
            throw error
        }
        console.log()
        booksManager.update(query).then(() => {
            printQueryAndBook(query)
        }).catch(error => {
            handleUpdateError(query, error)
        })
    }
}

if (command === 'list') {
    validCommand = true
    console.log()
    for (const query of getQueriesArray()) {
        printQueryAndBook(query)
    }
}

if (command === 'remove') {
    const number = process.argv[3]
    if (number) {
        validCommand = true
        const query = getQueryFromNumber(number)
        if (getQueryValue(query) === undefined) {
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
        getQueriesArray().filter(query => numbers.includes(getQueryNumber(query))) :
        getQueriesArray()
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
        getQueriesArray().filter(query => numbers.includes(getQueryNumber(query))) :
        getQueriesArray()
    for (const query of queriesToMark) {
        booksManager.read(query)
    }
}

if (!validCommand) {
    console.error('Invalid command')
}