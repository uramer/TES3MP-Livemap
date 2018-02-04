var MapControls = function () {
  this.app = null
  this.config = new ConfigHandler()
  this.loader = new QueuedLoader()
  this.sceneHandler = new SceneHandler()
  this.zoomHandler = new ZoomHandler(this,this.config)
  this.tileHandler = new TileHandler(this.config,this.loader)
  //this.markerHandler = new MarkerHandler()
  this.keyBinder = new KeyBinder(this,this.zoomHandler)

  this.offset = new PIXI.Point(0,0)
  this.allowRender = false
}

MapControls.prototype = {
  onLoad : function() {
    this.allowRender = true
    this.render()
  },
  init : function() {
    this.config.init(applyWrapper(function() {
      var app = new PIXI.Application({
        width: document.body.clientWidth,
        height: document.body.clientHeight,
        antialias: true,
        forceCanvas: false,
        clearBeforeRender: true
      })
      this.app = app
      
      app.renderer.view.style.position = "absolute"
      app.renderer.view.style.display = "block"
      app.renderer.autoResize = true
      app.renderer.resize(window.innerWidth, window.innerHeight)
      document.body.appendChild(app.view)

      var r = this.config.get("TILE_RESOLUTION")
      this.offset = new PIXI.Point(r.x / 2, r.y / 2)

      this.loader.init(PIXI.loader,applyWrapper(this.onLoad,this))
      this.tileHandler.init()
      this.zoomHandler.init()
      //this.markerHandler.init()
      this.keyBinder.init()
      this.sceneHandler.init()
      
      this.sceneHandler.add(this.tileHandler)
      //this.sceneHandler.add(this.markerHandler)
    },this))
  },
  windowResize : function() {
    this.app.renderer.resize(window.innerWidth, window.innerHeight)
    this.render()
  },
  render : function() {
    console.log("MapControls render")
    if(!this.allowRender) return false //nothing loaded yet

    this.sceneHandler.render(
      {
        x:this.app.view.width,
        y:this.app.view.height
      },
      this.app.stage,
      this.offset,
      this.zoomHandler.getZoom()
    )

    this.app.renderer.render(this.app.stage)
  }
}