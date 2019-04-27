# books-manager
Node app to check for new books based on search queries

## Install
```
yarn global add https://github.com/namannehra/books-manager
```

## Update
```
yarn global upgrade books-manager
```

**Warning:** Always backup the database file before updating. New versions may
not be compatible with old database. If app stops working after update then try
deleting the database file.

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


## Database file
Data is stored in `books-manager.json` at user's home directory.