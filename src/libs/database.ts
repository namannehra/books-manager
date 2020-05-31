import { existsSync } from 'https://deno.land/std@0.54.0/fs/exists.ts'
import { readJsonSync } from 'https://deno.land/std@0.54.0/fs/read_json.ts'
import { writeJsonSync } from 'https://deno.land/std@0.54.0/fs/write_json.ts'

import { Book } from '@libs/books.ts'
import { QueryKey } from '@libs/query.ts'

export interface DatabaseQuery extends Readonly<{
    [key in QueryKey]?: readonly string[]
}> {}

export interface DatabaseEntry extends Readonly<{
    query: DatabaseQuery
    books: readonly Book[]
    pagesCount: number
    lastReadBookId?: string
}> {}

export interface DatabaseData extends Readonly<{
    domain?: string
    entries: readonly DatabaseEntry[]
}> {}

export const readFromDatabase = (path: string): DatabaseData => {
    if (!existsSync(path)) {
        return {
            entries: [],
        }
    }
    return readJsonSync(path) as DatabaseData
}

export const writeToDatabase = (path: string, data: DatabaseData) => {
    writeJsonSync(path, data, {
        spaces: 4,
    })
}
