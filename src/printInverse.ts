const printInverse = (text: string | number) => {
    process.stdout.write(`\x1b[7m${text}\x1b[0m`)
}

export {printInverse}