var ProgressScene = function () {
  this.scene = new PIXI.DisplayObjectContainer()
  this.WIDTH = 516
  this.HEIGHT = 20
  this.PADDING = 10

  this.elem = document.createElement("div")
  this.elem.setAttribute("class","loadStatus")
  this.text = document.createTextNode("Loading...")
  this.elem.appendChild(this.text)

  this.counter = 0
  
  /*
  this.bar = new PIXI.Graphics()
  this.bar.beginFill(0xeeeeee)
  this.bar.drawRect(0,0,this.WIDTH,this.HEIGHT)
  this.bar.endFill()

  this.scene.addChild(this.bar)*/
}

ProgressScene.prototype = {
  draw : function(app) {
    document.body.appendChild(this.elem)
  },
  show : function() {
    this.elem.style.display = "block"
  },
  hide : function() {
    this.elem.style.display = "none"
  },
  update : function (change) {
    this.counter+=change
    if(this.counter == 0 ) this.hide()
    else {
      
      this.show()
      this.text.textContent = "Loading "+this.counter+ " file"
      if(this.counter>1) this.text.textContent+="s"
    }
  }
}