var SceneHandler = function() {
  this.containerSuppliers = []
}

SceneHandler.prototype = {
  init : function() {
  },
  add : function(supp) {
    this.containerSuppliers.push(supp)
  },
  sortStage : function(stage) {
    stage.children.sort(function(a,b) {
      a.zOrder = a.zOrder || 0
      b.zOrder = b.zOrder || 0
      return a.zOrder - b.zOrder
    })
  },
  render : function (bounds,stage,offset,zoom) {
    stage.removeChildren()
    
    this.containerSuppliers.forEach(function(v) {
      v.getContainers(bounds,stage,offset,zoom).forEach(function(c) {
        stage.addChild(c)
      })
    })

    this.sortStage(stage)
  }
}