var MapControls = function () {
  this.app = null
  this.containers = [] //for every zoom level
  this.zoomHandler = new ZoomHandler()
  this.tileLoader = new TileLoader(this)
  this.keyBinder = new KeyBinder(this)
  this.offset = new PIXI.Point(0,0)
  this.allowRender = false
}

MapControls.prototype = {
  init : function() {
    //initiating PIXI
    var app = new PIXI.Application({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      antialias: true,
      forceCanvas: false
    })
    this.app = app
    
    app.renderer.view.style.position = "absolute"
    app.renderer.view.style.display = "block"
    app.renderer.autoResize = true
    app.renderer.resize(window.innerWidth, window.innerHeight)
    document.body.appendChild(app.view)

    //loading initial tiles
    this.tileLoader.init()

    this.keyBinder.init()
  },
  windowResize : function() {
    this.app.renderer.resize(window.innerWidth, window.innerHeight)
    this.render()
  },
  getContainer : function(z,x,y) {
    if(this.existsContainer(z,x,y))
      return this.containers[z][x][y]
    else
      return false
  },
  showContainer : function(z,x,y) {
    if(this.existsContainer(z,x,y)) {
      //this.containers[z][x][y].visibile = true
      this.app.stage.addChild(this.containers[z][x][y])
      //console.log(this.containers[z][x][y].position.x+":"+this.containers[z][x][y].position.y)
    }
  },
  hideContainer : function(z,x,y) {
    if(this.existsContainer(z,x,y))
      //this.containers[z][x][y].visibile = false
      this.app.stage.removeChild(this.containers[z][x][y])
  },
  existsContainer : function(z,x,y) {
    if(this.containers[z])
      if(this.containers[z][x])
        if(this.containers[z][x][y])
          return true
    return false
  },
  sortStage : function() {
    this.app.stage.children.sort(function(a,b) {
      a.zOrder = a.zOrder || 0
      b.zOrder = b.zOrder || 0
      return a.zOrder - b.zOrder
    })
  },
  createContainer : function(z,x,y) {
    if(!this.containers[z]) this.containers[z] = []
    if(!this.containers[z][x]) this.containers[z][x] = []
    this.containers[z][x][y] = new PIXI.DisplayObjectContainer()
    var c = this.containers[z][x][y]
    var t = new PIXI.Sprite(this.tileLoader.getTexture(z,x,y))
    t.width = this.tileLoader.TILE_RESOLUTION
    t.height = this.tileLoader.TILE_RESOLUTION
    t.position = new PIXI.Point(0)
    c.addChild(t)
    c.zOrder = z
  },
  draw : function(z,x,y,boundaries) {
    
  },
  render : function() {
    if(!this.allowRender) return false
    var z0 = this.zoomHandler.getZoom()
    var size = this.zoomHandler.getTileCount(z0)

    var x0 = Math.floor( size / 2 - ( this.app.view.width  / 2 + this.offset.x ) / this.tileLoader.TILE_RESOLUTION ) - 1
    var y0 = Math.floor( size / 2 - ( this.app.view.height / 2 + this.offset.y ) / this.tileLoader.TILE_RESOLUTION ) - 1
    
    var x1 = Math.ceil(this.app.view.width  / this.tileLoader.TILE_RESOLUTION) + 1
    var y1 = Math.ceil(this.app.view.height / this.tileLoader.TILE_RESOLUTION) + 1

    x1+=x0
    y1+=y0

    
    for(var z = this.zoomHandler.MAX_ZOOM;z>=this.zoomHandler.MIN_ZOOM;z--) {
      var c = this.zoomHandler.getTileCount(z)
      for(var x = 0;x<c;x++) {
        for(var y = 0;y<c;y++) {
          if(this.existsContainer(z,x,y)) {
            var k = Math.pow(2, z0 - z) //this.zoomHandler.getZoomRatio(z0,z)//
            var cont = this.getContainer(z,x,y)
            var center = (this.zoomHandler.getTileCount(z) / 2)
            cont.width  = k * this.tileLoader.TILE_RESOLUTION
            cont.height = k * this.tileLoader.TILE_RESOLUTION
            cont.position = new PIXI.Point(
              this.app.view.width  / 2 + this.offset.x + (x-center) * cont.width,
              this.app.view.height / 2 + this.offset.y + (y-center) * cont.height
            )
            console.log(z,x,y,cont.position.x,cont.position.y,cont.width)
          }
        }
      }
    }

    for(var z = this.zoomHandler.MAX_ZOOM;z>=this.zoomHandler.MIN_ZOOM;z--) {
      var c = this.zoomHandler.getTileCount(z)
      for(var x = 0;x<c;x++) {
        for(var y = 0;y<c;y++) {
          if(z>z0) {
            this.hideContainer(z,x,y)
            continue
          }
          if(this.existsContainer(z,x,y)) {
            if(this.zoomHandler.checkBoundaries(this,z0,z,x,y))
              this.showContainer(z,x,y)
            else
              this.hideContainer(z,x,y)
          }
          else {
            if(this.zoomHandler.checkBoundaries(this,z0,z,x,y))
              this.tileLoader.load(z,x,y)
          }
        }
      }
    }

    this.tileLoader.shiftQueue()

    this.sortStage()
    this.app.renderer.render(this.app.stage)
  }
}