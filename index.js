#!/usr/bin/env node
'use strict'

const cliTruncate = require('cli-truncate')
const os = require('os')
const path = require('path')
const url = require('url')

const BooksManager = require('./src/BooksManager')
const parseQuery = require('./src/parseQuery')
const printInverse = require('./src/printInverse')

const booksManager = new BooksManager(path.resolve(os.homedir(), 'books-manager'))

const command = process.argv[2]
let validCommand = false

const getQueriesArray = () => Object.keys(booksManager.queries)
const getQueryNumber = query => getQueriesArray().indexOf(query) + 1
const getQueryFromNumber = number => getQueriesArray()[number - 1]

const printQuery = query => {
    const {href} = url.parse(`https://${booksManager.domain}/search/?q=${query}`)
    process.stdout.write(`${getQueryNumber(query).toString().padStart(2)}. ${query} - ${href}`)
    const {unreadCount} = booksManager.queries[query]
    if (unreadCount) {
        process.stdout.write(' ')
        printInverse(unreadCount === 25 ? '25+' : unreadCount)
    }
    process.stdout.write('\n')
}

const printQueryAndUnreadBooks = query => {
    printQuery(query)
    const {unreadCount, unreadBooks} = booksManager.queries[query]
    if (unreadCount === unreadBooks.length) {
        for (const book of unreadBooks) {
            const href = `https://${booksManager.domain}/g/${book.id}/`
            const name = cliTruncate(book.name, process.stdout.columns - href.length - 6)
            console.log(' | ' + name + ' - ' + href)
        }
    }
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
    const query = parseQuery(process.argv.slice(3))
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
            printQueryAndUnreadBooks(query)
        }).catch(error => {
            handleUpdateError(query, error)
        })
    }
}

if (command === 'list') {
    validCommand = true
    console.log()
    for (const query of getQueriesArray()) {
        printQueryAndUnreadBooks(query)
    }
}

if (command === 'remove') {
    const number = Number(process.argv[3])
    if (number) {
        validCommand = true
        const query = getQueryFromNumber(number)
        try {
            booksManager.remove(query)
        } catch (error) {
            if (error instanceof BooksManager.QueryDoesNotExistError) {
                console.error(error.message)
                return
            }
            throw error
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
                printQueryAndUnreadBooks(query)
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