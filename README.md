# books-manager

Deno script to check for new books

## Install

1. Install [Deno](https://deno.land)

2. Create alias `books-manager` for:

    ```
    deno run --unstable --allow-all --importmap=https://raw.githubusercontent.com/namannehra/books-manager/master/import-map.json https://raw.githubusercontent.com/namannehra/books-manager/master/cli.ts
    ```

## Database location

Location of database is set by `BOOKS_MANAGER_DATABASE` variable. Default is
`books-manager.json` in home directory.

## Update

**Warning:** Always backup the database file before updating. New version may
not be compatible with the old database. If books-manager stops working after
update then you may have to delete the database file.

```
deno cache --unstable --reload --importmap=https://raw.githubusercontent.com/namannehra/books-manager/master/import-map.json https://raw.githubusercontent.com/namannehra/books-manager/master/cli.ts
```

## Commands

### `domain [<domain>]`
Get or set the domain of *books website*. Domain must be set before using the
app for the first time.
```
$ books-manager domain google.com
$ books-manager domain
google.com
```

### `add`
Add entry.

| Option | Query parameter |
|--------|-----------------|
| `-a`   | artists         |
| `-c`   | characters      |
| `-g`   | groups          |
| `-l`   | languages       |
| `-p`   | parodies        |
| `-t`   | tags            |
```
$ books-manager add -t "story arc" military -l english
```

### `list`
List entries.
```
$ books-manager list
```

### `remove <number>`
Remove entry.
```
$ books-manager remove 1
```

### `update [<number1> <number2> ...]`
Update entries. If used without numbers then update all entries.
```
$ books-manager update 1 2 3
$ books-manager update
```

### `read [<number1> <number2> ...]`
Mark the last books of search entry as read. If used without numbers then mark
last books of all queries as read.
```
$ books-manager read 1 2 3
$ books-manager read
```

### `sort`
Sort entries based on total books.

## Output
Output is displayed in following format.
```
<number>. <query> - <link> <unread-count>
 | <unread-book-1-name> - <unread-book-1-link>
 | <unread-book-2-name> - <unread-book-2-link>
 | <unread-book-2-name> - <unread-book-2-link>
```
- `<unread-count>` is not shown if it's zero.
- Unread books are not shown if `<unread-count>` is greater than 3.
