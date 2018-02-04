var ZoomHandler = function(map,config) {
  this.map = map
  this.config = config
  this.currentZoom = 0
  this.ZOOM_MIN = 0
  this.ZOOM_MAX = 0
  this.ZOOM_STEP = 1
}

ZoomHandler.prototype = {
  init : function() {
    this.ZOOM_MIN = this.config.get("ZOOM_MIN")
    this.ZOOM_MAX = this.config.get("ZOOM_MAX")
    this.ZOOM_STEP = this.config.get("ZOOM_STEP")
    this.currentZoom = this.getStartingZoom()
  },
  getStartingZoom : function() {
    var r = this.config.get("TILE_RESOLUTION")
    return Math.max(
      this.config.get("ZOOM_START"),
      this.ZOOM_MIN - 1 + Math.min(
        Math.floor(this.map.app.view.width  / r.x),
        Math.floor(this.map.app.view.height / r.y)
      )
    )
  },
  getZoom : function () {
    return this.currentZoom
  },
  getZoomRatio : function(z0,z) {
    return Math.pow(2,z0 - z)
  },
  updateOffset : function (e,z) {
    if(z == this.getZoom()) return

    var dx = ( e.clientX - this.map.app.view.width  / 2 )
    var dy = ( e.clientY - this.map.app.view.height / 2 )
    var k = this.getZoomRatio(this.getZoom(),z)

    this.map.offset.x = (this.map.offset.x - dx) * k + dx
    this.map.offset.y = (this.map.offset.y - dy) * k + dy
  },
  decrease : function(e) {
    var z = this.getZoom()
    this.currentZoom-=this.ZOOM_STEP
    if(this.currentZoom<this.ZOOM_MIN) this.currentZoom = this.ZOOM_MIN
    this.updateOffset(e,z)
  },
  increase : function(e) {
    var z = this.getZoom()
    this.currentZoom+=this.ZOOM_STEP
    if(this.currentZoom>this.ZOOM_MAX) this.currentZoom = this.ZOOM_MAX
    this.updateOffset(e,z)
  }
}