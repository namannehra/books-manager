'use strict'

const parseQuery = query => query.map(term =>
    term.split(':').map(group =>
        group.includes('_') ? `"${group.split('_').join(' ')}"` : group
    ).join(':')
).join(' ').toLowerCase()

module.exports = parseQuery