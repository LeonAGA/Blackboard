// GLOBAL VARIABLES=================================================================

let zone = document.getElementById('zone');
let paper = zone.getContext('2d');
let position = {x:0,y:0};
let color = '#DF0101';
let counterPoints = 0;
var strokes = [];
var points = [];
let wipeOut = true;
let down = false;
let erase = false;

// EVENT LISTENERS==================================================================

////Listener for click event based on delegation technique.////
document.body.addEventListener('click', function(e){
e.stopPropagation();
//If a click has been made inside the bocking area when the color menu is active//
  if (e.target.className == 'blocking' && wipeOut){
    document.querySelector('#blocking').style.display = "none";
    document.querySelector('#colors').style.display = "none";
    document.querySelector('#colors').style.zIndex = "0";
  }  
//If a click has been made in one of the menu buttons.//
  else if (e.target.className =='buttonMenu'){
    switch (e.target.getAttribute("id")){
      case "delete":
      wipeOut = false;
      document.querySelector('#blocking').style.display = "block";
      document.querySelector('#question').style.display = "block";
      document.querySelector('#question').style.zIndex = "1";
      break;
      case "change":
      document.querySelector('#blocking').style.display = "block";
      document.querySelector('#colors').style.display = "block";
      document.querySelector('#colors').style.zIndex = "1";
      break;
      case "Yes":
      wipeOut = true;
      document.querySelector('#blocking').style.display = "none";
      document.querySelector('#question').style.display = "none";
      document.querySelector('#question').style.zIndex = "0";
      shake();
      break;
      case "No":
      wipeOut = true;
      document.querySelector('#blocking').style.display = "none";
      document.querySelector('#question').style.display = "none";
      document.querySelector('#question').style.zIndex = "0";
      break;
      default:
    }
  } 
//If a click has been made in one of the colors in the color menu.//  
  else if (e.target.className == 'color'){
    color = e.target.getAttribute('name');
    document.querySelector('#blocking').style.display = "none";
    document.querySelector('#colors').style.display = "none";
    document.querySelector('#colors').style.zIndex = "0";
    jump();
  }
//If a click has been made inside the canvas and the eraser is disabled.//
  else if(e.target.className == 'canvas' && !erase){
    position.x = e.layerX;
    position.y = e.layerY;
    DrawLine(color, position.x, position.y, position.x-1, position.y-1, paper);
  }
//If a click has been made inside the canvas and the eraser is enabled.//  
  else if(e.target.className == 'canvas' && erase){
    position.x = e.layerX;
    position.y = e.layerY;
    paper.clearRect(position.x + 2, position.y + 2, -5, -5);
  }
});

////Listeners waiting for the mouse be pressed, released or moved to draw or erase.////

//If the mouse is pressed and onhold inside the canvas.//  
document.querySelector('#zone').addEventListener("mousedown", function(e){
  e.stopPropagation()
  down = true;
}); 

//If the mouse is pressed, onhold and is moving inside the canvas.//  
document.querySelector('#zone').addEventListener('mousemove', function(e){
  e.stopPropagation() 
  if(down == true && !erase){
    position.x = e.layerX;
    position.y = e.layerY;
    //points[counterPoints] = [color, position.x - e.movementX , position.y - e.movementY, position.x,position.y];
    //counterPoints+= 1;
    //DrawLine(color, position.x - e.movementX , position.y - e.movementY, position.x,position.y, paper);
    DrawLine(color, position.x - e.movementX , position.y - e.movementY, position.x,position.y, paper);
  }
    else if(down == true && erase){
    position.x = e.layerX;
    position.y = e.layerY;
    paper.clearRect(position.x - e.movementX, position.y - e.movementY, -5, -5);
    }
});

//If the mouse is released inside the canvas.//  
document.querySelector('#zone').addEventListener('mouseup', function(e){
  e.stopPropagation()
  down = false;
  //counterPoints = 0;
 // Redraw();
  
});

//Listener to  suggest the "d key" use//
document.body.addEventListener('mouseover', function(e){
  e.stopPropagation()
  if(e.target.getAttribute('id') == "delete"){
    document.querySelector('#instruction').style.display = 'block';
  }
  else{
    document.querySelector('#instruction').style.display = 'none';
  }
});

////Other listeners.////

//If the "d - key" has been pressed to activate o deactivate the eraser. //  
document.body.addEventListener('keydown', function(e){
  e.stopPropagation()
  if(e.keyCode == 68 && !erase){
  erase = true;
  document.querySelector('#zone').setAttribute('eraser','yes');
  } else if(e.keyCode == 68 && erase){
  erase = false;
  document.querySelector('#zone').removeAttribute('eraser');
  }
});
 
// FUNCTIONS========================================================================

function jump(){
document.querySelector('#change').setAttribute("jump", "yes");
document.querySelector('#change').style.background = color;
document.querySelector('#change').addEventListener("animationend", function(){
  document.querySelector('#change').setAttribute("jump", "no");
},false);
}

function shake(){
document.querySelector('#zone').setAttribute("shake","yes");
document.querySelector('#blackSmoke').setAttribute("shake","yes");
document.querySelector('#blackSmoke').style.display = 'block';
document.querySelector('#zone').addEventListener("animationend", function(){
  paper.clearRect(0, 0, zone.width, zone.height);
  strokes.length = 0;
  points.length = 0;
  document.querySelector('#blackSmoke').style.display = 'none';
  document.querySelector('#blackSmoke').removeAttribute("shake");
  document.querySelector('#zone').removeAttribute("shake");
},false);
}

function draw(){
document.querySelector('#zone').setAttribute("draw","yes");
document.querySelector('#zone').addEventListener("animationend", function(){
  document.querySelector('#zone').removeAttribute("draw");
},false);
}

//// Functions that draw in the canvas. ////

function DrawLine(color, xinitial, yinitial, xfinal, yfinal, canvas){
canvas.lineJoin = "round";
canvas.beginPath();
canvas.strokeStyle = color;
canvas.lineWidth = 3;
canvas.moveTo(xinitial,yinitial);
canvas.lineTo(xfinal,yfinal);
canvas.stroke();
canvas.closePath();
}

function Redraw(){
paper.clearRect(0, 0, zone.width, zone.height);
reduceNumberOfPoints(5, points);
  for(var i = 0; i < strokes.length; i++){
    upgradeStroke(strokes[i]);
  }
}

function reduceNumberOfPoints(n, array){
var newArray = [];
newArray[counterPoints] = [];
newArray[0] = array[0];
  for(var i = 0; i < array.length; i++){
    if(i % n == 0){
      newArray[newArray.length] = array[i];
    }  
  }
newArray[newArray.length - 1] = array[array.length - 1];
strokes.push(newArray);
}

function upgradeStroke(ry){
  if(ry.length > 1){
    console.log(ry);
    var lastArray = ry.length - 1;
    var lastPoint = ry[lastArray].length - 1;
    paper.beginPath();
    paper.lineWidth = 3;
    paper.moveTo(ry[0][1], ry[0][2]);
      for(i = 0; i < ry.lenght; i++){
        for(j =0; j < ry[i].lenght; i++){
          
          switch(j){
           case 0:
            paper.strokeStyle = ry[i][j];
           break;
           case 1:
            var cp = calculateControlPoint(ry,i,i+1); 
           break; 
           default:
          }
        }
        paper.quadraticCurveTo(ry[i].x, ry[i].y, cp.x, cp.y);
      }
  }
    paper.quadraticCurveTo(ry[lastPoint - 1], ry[lastPoint -1], ry[lastPoint], ry[lastPoint]); // punto final alv
    paper.stroke();
    paper.closePath();
  }


function calculateControlPoint(ry,a,b){
var cp = {}
cp.x = (ry[a][1] + ry[b][1]) / 2;
cp.y = (ry[a][2] + ry[b][2]) / 2;
return cp;
}



