'use strict'

const printInverse = string => {
    process.stdout.write(`\x1b[7m${string}\x1b[0m`)
}

module.exports = printInverse