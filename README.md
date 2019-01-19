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

**Warning:** Always backup the database file before updating. Newer versions may
not be compatible with old database.

If app stops working after update the try deleting the database file.

## Commands

### `domain`
Get or set the domain of *books website*. Domain must be set before using the
app for the first time.
```
$ books-manager domain google.com
$ books-manager domain
google.com
```

### `show-books`
Get or set the maximum number of unread books to show. Name and link of each
unread books will only be shown in output if number of unread books is less or
equal to `show-books`. Default: `3`.

### `add`
Add search query. Same as *books website*'s search.
```
$ books-manager add tag:glasses
```

Terms can be grouped using underscore. The following will add
`tag:"story arc" parody:"street fighter"`.
```
$ books-manager add tag:story_arc parody:street_fighter
```

### `list`
List added search queries.
```
$ books-manager list
```

### `remove`
Remove a search query.
```
$ books-manager remove 1
```

### `update`
Check for updates. If used without query numbers then all queries are updated.
```
$ books-manager update 1 2 3
$ books-manager update
```

### `read`
Mark the last books of search queries as read. If used without query numbers
then last books of all queries are marked read.
```
$ books-manager read 1 2 3
$ books-manager read
```

## Output
Output is displayed in following format.
```
<query-number>. <query-name> - <query-link> <unread-count>
 | <unread-book-1-name> - <unread-book-1-link>
 | <unread-book-2-name> - <unread-book-2-link>
 | <unread-book-2-name> - <unread-book-2-link>
```
- `<unread-count>` is not shown if it's zero.
- Unread books are not shown if `<unread-count>` is greater then `show-books`.


## Database file
Data is stored in `books-manager.json` at user's home directory.