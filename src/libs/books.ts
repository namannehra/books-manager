import { NetworkError, WrongStatusError } from '@libs/network-errors.ts'

export type Book = Readonly<{
    id: string
    name: string
}>

interface BooksResponse {
    result: {
        id: string | number
        title: {
            english: string
        }
    }[]
    num_pages: number
}

export interface FetchBooksResult {
    books: Book[]
    pagesCount: number
}

export const fetchBooks = async (url: string) => {
    let rawResponse = await fetch(url)
    try {
        rawResponse = await fetch(url)
    } catch (error) {
        throw new NetworkError(error)
    }
    if (!rawResponse.ok) {
        throw new WrongStatusError(rawResponse.status, rawResponse.statusText)
    }
    const response: BooksResponse = await rawResponse.json()
    const result: FetchBooksResult = {
        books: response.result.map(responseBook => ({
            id: responseBook.id.toString(),
            name: responseBook.title.english,
        })),
        pagesCount: response.num_pages,
    }
    return result
}
