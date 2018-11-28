# books-manager
A Node app to check for new books based on search queries

## Install
```
git clone https://github.com/namannehra/books-manager
cd books-manager
yarn install
```

## Commands

### `domain`
Get or set the domain of *books website*. Domain must be set before using the
app for the first time.
```
$ node index.js domain google.com

$ node index.js domain
google.com
```

### `add`
Add search query. Same as *books website*'s search.
```
$ node index.js add tag:glasses
$ node index.js add 'tag:"story arc" parody:"street fighter"'
```

### `list`
List added search queries.
```
$ node index.js list
```

### `remove`
Remove a search query.
```
$ node index.js remove 1
```

### `update`
Check for updates. If used without query numbers then all queries are updated.
```
$ node index.js update 1 2 3
$ node index.js update
```

### `read`
Mark the last books of search queries as read. If used without query numbers
then last books of all queries are marked read.
```
$ node index.js read 1 2 3
$ node index.js read
```

## Config file
Data is stored in `config.json` at the root of app directory.