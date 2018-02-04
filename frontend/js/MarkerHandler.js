var MarkerHandler = function (config) {
  if(!config) config = {}
  var defaultConfig = {
    source : "data/LiveMap.json",
    img : "img/compass.png",
    cluster : false,
    zOrder : 100,
    zoom : 18
  }
  for(var x in defaultConfig)
    if(!config[x]) config[x] = defaultConfig[x]
  
  this.config = config

  this.containers = []
}

MarkerHandler.prototype = {
  init : function() {
    var markerHandler = this
    AjaxRequest("get",this.config.source,function() {
      if(this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText)
        markerHandler.data = data
        for(var x in data) {
          markerHandler.createContainer(x)
        }
      }
    })
    
  },
  existsContainer : function(id) {
    if(this.containers[id]) return true
    else false
  },
  getContainer : function(id) {
    if(this.existsContainer(id)) return this.containers[id]
    else return false
  },
  createContainer : function(id) {
    this.containers[id] = new PIXI.DisplayObjectContainer()
    var c = this.containers[id]
    var t = new PIXI.Sprite.fromImage(this.config.img) //need to optimize this
    t.position = new PIXI.Point(0)
    c.addChild(t)
    c.zOrder = this.config.zOrder
  },
  drawAll : function(map) {
    for(var id in this.containers) {
      this.draw(map,id)
    }
  },
  draw : function(map,id) {
    if(!this.existsContainer(id)) return false

    var c = this.getContainer(id)
    var z = map.zoomHandler.getZoom()
    var k = map.zoomHandler.getZoomRatio(z,this.config.zoom)
    c.position = new PIXI.Point(k*this.data[id].x,k*this.data[id].y)

    map.app.stage.addChild(c)
  }
}