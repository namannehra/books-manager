import {Record, RecordOf} from 'immutable';

export type BookProps = {
    id: string,
    name: string,
}

export const Book = Record({
    id: '',
    name: '',
})

export type BookType = RecordOf<BookProps>