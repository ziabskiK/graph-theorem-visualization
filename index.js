//track mouse position on mousemove
var mousePosition;
//track state of mousedown and up
var isMouseDown;

//reference to the canvas element
var c = document.getElementById("myCanvas");

//reference to 2d context
var ctx = c.getContext("2d");

//add listeners
document.addEventListener('mousemove', move, false);
document.addEventListener('touchmove', move, false);
document.addEventListener('mousemove', addEdge, false);

document.addEventListener('mousedown', setDraggable, false);
document.addEventListener('touchstart', setDraggable, false);
document.addEventListener('mousedown', drawEdge, false);
document.addEventListener('mouseup', setDraggable, false);
document.addEventListener('touchend', setDraggable);
document.addEventListener('mouseup', endDrawEdge, false);
document.addEventListener('keydown', onctrlPush, true)
document.addEventListener('keyup', onctrlRelease, true)

//make some circles
var c1 = new Circle(50, 50, 50,1);
var c2 = new Circle(200, 50, 50,2 );
var c3 = new Circle(350, 50, 50, 3  );
//initialise our circles
var circles = [c1, c2, c3];
//main draw method
function draw() {
    //clear canvas
    ctx.clearRect(0, 0, c.width, c.height);
    drawCircles();
}

//draw circles
function drawCircles() {
    for (var i = circles.length - 1; i >= 0; i--) {
        circles[i].draw();
    }
}
function addNode(){
  var lastCircle = circles[circles.length-1];
  var circleToAdd;
  if(lastCircle.x + 20 + 2*lastCircle.r > c.width){
    circleToAdd = new Circle(lastCircle.x, lastCircle.y+20+2*lastCircle.r, 50, circles.length+1)
  } else {
    circleToAdd = new Circle(lastCircle.x+20+2*lastCircle.r, lastCircle.y, 50, circles.length+1)
  }
  circles.push(circleToAdd)
  draw();
}

//key track of circle focus and focused index
var focused = {
    key: 0,
    state: false
}
var addEdgesMode=false

function onctrlPush(e){
  if(e.keyCode===17){
    //toggle add edges mode
    if(!addEdgesMode){
      addEdgesMode=true;
      document.body.style.cursor = 'crosshair'
    }
  }
}
function onctrlRelease(e){
  if(e.keyCode===17){
    if(addEdgesMode){
      addEdgesMode=false;
      document.body.style.cursor = 'default'
    }

  }
}


//circle Object
    function Circle(x, y, r, idx, nodes=[]) {
        this.startingAngle = 0;
        this.endAngle = 2 * Math.PI;
        this.x = x;
        this.y = y;
        this.r = r;
        this.idx =idx;
        this.nodes=nodes;
        this.fill = "#76FEC5";
        this.stroke = "#45D09E";

        this.draw = function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, this.startingAngle, this.endAngle);
            ctx.fillStyle = this.fill;
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.strokeStyle = this.stroke;
            ctx.font = '24px Calibri';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.idx}`, this.x, this.y+3);
            ctx.stroke();

            for (var edge of this.nodes) {
              ctx.beginPath();
              ctx.moveTo(this.x, this.y);
              ctx.lineTo(edge.x, edge.y);
              ctx.stroke();
            }
        }
        this.addNode = function(circle) {
              nodes.push(circle);
        }
    }
    var scale=1.0
    function zoomout(e){
      scale -= 0.03;
      ctx.scale(scale, scale)
      draw()
    }
    function zoomin(e){
      scale += 0.03;
      ctx.scale(scale, scale)
      draw()
    }

    function move(e) {
      //move nodes around
      if(!addEdgesMode){

        if (!isMouseDown) {
            return;
        }
        getMousePosition(e);
        //if any circle is focused
        if (focused.state) {
            circles[focused.key].x = mousePosition.x;
            circles[focused.key].y = mousePosition.y;
            draw();
            return;
        }
        //no circle currently focused check if circle is hovered
        for (var i = 0; i < circles.length; i++) {
            if (intersects(circles[i])) {
                circles.move(i, 0);
                focused.state = true;
                break;
            }
        }

        draw();
      }
    }

    var isDrawingEdge = false;
    var edgeCords = {start: null, end:null}

  function drawEdge(e){
    if(addEdgesMode){

       isDrawingEdge=true;
       getMousePosition(e);


    //get node if mouse is in circles
    const x = mousePosition.x;
    const y = mousePosition.y;

      var circle  = circles.find(p => {
        var c = Math.sqrt(Math.abs(x-p.x)*Math.abs(x-p.x) + Math.abs(y-p.y)*Math.abs(y-p.y))
        return c <= p.r;
      });
      edgeCords.start = circle

      //get nearest node

      }
     }
     function endDrawEdge(e){
       if(addEdgesMode){

       isDrawingEdge = false;
       addEdgesMode=false;
       getMousePosition(e);

       const x = mousePosition.x;
       const y = mousePosition.y;
//check if end cords are in circle
       var circle  = circles.find(p => {
         var c = Math.sqrt(Math.abs(x-p.x)*Math.abs(x-p.x) + Math.abs(y-p.y)*Math.abs(y-p.y))
         return c <= p.r;
       });

      if(circle){
        edgeCords.start.addNode(circle)
      }

      draw();

}
}
    function addEdge(e){
      if(addEdgesMode&& isDrawingEdge){
      }
    }

    function reset(){
      circles = []
      draw()
    }


    //set mousedown state
    function setDraggable(e) {
        var t = e.type;
        if (t === "mousedown") {
            isMouseDown = true;
        } else if (t === "mouseup") {
            isMouseDown = false;
            releaseFocus();
        }
    }

    function releaseFocus() {
        focused.state = false;
    }

    function getMousePosition(e) {
        var rect = c.getBoundingClientRect();
        mousePosition = {
            x: Math.round(e.x - rect.left),
            y: Math.round(e.y - rect.top)
        }
    }

    //detects whether the mouse cursor is between x and y relative to the radius specified
    function intersects(circle) {
        // subtract the x, y coordinates from the mouse position to get coordinates
        // for the hotspot location and check against the area of the radius
        var areaX = mousePosition.x - circle.x;
        var areaY = mousePosition.y - circle.y;
        //return true if x^2 + y^2 <= radius squared.
        return areaX * areaX + areaY * areaY <= circle.r * circle.r;
    }

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
};
draw();
console.log(addEdgesMode);
