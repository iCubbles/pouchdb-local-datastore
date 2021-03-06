# com.incowia.pouchdb-local-datastore

This webpackage contains components for dealing with local data inside the browser using a couchdb like document based database called pouchdb.
With that it is possible to persist data in a users local browser or even replicate data from a remote datasource that provides
the couchdb http interface.

## pouchdb-generic-connector

This component provides capability to create a local pouchdb database (or use an existing one). It's possible to add, edit, delete and of course read documents
from the connected database. It's also possible to replicate data from another (remote) database.

### input slots
#### dbConfig
Configuration of Database Connection

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
                "type": "object",
                "properties" : {
                    "source": {
                        "description": "Url of a remote database to replicate from",
                        "type": "string"
                    },
                    "options": {
                        "description": "Options for replication according to https://pouchdb.com/api.html#replication",
                        "type": "object"
                    },
                    "suppressChanges": {
                        "description": "If true changes listener will be suppress during replication. Defaults to true",
                        "type": "boolean"
                    }
                },
                "required": [
                    "source"
                ]
            },
            "indexList": {
                "type": "array",
                "items": {
                    "title": "index",
                    "description": "Object according to 'index' parameter in https://github.com/nolanlawson/pouchdb-find#dbdeleteindexindex--callback",
                    "type": "object"
                }
            },
            "removeExisting": {
                "type": "boolean",
                "description": "Recreate local PouchDB with given name instead of using existing one. This ensures that there is always a clean and empty DB on startup. Defaults to false"
            }
        },
        "required" : [
            "dbName"
        ]
    }

#### find
Used for setting a selector which affects value that output slot `resultData` holds. Note: inside the selector you can only
reference fields for which an index is created using `indexList` array in `dbConfig` slot.

    {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "json schema for slot find",
        "type": "object",
        "description": "Object according to 'request' parameter in https://github.com/nolanlawson/pouchdb-find#dbfindrequest--callback"
    }

#### bulkDocs
Used to add, edit and delete documents in the connected database.

    {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "json schema for slot bulkDocs",
        "type": "object",
        "description": "Object according to 'docs' parameter in https://pouchdb.com/api.html#batch_create"
    }

### output slots
#### resultData
Holds a filtered list of documents stored in the associated local pouch database. The filter is set via input slot `find`.
If there is no filter set all documents are contained (including `_design` documents). If there is a modification on the
internal data or the `find` slot value is set `resultData` slot updates immediately.

    {
        "$schema": "http://json-schema.org/draft-04/schema#,
        "title": "json schema for slot resultData",
        "type": "array",
        "items": {
            "title": "document",
            "description": "A document from the associated local pouch database",
            "type": "object"
        }
    }

#### status
Holds the curent internal status of component.

    {
        "$schema": "http://json-schema.org/draft-04/schema#,
        "title": "json schema for slot status",
        "type": {
            "enum": ["idle", "pending", "error", "replicating"]
        }
    }
