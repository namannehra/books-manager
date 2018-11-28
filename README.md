# books-manager
A Node app to check for new books based on search queries

## Install
```
yarn global add https://github.com/namannehra/books-manager
```

## Commands

### `domain`
Get or set the domain of *books website*. Domain must be set before using the
app for the first time.
```
$ books-manager domain google.com

$ books-manager domain
google.com
```

### `add`
Add search query. Same as *books website*'s search.
```
$ books-manager add tag:glasses
$ books-manager add 'tag:"story arc" parody:"street fighter"'
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