import https from 'https'
import {List, Record, RecordOf} from 'immutable'

import {Book, BookType} from './Book'

export class StatusCodeError extends Error {

    readonly statusCode?: number

    constructor(statusCode?: number) {
        super(`Wrong status code. Expected 200. Found ${statusCode}.`)
        this.statusCode = statusCode
    }

}

type ApiResult = {
    result: {
        id: string | number,
        title: {
            english: string,
        },
    }[],
    num_pages: number,
}

type ResultProps = {
    books: List<BookType>
    totalPages: number
}

const Result = Record({
    books: List(),
    totalPages: 0,
} as ResultProps)

export type ResultType = RecordOf<ResultProps>

export const getBooks = (url: string): Promise<ResultType> => new Promise((resolve, reject) => {
    https.get(url, response => {
        const {statusCode} = response
        if (statusCode !== 200) {
            response.destroy()
            reject(new StatusCodeError(statusCode))
            return
        }
        let body = ''
        response.on('data', data => {
            body += data
        })
        response.on('end', () => {
            const apiResult: ApiResult = JSON.parse(body)
            const result = Result({
                books: List(apiResult.result.map(book => Book({
                    id: book.id.toString(),
                    name: book.title.english,
                }))),
                totalPages: apiResult.num_pages,
            })
            resolve(result)
        })
    })
})