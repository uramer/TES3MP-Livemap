var MarkerHandler = function (config,loader) {
  this.config = config
  this.loader = loader
  this.markerTexture = null
  this.containers = []
  this.data = {}
}

MarkerHandler.prototype = {
  init : function() {
    var markerHandler = this
    this.loader.add(this.config.get("MARKER_PLAYER_ALIAS"),this.config.get("MARKER_PLAYER_PATH"),function (loader,resource) {
      markerHandler.markerTexture = markerHandler.loader.getTexture(resource.name)

      markerHandler.update()
    })
  },
  update : function () {
    var markerHandler = this
    AjaxRequest("get",this.config.get("MARKER_PLAYER_DATA"),function() {
      if(this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText)
        for(var x in data) {
          var id = data[x].pid
          markerHandler.data[id] = data[x]
          markerHandler.data[id].rot = 2*Math.PI*data[x].rot/360
          markerHandler.createContainer(id)
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
    if(this.existsContainer(id)) return
    this.containers[id] = new PIXI.DisplayObjectContainer()
    var c = this.containers[id]
    var t = new PIXI.Sprite(this.markerTexture)
    t.position = new PIXI.Point(0)
    c.addChild(t)
    c.zOrder = this.config.get("MARKER_PLAYER_ZORDER")
  },
  getContainers : function(bounds,offset,z0) {
    var result = []
    var z = this.config.get("MARKER_PLAYER_DATA_ZOOM")
    var k = Math.pow(2,z0-z)
    var NW = this.config.get("MARKER_PLAYER_DATA_NW")
    var SE = this.config.get("MARKER_PLAYER_DATA_SE")
    var size = this.config.get("MARKER_PLAYER_DATA_SIZE")
    
    for(var x in this.data) {
      var cont = this.getContainer(x)


      cont.position = new PIXI.Point(
        ( ( this.data[x].x - NW.x ) / ( SE.x - NW.x ) ) * k * size.x + offset.x,
        ( ( this.data[x].y - NW.y ) / ( SE.y - NW.y ) ) * k * size.y + offset.y
      )
      cont.rotation = this.data[x].rot 

      if(x==1) console.log(k,cont.position.x,cont.position.y)

      result.push(cont)
    }
    return result
  }
}