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
}

TileLoader.prototype = {
  init : function () {
    var map = this.map

    for(var i=this.map.zoomHandler.MIN_ZOOM;i<=this.map.zoomHandler.MAX_ZOOM;i++) {
      this.loadQueue[i] = [] //initializing the queue
      this.loaded[i] = [] //initializing the queue
    }

    /// loading the tileset
    for(var i=map.zoomHandler.MIN_ZOOM;i<=this.PRELOAD_ZOOM;i++) {
      
      var zoom_size = map.zoomHandler.getTileCount(i)
      for(var x = 0;x<zoom_size;x++) {
        for(var y = 0;y<zoom_size;y++) {
          this.load(i,x,y) 
        }
      }
    }
    this.shiftQueue()

    //setting up loading bar
    this.progressBar.draw(map.app)
    
    //PIXI.loader.onProgress.add(applyWrapper(this.onProgress,this))
    PIXI.loader.onLoad.add(applyWrapper(this.onLoad,this))
    PIXI.loader.onComplete.add(applyWrapper(this.onComplete,this))
  },
  markAsLoaded : function(z,x,y) {
    if(!this.loaded[z][x]) this.loaded[z][x] = []
    this.loaded[z][x][y] = true
  },
  isLoaded : function(z,x,y) {
    if(!this.loaded[z][x]) return false
    return this.loaded[z][x][y]
  },
  load : function(z,x,y) {
    if(!this.isLoaded(z,x,y) &&  !PIXI.loader.resources[this.tilename(z,x,y)]) {
      this.loadQueue[z].indexOf([x,y])
      this.progressBar.update(1)
      this.loadQueue[z].push([x,y])
    }
  },
  loadLaunch : function(z,x,y) {
    if(PIXI.loader.resources[this.tilename(z,x,y)]) {
      console.log(this.tilename(z,x,y)+" is already loaded")
      this.progressBar.update(-1)
      this.shiftQueue()
    }
    else {
      try {
        PIXI.loader.add(this.tilename(z,x,y),this.filename(z,x,y)) //loading filename with alias tilename
        console.log("requested "+this.tilename(z,x,y))
        this.loadingStart = Date.now()
        PIXI.loader.load()
      }
      catch(e) {
        console.log(e)
        this.loadQueue[z].push([x,y])
      }
    }
    
  },
  loadBulk : function(list) {
    list.forEach(applyWrapper(function(v) {
      this.load(v[0],v[1],v[2])
    },this))
  },
  tilename : function(zoom,x,y) { //name used to store the tile in PIXI.loader
    return ""+zoom+"_"+x+"_"+y
  },
  filename : function(zoom,x,y) {
    return this.TILES_URL+zoom+"/map_"+x+"_"+y+this.EXTENSION
  },
  shiftQueue : function() {
    for(var z = this.map.zoomHandler.MIN_ZOOM;z<=this.map.zoomHandler.MAX_ZOOM;z++) {
      var r = this.loadQueue[z].shift()
      if(!r) {
        continue
      }
      else {
        this.loadLaunch(z,r[0],r[1])
        return
      }
    }
    console.log("Loading queue is empty!")
  },
  onComplete : function () {
    this.shiftQueue()
  },
  onLoad : function (loader,resource) {
    console.log("Loaded "+resource.name+", time spent "+(Date.now() - this.loadingStart)+"ms")
    var s = resource.name.split("_").map(function(v){
      return parseInt(v)
    })

    this.map.createContainer(s[0],s[1],s[2])
    //loader.reset()

    this.progressBar.update(-1)
    
    this.map.allowRender = true
    this.map.render()
  },
  getTexture : function(z,x,y) {
    return PIXI.loader.resources[this.tilename(z,x,y)].texture
  }
}