var QueuedLoader = function(loader) {  
  this.loadingStart = 0
  this.loader = null
  this.loadQueue = []
  this.loaded = []
  this.onResourceLoad = []
  this.onCompleteCallback = function() {}
  this.onLoadCallback = function() {}

  this.busy = false
}

QueuedLoader.prototype = {
  init : function (loader,callback) {
    this.loader = loader
    if(callback) this.onLoadCallback = callback
    
    this.loader.onStart.add(applyWrapper(this.onStart,this))
    this.loader.onLoad.add(applyWrapper(this.onLoad,this))
    this.loader.onComplete.add(applyWrapper(this.onComplete,this))

    this.load()
  },
  markAsLoaded : function(alias) {
    this.loaded[alias] = true
  },
  isLoaded : function(alias) {
    if(!this.loaded[alias]) return false
    return this.loaded[alias]
  },
  addDirectly : function(alias,path) {
    this.loader.add(alias,path)//this.tilename(z,x,y),this.filename(z,x,y))
  },
  add : function(alias,filename,callback) {
    if(!this.isLoaded(alias) && !PIXI.loader.resources[alias]) {
      this.markAsLoaded(alias)
      this.onResourceLoad[alias] = callback
      if(this.busy) this.loadQueue.push([alias,filename])
      else this.addDirectly(alias,filename)
    }
  },
  addBulk : function(r) {
    r.forEach(applyWrapper(function(v) {
      this.addDirectly(v[0],v[1])
    },this))
  },
  load : function () {
    if(this.busy) return
    this.loadingStart = Date.now()
    this.loader.load()
  },
  onStart : function () {
    this.busy = true
  },
  onComplete : function () {
    this.busy = false
    this.onCompleteCallback()
    if(this.loadQueue.length>0) {
      this.addBulk(this.loadQueue)
      this.loadQueue = []
      this.load()
    }
  },
  onLoad : function (loader,resource) {
    console.log("onLoad"  )
    //console.log("Loaded "+resource.name+", time spent "+(Date.now() - this.loadingStart)+"ms")
    this.onLoadCallback()
    var callback = this.onResourceLoad[resource.name]
    if(!callback) return
    callback(loader,resource)
  },
  getTexture : function(alias) {
    return this.loader.resources[alias].texture
  }
}