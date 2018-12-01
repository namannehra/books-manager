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
    const book = getBook(query)
    if (book) {
        console.log(`${book.read ? 'READ' : 'UNREAD'} - ${book.title}`)
    } else {
        console.log('No results')
    }
    console.log()
}

const handleUpdateError = error => {
    if (error.code === 'ENOTFOUND') {
        console.error('Incorrect domain or network error')
        return
    }
    if (error instanceof BooksManager.NoDomainError) {
        console.log(error.message)
        return
    }
    if (error instanceof BooksManager.StatusCodeError || error instanceof BooksManager.ContentTypeError) {
        console.error(error.message)
        console.error('Check domain')
        return
    }
    throw error
}

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
        if (getBook(query) === undefined) {
            booksManager.add(query)
            booksManager.update(query).then(() => {
                console.log()
                printQuery(query)
            }).catch(handleUpdateError)
        } else {
            console.error('Query already present')
        }
    }
}

if (command === 'list') {
    validCommand = true
    console.log()
    for (const query of getQueries()) {
        printQuery(query)
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
    Promise.all(queriesToUpdate.map(query => booksManager.update(query))).then(() => {
        console.log()
        for (const query of queriesToUpdate) {
            printQuery(query)
        }
    }).catch(handleUpdateError)
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