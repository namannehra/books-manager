#!/usr/bin/env node

import cliTruncate from 'cli-truncate'
import os from 'os'
import path from 'path'

import {argsToQuery, InvalidQueryArgsError} from './argsToQuery'
import {
    BooksManager,
    EntryType,
    QueryAlreadyPresentError,
    NoBooksForEntryError,
    NoDomainError,
    NoEntryAtIndexError,
    StatusCodeError,
} from './BooksManager'
import {printInverse} from './printInverse'
import {EmptyQueryError, InvalidTermError, queryToString, queryToQueryString, ValidQuery} from './Query'
import {taskQueue} from './taskQueue'

const booksManager = new BooksManager(path.resolve(os.homedir(), 'books-manager.json'))
const command = process.argv[2]
let validCommand = false

const printEntry = (number: number, entry: EntryType) => {
    const {query} = entry
    const url = `https://${booksManager.domain}/search/?q=${queryToQueryString(query)}`
    process.stdout.write(`${number.toString().padStart(2)}. ${queryToString(query)} - ${url}`)
    const {unreadCount} = entry
    if (unreadCount) {
        process.stdout.write(' ')
        printInverse(unreadCount === 25 ? '25+' : unreadCount)
    }
    console.log()
}

const printEntryAndBooks = (number: number, entry: EntryType) => {
    printEntry(number, entry)
    const {unreadBooks} = entry
    if (entry.unreadCount === unreadBooks.size) {
        for (const book of unreadBooks) {
            const url = `https://${booksManager.domain}/g/${book.id}/`
            const name = cliTruncate(book.name, process.stdout.columns as number - url.length - 6)
            console.log(' | ' + name + ' - ' + url)
        }
    }
    console.log()
}

const handleUpdateError = (number: number, entry: EntryType, error: Error) => {
    printEntry(number, entry)
    // @ts-ignore
    if (error.code === 'ERR_INVALID_DOMAIN_NAME') {
        console.error('Invalid domain.')
    // @ts-ignore
    } else if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND') {
        console.error('Incorrect domain or network error.')
    } else if ([NoBooksForEntryError, NoDomainError, StatusCodeError].find(Error => error instanceof Error)) {
        console.error(error.message)
    } else {
        throw error
    }
}

if (command === 'domain') {
    validCommand = true
    const domain = process.argv[3]
    if (domain) {
        booksManager.domain = domain
    } else {
        console.log(booksManager.domain || new NoDomainError().message)
    }
}

if (command === 'list') {
    validCommand = true
    console.log()
    booksManager.getEntries().forEach((entry, index) => {
        printEntryAndBooks(index + 1, entry)
    })
}

if (command === 'add') {
    validCommand = true
    let query: ValidQuery
    try {
        query = new ValidQuery(argsToQuery(process.argv.slice(3)))
        const [index, entry] = booksManager.add(query)
        booksManager.update([index], (index, entry) => {
            printEntryAndBooks(index + 1, entry)
        }, (index, error) => {
            handleUpdateError(index + 1, entry, error)
        })
    } catch (error) {
        if ([EmptyQueryError, InvalidQueryArgsError, InvalidTermError].find(
            Error => error instanceof Error
        )) {
            console.error(error.message)
        } else if (error instanceof QueryAlreadyPresentError) {
            const entries = booksManager.getEntries()
            const index = entries.findIndex(entry => entry.query.equals(query))
            printEntry(index + 1, entries[index])
            console.log(error.message)
        } else {
            throw error
        }
    }
}

if (command === 'remove') {
    const number = Number(process.argv[3])
    if (number) {
        validCommand = true
        try {
            booksManager.remove(number - 1)
        } catch (error) {
            if (error instanceof NoEntryAtIndexError) {
                console.error(error.message)
            } else {
                throw error
            }
        }
    }
}

if (command === 'update') {
    validCommand = true
    const numberArgs = process.argv.slice(3)
    const entries = booksManager.getEntries()
    const indexes = numberArgs.length ? numberArgs.map(number => Number(number) - 1) : entries.map((_, index) => index)
    taskQueue(booksManager.update.bind(booksManager), indexes, (index, entry) => {
        printEntryAndBooks(index + 1, entry)
    }, (index, error) => {
        if (error instanceof NoEntryAtIndexError) {
            console.error(error.message)
        } else {
            handleUpdateError(index, entries[index], error)
        }
    })
}

if (command === 'read') {
    validCommand = true
    const numberArgs = process.argv.slice(3)
    const entries = booksManager.getEntries()
    const indexes = numberArgs.length ? numberArgs.map(number => Number(number) - 1) : entries.map((_, index) => index)
    for (const index of indexes) {
        try {
            booksManager.read(index)
        } catch (error) {
            if (error instanceof NoEntryAtIndexError) {
                console.error(error.message)
            } else {
                throw error
            }
        }
    }
}

if (command === 'sort') {
    validCommand = true
    booksManager.sort()
    console.log()
    booksManager.getEntries().forEach((entry, index) => {
        printEntryAndBooks(index + 1, entry)
    })
}

if (!validCommand) {
    console.error('Invalid command')
}