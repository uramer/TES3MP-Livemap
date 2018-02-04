var TileID = function(z,x,y) {
  this.z = z
  this.x = x
  this.y = y
}

TileID.prototype = {
  getAlias : function(config) {
    var prefix = config.get("ALIAS_PREFIX")
    var sep = config.get("ALIAS_SEPARATOR")
    return prefix+sep+this.z+sep+this.x+sep+this.y
  }
}