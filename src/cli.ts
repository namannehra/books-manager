import { parse } from 'https://deno.land/std@0.54.0/flags/mod.ts'

import { databasePathVariable, defaultDatabasePath } from '@data/database.ts'
import { Entry } from '@libs/books-manager.ts'
import { BooksManagerWithDatabase } from '@libs/books-manager-with-database.ts'
import { getValidQuery, QueryKey, queryKeys, queryToQueryString, queryToString } from '@libs/query.ts'

const [command, ...commandOptions] = Deno.args

const databasePath = Deno.env.get(databasePathVariable) ?? defaultDatabasePath
const booksManager = new BooksManagerWithDatabase(databasePath)

const entryToTableEntry = (entry: Entry, index: number) => {
    const domain = booksManager.getDomain()
    if (!domain) {
        throw new Error('Domain not set')
    }
    let unreadCount
    if (entry.books.length) {
        const readBookIndex = entry.books.findIndex(book => book.id === entry.lastReadBookId)
        if (readBookIndex === -1)  {
            unreadCount = `${entry.books.length}+`
        } else {
            unreadCount = readBookIndex
        }
    } else {
        unreadCount = 0
    }
    return {
        number: index + 1,
        query: queryToString(entry.query),
        url: `https://${domain}/search/?q=${queryToQueryString(entry.query)}`,
        unread: unreadCount,
    }
}

let unknownCommand = true

if (command === 'domain') {
    unknownCommand = false
    const args = parse(commandOptions)
    const domain = args._[0] as string | number | undefined
    if (domain) {
        if (typeof domain !== 'string') {
            throw new Error('Invalid domain')
        }
        booksManager.setDomain(domain)
    } else {
        const domain = booksManager.getDomain()
        if (domain) {
            console.log(domain)
        } else {
            console.log('Domain not set')
        }
    }
}

if (command === 'add') {
    unknownCommand = false
    const args = parse(Deno.args.slice(1), {
        string: queryKeys,
        alias: {
            a: QueryKey.artists,
            c: QueryKey.characters,
            g: QueryKey.groups,
            l: QueryKey.languages,
            p: QueryKey.parodies,
            t: QueryKey.tags,
        },
    })
    const query = new Map<QueryKey, string[]>()
    for (const key of queryKeys) {
        let values = args[key] as string | string[] | undefined
        if (!values) {
            continue
        }
        if (typeof values === 'string') {
            values = [values]
        }
        query.set(key, values)
    }
    const validQuery = getValidQuery(query)
    const index = booksManager.add(validQuery)
    console.table([entryToTableEntry(booksManager.getEntries()[index], index)])
}

if (command === 'remove') {
    unknownCommand = false
    const args = parse(commandOptions)
    const numbers = args._ as number[]
    const indexes = numbers.map(number => number - 1)
    booksManager.remove(indexes)
}

if (command === 'list') {
    unknownCommand = false
    const args = parse(commandOptions, {
        boolean: 'unread',
        alias: {
            u: 'unread',
        },
    })
    const numbers = args._ as number[]
    let tableEntries = booksManager.getEntries().map(entryToTableEntry)
    if (numbers.length) {
        tableEntries = tableEntries.filter(entry => numbers.includes(entry.number))
    }
    if (args.unread) {
        tableEntries = tableEntries.filter(entry => entry.unread)
    }
    console.table(tableEntries)
}

if (command === 'update') {
    unknownCommand = false
    const args = parse(commandOptions)
    const numbers = args._ as number[]
    let indexes
    if (numbers.length) {
        indexes = numbers.map(number => number - 1)
    }
    booksManager.update({
        indexes,
        onUpdate: (index, error) => {
            if (error) {
                throw error
            }
            console.table([entryToTableEntry(booksManager.getEntries()[index], index)])
        },
    })
}

if (command === 'sort') {
    unknownCommand = false
    booksManager.sort()
    console.table(booksManager.getEntries().map(entryToTableEntry))
}

if (unknownCommand) {
    throw new Error('Unknown command')
}
