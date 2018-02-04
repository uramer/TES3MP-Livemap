var TileLoader = function (map) {
  
  this.TILES_URL = "tiles/webp/"
  this.EXTENSION = ".webp"
  this.TILE_RESOLUTION = 256 //resolution of a square tile
  this.PRELOAD_ZOOM = 11

  this.map = map
  this.progressBar = new ProgressScene()
  
  this.loadingStart = 0
  this.loadedZoom = 0
  this.loadingZoom = 0
  
  this.loadQueue = []
  this.loaded = []

  this.busy = false
}

TileLoader.prototype = {
  init : function () {
    var map = this.map

    for(var i=this.map.zoomHandler.MIN_ZOOM;i<=this.map.zoomHandler.MAX_ZOOM;i++) {
      this.loaded[i] = [] //initializing the queue
    }

    /// loading the tileset
    for(var i=map.zoomHandler.MIN_ZOOM;i<=this.PRELOAD_ZOOM;i++) {
      
      var zoom_size = map.zoomHandler.getTileCount(i)
      for(var x = 0;x<zoom_size;x++) {
        for(var y = 0;y<zoom_size;y++) {
          this.add(i,x,y) 
        }
      }
    }

    //setting up loading bar
    this.progressBar.draw(map.app)
    
    PIXI.loader.onStart.add(applyWrapper(this.onStart,this))
    PIXI.loader.onLoad.add(applyWrapper(this.onLoad,this))
    PIXI.loader.onComplete.add(applyWrapper(this.onComplete,this))

    this.load()
  },
  markAsLoaded : function(z,x,y) {
    if(!this.loaded[z][x]) this.loaded[z][x] = []
    this.loaded[z][x][y] = true
  },
  isLoaded : function(z,x,y) {
    if(!this.loaded[z][x]) return false
    return this.loaded[z][x][y]
  },
  addDirectly : function(z,x,y) {
    PIXI.loader.add(this.tilename(z,x,y),this.filename(z,x,y))
  },
  add : function(z,x,y) {
    if(!this.isLoaded(z,x,y) && !PIXI.loader.resources[this.tilename(z,x,y)]) {
      this.markAsLoaded(z,x,y)
      this.progressBar.update(1)
      if(this.busy) this.loadQueue.push([z,x,y])
      else this.addDirectly(z,x,y)
    }
  },
  addBulk : function(r) {
    r.forEach(applyWrapper(function(v) {
      this.addDirectly(v[0],v[1],v[2])
    },this))
  },
  load : function () {
    if(this.busy) return
    this.loadingStart = Date.now()
    PIXI.loader.load()
  },
  tilename : function(zoom,x,y) { //name used to store the tile in PIXI.loader
    return ""+zoom+"_"+x+"_"+y
  },
  filename : function(zoom,x,y) {
    return this.TILES_URL+zoom+"/map_"+x+"_"+y+this.EXTENSION
  },
  onStart : function () {
    this.busy = true
  },
  onComplete : function () {
    this.busy = false
    if(this.loadQueue.length>0) {
      this.addBulk(this.loadQueue)
      this.loadQueue = []
      this.load()
    }
  },
  onLoad : function (loader,resource) {
    //console.log("Loaded "+resource.name+", time spent "+(Date.now() - this.loadingStart)+"ms")
    var s = resource.name.split("_").map(function(v){
      return parseInt(v)
    })

    this.map.createContainer(s[0],s[1],s[2])

    this.progressBar.update(-1)
    
    this.map.allowRender = true
    this.map.render()
  },
  getTexture : function(z,x,y) {
    return PIXI.loader.resources[this.tilename(z,x,y)].texture
  }
}