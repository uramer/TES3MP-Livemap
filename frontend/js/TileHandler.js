var TileHandler = function (config,loader) {
  this.config = config
  this.loader = loader

  this.containers = []

  this.minZoom = 0
  this.maxZoom = 0
  this.tileCount = []
  this.tileResolution = { x : 0, y : 0}
}

TileHandler.prototype = {
  init : function() {
    this.minZoom = this.config.get("ZOOM_MIN")
    this.maxZoom = this.config.get("ZOOM_MAX")
    this.tileCount = this.config.get("TILE_ZOOM_COUNT")
    this.tileResolution = this.config.get("TILE_RESOLUTION")

    var preloadZoom = this.config.get("ZOOM_PRELOAD")

    for(var z=this.minZoom;z<=preloadZoom;z++) {
      var zs = this.tileCount[z]
      for(var x = 0;x<zs.x;x++) {
        for(var y = 0;y<zs.y;y++) {
          this.load(z,x,y)
        }
      }
    }
    this.loader.load()
  },
  load : function(z,x,y) {
    this.loader.add(this.tilename(z,x,y),this.filename(z,x,y),applyWrapper(this.onLoad,this))
  },
  onLoad : function(loader, resource) {
    var s = resource.name.split("_")
    this.createContainer(s[1],s[2],s[3])
  },
  tilename : function(z,x,y) {
    var prefix = this.config.get("TILE_ALIAS_PREFIX")
    var sep = this.config.get("TILE_ALIAS_SEPARATOR")
    return prefix+sep+z+sep+x+sep+y
  },
  filename : function(z,x,y) {
    var path = this.config.get("TILE_PATH")
    var prefix = this.config.get("TILE_PREFIX")
    var sep = this.config.get("TILE_SEPARATOR")
    var ext = this.config.get("TILE_EXTENSION")
    return path+z+"/"+prefix+sep+x+sep+y+ext
  },
  getContainer : function(z,x,y) {
    if(this.existsContainer(z,x,y))
      return this.containers[z][x][y]
    else
      return false
  },
  existsContainer : function(z,x,y) {
    if(this.containers[z])
      if(this.containers[z][x])
        if(this.containers[z][x][y])
          return true
    return false
  },
  createContainer : function(z,x,y) {
    if(!this.containers[z]) this.containers[z] = []
    if(!this.containers[z][x]) this.containers[z][x] = []
    this.containers[z][x][y] = new PIXI.DisplayObjectContainer()
    var c = this.containers[z][x][y]
    var t = new PIXI.Sprite(this.loader.getTexture(this.tilename(z,x,y)))
    t.width = this.tileResolution.x
    t.height = this.tileResolution.y
    t.position = new PIXI.Point(0)
    c.addChild(t)
    c.zOrder = z
  },
  getContainers : function(bounds,offset,z0) {
    var result = []
    var center = 0.25 //central tile for minZoom-1
    var k = Math.pow(2,z0-this.minZoom+1) //scale ratio for minZoom -1
    for(var z = this.minZoom;z<=z0;z++) {
      center *= 2   //Math.pow(2,z-this.minZoom-1)
      k      *= 0.5 //Math.pow(2,z0-z)
      
      var resolution={
        x : k * this.tileResolution.x,
        y : k * this.tileResolution.y
      }
     
      var cx = bounds.x / 2 - ( center ) * resolution.x + offset.x //position of the (0,0) tile
      var cy = bounds.y / 2 - ( center ) * resolution.y + offset.y 

      var x0 = center - ( offset.x + bounds.x / 2) / resolution.x //
      var y0 = center - ( offset.y + bounds.y / 2) / resolution.y
      var x1 = x0 + bounds.x / resolution.x
      var y1 = y0 + bounds.y / resolution.y

      x0 = Math.floor(x0)
      y0 = Math.floor(y0)
      x1 = Math.ceil(x1)
      y1 = Math.ceil(y1)

      var count = this.tileCount[z]

      for(var x = 0;x<count.x;x++) {
        for(var y = 0;y<count.y;y++) {
          if((x0<=x && x<=x1 && y0<=y && y<=y1)) {//checking boundaries
            if(this.existsContainer(z,x,y)) {//tile already loaded and on the screen, drawing
              var cont = this.getContainer(z,x,y)

              cont.width  = resolution.x //scaling for the current zoom
              cont.height = resolution.y //scaling for the current zoom

              cont.position = new PIXI.Point( //updating for the current zoom and offset
                cx + x * resolution.x,
                cy + y * resolution.y
              )

              result.push(cont) //sending it to the SceneHandler to draw
            }
            else
              this.load(z,x,y) //tile not loaded yet, requesting it
          }
        }
      }
    }

    return result
  }
}