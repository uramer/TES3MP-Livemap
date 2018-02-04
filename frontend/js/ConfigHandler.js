var ConfigHandler = function(path) {
  if(!path) this.path = "data/LiveMapConfig.json"
  else      this.path = path
  this.data = {}
}

ConfigHandler.prototype = {
  init : function (callback) {
    var configHandler = this
    AjaxRequest("GET",this.path,function() {
      if(this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText)
        configHandler.data = data
        callback()
      }
    })
  },
  get : function(s) {
    return this.data[s]
  },
  set : function(s,v) {
    this.data[s] = v
  }
}