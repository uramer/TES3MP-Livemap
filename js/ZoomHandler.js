var ZoomHandler = function(x,y) {
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
    return this.getTileCount(z0)/this.getTileCount(z)
  },
  checkBoundaries : function (map,z0,z,x,y) {
    var size = this.getTileCount(z)
    var k = this.getZoomRatio(z0,z)//Math.pow(2,z0 - z)
    var res = map.tileLoader.TILE_RESOLUTION * k
    var x0 = Math.floor( size / 2 - ( map.app.view.width  / 2 + map.offset.x ) / res ) - 1
    var y0 = Math.floor( size / 2 - ( map.app.view.height / 2 + map.offset.y ) / res ) - 1
    
    var x1 = x0 + Math.ceil( map.app.view.width  / res ) + 1
    var y1 = y0 + Math.ceil( map.app.view.height / res ) + 1

    /*console.log(
      "zoom: "+z0+" from ("+x0+", "+y0+") to ("+x1+", "+y1+") "+
      "offset: ("+map.offset.x+", "+map.offset.y+") "+
      "view: ("+map.app.view.width+", "+map.app.view.height+") "+
      "drawn: ("+(x1-x0)*res+", "+(y1-y0)*res+")"+
      "tile resolution: "+res
    )*/

    return (x0<=x && x<=x1 && y0<=y && y<=y1)
  },
  decrease : function() {
    this.currentZoom--
    if(this.currentZoom<this.MIN_ZOOM) this.currentZoom = this.MIN_ZOOM
  },
  increase : function() {
    this.currentZoom++
    if(this.currentZoom>this.MAX_ZOOM) this.currentZoom = this.MAX_ZOOM
  }
}