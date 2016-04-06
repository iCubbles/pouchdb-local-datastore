# com.incowia.pouchdb-local-datastore

This webpackage contains components for dealing with local data inside the browser using a couchdb like document based database called pouchdb.
With that it is possible to persist data in a users local browser or even replicate data from a remote datasource that provides
the couchdb http interface.

## pouchdb-generic-connector

This component provides capability to create a local pouchdb database (or use an existing one). It's possible to add, edit, delete and of course read documents
from the connected database. It's also possible to replicate data from another (remote) database.

### input slots
#### dbConfig


    {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "json schema for slot dbConfig",
        "type": "object",
        "properties": {
            "dbName": {
                "type": "string",
                "description" : "The name of the local pouchdb database to connect. If there is no database with such name a new one using the name will be created"
            },
            "replication": {

            },
            "indexList": {

            }
        },
        "required" : [
            "dbName"
        ]
    }

#### find

#### bulkDocs

### output slots
#### resultData