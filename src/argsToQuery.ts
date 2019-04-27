import {Parameter, parameters, Query} from './Query'

export class InvalidQueryArgsError extends Error {

    readonly queryArgs: string[]

    constructor(queryArgs: string[]) {
        super(`Invalid query args: ${queryArgs}.`)
        this.queryArgs = queryArgs
    }

}

export const argsToQuery = (args: string[]) => {
    if (!args.length) {
        throw new InvalidQueryArgsError(args)
    }
    let query = Query()
    let parameter: Parameter | undefined
    for (const arg of args) {
        if (arg[0] === '-') {
            const option = arg.slice(1)
            if (option.length !== 1) {
                throw new InvalidQueryArgsError(args)
            }
            parameter = parameters.find(parameter => parameter[0] === option)
            if (!parameter) {
                throw new InvalidQueryArgsError(args)
            }
        } else {
            if (!parameter) {
                throw new InvalidQueryArgsError(args)
            }
            const terms = query[parameter]
            query = query.set(parameter, terms.push(arg))
        }
    }
    return query
}