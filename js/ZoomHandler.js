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
  this.currentZoom = 11
}

ZoomHandler.prototype = {
  getZoom : function () {
    return this.currentZoom
  },
  getTileCount : function (z) { //amount of tiles to load for a specific zoom
    if(!z) z = this.zoom
    return this.ZOOM_TABLE[z]
  },
  getZoomRatio : function(z0,z) {
    return this.getTileCount(z0)/this.getTileCount(z)// Math.pow(2,z0 - z)
  },
  checkBoundaries : function (map,z0,z,x,y) {
    if(z>z0) return false
    var center = this.getTileCount(z) / 2
    var k = this.getZoomRatio(z0,z)
    var res = map.tileLoader.TILE_RESOLUTION * k
    var x0 = Math.floor( center - ( map.offset.x + map.app.view.width  / 2 ) / res )
    var y0 = Math.floor( center - ( map.offset.y + map.app.view.height / 2 ) / res )
    
    var x1 = Math.ceil( center - ( map.offset.x - map.app.view.height / 2  ) / res )
    var y1 = Math.ceil( center - ( map.offset.y - map.app.view.height / 2  ) / res )

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
    var z = this.currentZoom
    this.currentZoom--
    if(this.currentZoom<this.MIN_ZOOM) this.currentZoom = this.MIN_ZOOM
    this.updateOffset(e,z)
  },
  increase : function(e) {
    var z = this.currentZoom
    this.currentZoom++
    if(this.currentZoom>this.MAX_ZOOM) this.currentZoom = this.MAX_ZOOM
    this.updateOffset(e,z)
  }
}