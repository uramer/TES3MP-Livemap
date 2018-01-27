var ZoomHandler = function(map) {
  this.map = map
  this.ZOOM_TABLE  = {
    11: 1,
    12: 2,
    13: 4,
    14: 7,
    15: 13,
    16: 25,
    17: 50,
    18: 100
  }
  this.MIN_ZOOM = 11
  this.MAX_ZOOM = 18
  this.ZOOM_STEP = 0.5
  this.currentZoom = 12
}

ZoomHandler.prototype = {
  getZoom : function () {
    return this.currentZoom
  },
  getTileCount : function (z) { //amount of tiles to load for a specific zoom
    if(!z) z = this.currentZoom
    return this.ZOOM_TABLE[z]
  },
  getZoomRatio : function(z0,z) {
    return Math.pow(2,z0 - z)
  },
  checkBoundaries : function (map,z0,z,x,y) {
    if(z>z0) return false

    var center = Math.pow(2,z-map.zoomHandler.MIN_ZOOM-1)//this.getTileCount(z) / 2
    var k = this.getZoomRatio(z0,z)
    var resolution = k * map.tileLoader.TILE_RESOLUTION

    var x0 = center - ( map.offset.x + map.app.view.width  / 2) / resolution
    var y0 = center - ( map.offset.y + map.app.view.height / 2) / resolution
    
    var x1 = x0 + map.app.view.width  / resolution
    var y1 = y0 + map.app.view.height / resolution

    x0 = Math.floor(x0)
    y0 = Math.floor(y0)
    x1 = Math.ceil(x1)
    y1 = Math.ceil(y1)
    function convertX(x) {
      return map.app.view.width  / 2 + (x - center) * resolution + map.offset.x
    }

    function convertY(y) {
      return map.app.view.height / 2 + (y - center) * resolution + map.offset.y
    }

    return (x0<=x && x<=x1 && y0<=y && y<=y1)
  },
  updateOffset : function (e,z) {
    var k = 1
    if (z > this.getZoom()) k = -1
    if(z == this.getZoom()) k = 0

    this.map.offset.x = this.map.offset.x - k * ( e.clientX - this.map.app.view.width / 2 )
    this.map.offset.y = this.map.offset.y - k * ( e.clientY - this.map.app.view.height / 2 )

    this.map.offset.x *= this.map.zoomHandler.getZoomRatio(this.map.zoomHandler.getZoom(),z) 
    this.map.offset.y *= this.map.zoomHandler.getZoomRatio(this.map.zoomHandler.getZoom(),z) 
  },
  decrease : function(e) {
    var z = this.getZoom()
    this.currentZoom-=this.ZOOM_STEP
    if(this.currentZoom<this.MIN_ZOOM) this.currentZoom = this.MIN_ZOOM
    this.updateOffset(e,z)
  },
  increase : function(e) {
    var z = this.getZoom()
    this.currentZoom+=this.ZOOM_STEP
    if(this.currentZoom>this.MAX_ZOOM) this.currentZoom = this.MAX_ZOOM
    this.updateOffset(e,z)
  }
}