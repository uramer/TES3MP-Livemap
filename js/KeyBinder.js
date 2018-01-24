var KeyBinder = function (map) {
  this.map = map
  this.lastMoveTime = Date.now()
  this.mouseDragStart = new PIXI.Point(0,0)
  this.mouseDownFlag = false
  this.mouseDragSensitivity = 1.0
  this.mouseDragPeriod = 5
}

KeyBinder.prototype = {
  drag : function(e) {
    var current = new PIXI.Point(e.clientX,e.clientY)
    this.map.offset = new PIXI.Point(
      this.mouseDragSensitivity*(current.x-this.mouseDragStart.x)+this.map.offset.x,
      this.mouseDragSensitivity*(current.y-this.mouseDragStart.y)+this.map.offset.y
    )
    this.mouseDragStart = current
    this.map.render()
  },
  wheelZoomHandler : function (e) {
    if(e.wheelDelta>0)
      this.map.zoomHandler.increase()
    else
      this.map.zoomHandler.decrease()
    this.map.render()
  },
  mouseDownDragHandler : function (e) {
    this.mouseDownFlag = true
    this.mouseDragStart = new PIXI.Point(e.clientX,e.clientY)
  },
  mouseUpDragHandler : function (e) {
    this.mouseDownFlag = false
    this.drag(e)
  },
  mouseMoveDragHandler : function (e) {
    var t = this.lastMoveTime
    var c = Date.now()
    if(c - t > this.mouseDragPeriod && this.mouseDownFlag) {
      this.lastMoveTime = c
      this.drag(e)
    }
      
  },
  init : function () {
    this.map.app.view.addEventListener("mousewheel", applyWrapper(this.wheelZoomHandler,this), true)

    this.map.app.view.addEventListener("mousedown", applyWrapper(this.mouseDownDragHandler,this), true)
    this.map.app.view.addEventListener("mouseup"  , applyWrapper(this.mouseUpDragHandler,this),   true)
    this.map.app.view.addEventListener("mousemove", applyWrapper(this.mouseMoveDragHandler,this), true)
  }
}