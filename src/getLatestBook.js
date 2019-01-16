'use strict'

const getText = require('./getText')

const beforeName = '<div class="caption">'
const afterName = '</div>'

const getLatestBook = url => getText(url).then(text => {
    const beforeNameIndex = text.indexOf(beforeName)
    if (beforeNameIndex === -1) {
        return ''
    }
    const nameIndex = beforeNameIndex + beforeName.length
    const afterNameIndex = text.indexOf(afterName, nameIndex)
    const name = text.slice(nameIndex, afterNameIndex)
    return name
})

getLatestBook.StatusCodeError = getText.StatusCodeError

module.exports = getLatestBook