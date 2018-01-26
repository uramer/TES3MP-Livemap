var MapControls = function () {
  this.app = null
  this.containers = [] //for every zoom level
  this.zoomHandler = new ZoomHandler(this)
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
      //this.containers[z][x][y].worldVisibile = true
      this.app.stage.addChild(this.containers[z][x][y])
      //console.log(this.containers[z][x][y].position.x+":"+this.containers[z][x][y].position.y)
    }
  },
  hideContainer : function(z,x,y) {
    if(this.existsContainer(z,x,y))
      //this.containers[z][x][y].worldVisibile = false
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
    //this.app.stage.addChild(c)
    
  },
  render : function() {
    if(!this.allowRender) return false //nothing loaded yet

    var z0 = this.zoomHandler.getZoom()
    
    for(var z = this.zoomHandler.MIN_ZOOM;z<=z0;z++) { //update every tile's corrdinates
      var c = this.zoomHandler.getTileCount(z)
      var center = Math.pow(2,z-12)//c / 2
      var k = this.zoomHandler.getZoomRatio(z0,z)
      var resolution = k * this.tileLoader.TILE_RESOLUTION
      
      var cx = this.app.view.width  / 2 + this.offset.x - ( center ) * resolution
      var cy = this.app.view.height / 2 + this.offset.y - ( center ) * resolution
      //console.log(cx,cy,this.app.view.width / 2,this.app.view.height / 2)

      for(var x = 0;x<c;x++) {
        for(var y = 0;y<c;y++) {
          if(this.existsContainer(z,x,y) && this.zoomHandler.checkBoundaries(this,z0,z,x,y)) {
            var cont = this.getContainer(z,x,y)
            
            cont.width  = resolution
            cont.height = resolution

            cont.position = new PIXI.Point(
              cx + x * resolution,
              cy + y * resolution
            )
          }
        }
      }
    }

    for(var z = this.zoomHandler.MAX_ZOOM;z>=this.zoomHandler.MIN_ZOOM;z--) {
      var c = this.zoomHandler.getTileCount(z)
      for(var x = 0;x<c;x++) {
        for(var y = 0;y<c;y++) {
          if(this.zoomHandler.checkBoundaries(this,z0,z,x,y)) {
            if(this.existsContainer(z,x,y))
              this.showContainer(z,x,y)
            else
            this.tileLoader.add(z,x,y)
          }
          else
            this.hideContainer(z,x,y)
        }
      }
    }

    this.tileLoader.load()

    this.sortStage()
    this.app.renderer.render(this.app.stage)
  }
}