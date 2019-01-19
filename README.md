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
Get or set the maximum number of unread books to show. If number of unread books
is less or equal then name and link of each unread books will also be shown.
Otherwise only link to query page will be shown. Default: `3`.

### `add`
Add search query. Same as *books website*'s search.
```
$ books-manager add tag:glasses
```

Terms can be grouped using underscore. The following will add
`tag:"story arc" parody:"street fighter"`
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

## Database file
Data is stored in `books-manager.json` at user's home directory.