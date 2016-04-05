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
            var config = this.getDbConfig()
            var dbName = config.dbName
            var indexList = config.indexList

            //create db instance, throw error if no db name is given
            if((typeof  dbName === 'string') && (dbName.length > 0)) {
                this.db = new PouchDB(dbName)
                this._find(this.getFind())
            }else{
                console.error(new Error('slot "config" needs to have non empty string property "dbName"'))
                return
            }

            this._enableChangesListener(true)

            //create db index if there is a value provided in input slot "index"
            if (indexList) {
                this._createIndex(indexList)
            }

            //synchronize from remotedb if any is given
            this._synchronizeDataFromCloud()
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
                    console.error('error while creating index: ', err)
                })
            })

        },

        /**
         * Sync local database with remote couchDB
         * @private
         */
        _synchronizeDataFromCloud : function() {
            var config = this.getDbConfig()
            if (_.has(config, 'replication.source') && config.replication.source.length > 0) {
                var remoteDBUrl = config.replication.source
                var options = config.replication.options || {}
                var suppressChanges = config.replication.suppressChanges || true
                var remoteDB = new PouchDB(remoteDBUrl)
                var localDB = this.db
                var self = this

                //if there is the changes flag set to true disable changesListener
                if (suppressChanges) {
                    this._disableChangesListener()
                }

                _.merge(options, {ajax : {withCredentials:false}})

                localDB.replicate.from(remoteDB, options).on('complete', function() {
                    self._find(self.getFind())
                    self._enableChangesListener()
                }).on('error', function(err) {
                    self._enableChangesListener()
                    console.error('error replicating remote db: ', err)
                })
            } else {
                console.error(
                    new Error('slot "dbConfig" needs to have string property "replication.source" for replicating data')
                )
            }
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

        /**
         * Enable changes listener. This will set the output slot "resultData" each time a change in the db occurs
         * @param {boolean} force If true destroy existing listener
         * @private
         */
        _enableChangesListener : function(force) {
            var self = this
            force = force || false

            //check, if there is already a changes listener applied
            if (this.changes && !force) {
                console.warn('There is already a changes listener applied')
                return
            } else if (this.changes && force) {
                this._disableChangesListener()
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

            this.changes = changes
        },

        /**
         * Disable canges listener
         * @private
         */
        _disableChangesListener : function() {
            if (this.changes) {
                this.changes.cancel()
                this.changes = null
            }
        }


    });
}());
