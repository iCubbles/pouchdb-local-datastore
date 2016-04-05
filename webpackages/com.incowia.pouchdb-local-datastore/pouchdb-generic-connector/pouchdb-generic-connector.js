(function() {
    'use strict'
    /**
     * Get help:
     * > Lifecycle callbacks:
     * https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#lifecycle-callbacks
     *
     * Access the Cubbles-Component-Model:
     * > Access slot values:
     * slot 'a': this.getA(); | this.setA(value)
     */
    CubxPolymer({
        is: 'pouchdb-generic-connector',

        _cubxReady : false,

        /**
         * Manipulate an element’s local DOM when the element is constructed.
         */
        ready: function() {
            this._init()
        },

        modelIndexChanged: function(newValue) {

        },

        modelFindChanged : function(newValue) {
            if(this._cubxReady){
                this._find(newValue)
            }
        },

        modelDbConfigChanged : function(newValue) {
            if(this._cubxReady) {
                this._init()
            }
        },

        modelBulkDocsChanged: function(newValue) {
            //slot provides interface for batch operations
            //see http://pouchdb.com/api.html#batch_create
            if(this._cubxReady) {
                this.db.bulkDocs(newValue)
            }
        },

        cubxReady : function() {
            //set _cubxReady flag to true
            this._cubxReady = true
        },

        /**
         * Connect to local pouchDB or create new if no one exists
         * @private
         */
        _init : function() {
            var self = this
            var dbName = this.getDbConfig().dbName
            var remotedbName = this.getDbConfig().remotedb
            var indexList = this.getDbConfig().indexList

            //create db instance, throw error if no db name is given
            if((typeof  dbName === 'string') && (dbName.length > 0)) {
                this.db = new PouchDB(dbName)
                this._find(self.getFind())
            }else{
                console.error(new TypeError('slot "config" needs to have non empty string property "dbName"'))
                return
            }

            //register changes listener to set output slot "resultData" after every change
            var changes = this.db.changes({
                since : 'now',
                live : true,
                include_docs : false
            })
            changes.on('change', function(change){
                console.log('change on database docs detected.', change)
                //set output slot "resultData" with new data
                self._find(self.getFind())
            })

            //create db index if there is a value provided in input slot "index"
            if (indexList) {
                this._createIndex(indexList)
            }

            //synchronize from remotedb if any is given
            if(remotedbName && remotedbName.length > 0) {
                var remoteDb = new PouchDB(remotedbName, {ajax : {withCredentials:false}})
                this.db.replicate.from(remoteDb).on('error', function(err){
                    console.error('failed to replicate from remotedb: ', err)
                })
            }
        },

        /**
         * Create list of indexes using pouchDB-find API
         * see https://github.com/nolanlawson/pouchdb-find
         * @param {object} indexList List of indexes
         * @private
         */
        _createIndex : function(indexList) {
            var db = this.db

            _.forEach(indexList, function(index) {
                db.createIndex({index: index}).then(function(result) {
                    console.log('index created: ', result)
                }).catch(function(err){
                    console.log('error while creating index: ', err)
                })
            })

        },

        /**
         * Sync local database with remote couchDB
         * @private
         */
        _synchronizeDataFromCloud : function() {
            var remoteDBUrl = this.getDbConfig().remotedb
            var remoteDB = new PouchDB(remoteDBUrl)
            var localDB = this.db
            var self = this

            localDB.replicate.from(remoteDB).on('complete', function() {
                self._find(self.getFind())
            }).on('error', function(err) {
                console.log('error replicating remote db: ', err)
            })
        },

        /**
         * Query pouchDB by using the find API of pouchdb-find plugin
         * see https://github.com/nolanlawson/pouchdb-find
         * @param {object} query
         * @private
         */
        _find : function(query) {
            var db = this.db
            var self = this
            var findQuery = query || {selector: {_id:""}}
            console.log(findQuery)

            db.find(findQuery).then(function(result) {
                self.setResultData(result.docs)
            }).catch(function(err) {
                console.log('error while running find query: ', err)
            })
        },

    });
}());
