// GLOBAL VARIABLES=================================================================

let zone = document.getElementById('zone');
let paper = zone.getContext('2d');
let zoneAux = document.getElementById('zoneAux');
let paperAux = zoneAux.getContext('2d');
let position = {x:0,y:0,color:'#DF0101',style:false};
let color = '#DF0101';
var strokes = [];
var points = [];
let wipeOut = true;
let down = false;
let erase = false;
let improve = false;

// EVENT LISTENERS==================================================================

////Listener for click event based on delegation technique.////
document.body.addEventListener('click', function(e){
e.stopPropagation();
//If a click has been made inside the bocking area when the color menu is active.//
  if(e.target.className == 'blocking' && wipeOut){
    document.querySelector('#blocking').style.display = "none";
    document.querySelector('#colors').style.display = "none";
    document.querySelector('#colors').style.zIndex = "2";
  }  
//If a click has been made in one of the menu buttons.//
  else if(e.target.className =='buttonMenu'){
    switch(e.target.getAttribute("id")){
      case "delete":
      wipeOut = false;
      document.querySelector('#blocking').style.display = "block";
      document.querySelector('#question').style.display = "block";
      document.querySelector('#question').style.zIndex = "3";
      break;
      case "change":
      document.querySelector('#blocking').style.display = "block";
      document.querySelector('#colors').style.display = "block";
      document.querySelector('#colors').style.zIndex = "3";
      break;
      case "Yes":
      wipeOut = true;
      document.querySelector('#blocking').style.display = "none";
      document.querySelector('#question').style.display = "none";
      document.querySelector('#question').style.zIndex = "2";
      shake();
      break;
      case "No":
      wipeOut = true;
      document.querySelector('#blocking').style.display = "none";
      document.querySelector('#question').style.display = "none";
      document.querySelector('#question').style.zIndex = "2";
      break;
      case "stroke":
        if(!improve){
          document.querySelector('#stroke').innerHTML = "Stroke-mode";
          document.querySelector('#stroke').style.borderColor = "#FFFFFF";
          document.querySelector('#stroke').style.color = "rgb(255,255,255)";
          document.querySelector('#stroke').style.background = "rgb(0,0,0)";
          improve = true;
          document.querySelector('#zoneAux').style.display = "block";
        }else{
          document.querySelector('#stroke').innerHTML = "Paint-mode";
          document.querySelector('#stroke').style.borderColor = "#000000";
          document.querySelector('#stroke').style.color = "rgb(0,0,0)";
          document.querySelector('#stroke').style.background = "rgb(255,255,255)";
          improve = false;
          document.querySelector('#zoneAux').style.display = "none";
         }
      default:
    }
  } 
//If a click has been made in one of the colors in the color menu.//  
  else if(e.target.className == 'color'){
    color = e.target.getAttribute('name');
    document.querySelector('#blocking').style.display = "none";
    document.querySelector('#colors').style.display = "none";
    document.querySelector('#colors').style.zIndex = "2";
    jump();
    paintTheStar();
  }
//If a click has been made inside a canvas and the eraser is disabled.//
  else if(e.target.id == 'zone' && !erase){
    position = positionCalculator(zone, e);
    drawPoint(color, position.x, position.y, paper);
  } else if(e.target.id == 'zoneAux' && !erase){
    position = positionCalculator(zoneAux, e);
    drawPoint(color, position.x, position.y, paper);
  }
//If a click has been made inside a canvas and the eraser is enabled.//  
  else if(e.target.id == 'zone' && erase){
    position = positionCalculator(zone, e);
    paper.clearRect(position.x + 3, position.y + 3, -5, -5);
  } else if(e.target.id == 'zoneAux' && erase){
    position = positionCalculator(zoneAux, e);
    paper.clearRect(position.x + 3, position.y + 3, -5, -5); // 
  }
},false);

////Listeners waiting for the mouse be pressed, released or moved to draw or erase.////

//If the mouse is pressed and onhold inside a canvas.//  
document.querySelectorAll('.canvas').forEach(function(canvas){
  canvas.addEventListener('mousedown', function(e){
    e.stopPropagation();
    points.length = 0;
    strokes.length = 0;
    position = positionCalculator(zone, e);
    var x = position.x + 330;
    var y = position.y + 10;
    document.querySelector('#star').style.margin = `${y}px 0px 0px ${x}px`;
    draw();
    if(canvas.id == 'zone'){
      paper.beginPath();
    }else{
      paperAux.beginPath();
    }
    down = true;
  },false); 
});

//If the mouse is pressed, onhold and is moving inside a canvas.//  
document.querySelectorAll('.canvas').forEach(function(canvas){
  canvas.addEventListener('mousemove', function(e){
    e.stopPropagation();
    if(down == true && !erase){
      if(canvas.id == "zone"){
        position = positionCalculator(zone, e);
        drawLine(color, position.x, position.y, paper);
      }else{
        position = positionCalculator(zoneAux, e);
        drawLine(color, position.x, position.y, paperAux);
        points.push(position);
      }
    } else if(down == true && erase){
      if(canvas.id == "zone"){
        position = positionCalculator(zone, e);
        paper.clearRect(position.x + 3, position.y + 3, -5, -5);
      }else{
        position = positionCalculator(zoneAux, e);
        paper.clearRect(position.x + 3, position.y + 3, -5, -5);
      }
    }
  },false); 
});

//If the mouse go out a canvas with the button pressed.//
document.querySelectorAll('.canvas').forEach(function(canvas){
  canvas.addEventListener('mouseout', function(e){
    e.stopPropagation();
    if(down){
      down = false;
      Redraw();
    }
  },false);
});

//If the mouse is released inside a canvas.//  
document.querySelectorAll('.canvas').forEach(function(canvas){
  canvas.addEventListener('mouseup', function(e){
    e.stopPropagation();
    down = false;
    Redraw();
  },false);
});

//Listener to suggest the "d key" use//
document.body.addEventListener('mouseover', function(e){
  e.stopPropagation();
  if(e.target.getAttribute('id') == "delete"){
    document.querySelector('#instruction').setAttribute("glow","yes");
    document.querySelector('#instruction').style.display = "block"; 
  }
  else{
    document.querySelector('#instruction').setAttribute("glow","no");
    document.querySelector('#instruction').style.display = "none";
  }
},false);

////Other listeners.////

//If the "d - key" has been pressed to activate o deactivate the eraser pointer.//  
document.body.addEventListener('keydown', function(e){
  e.stopPropagation();
  if(e.keyCode == 68 && !erase){
  erase = true;
  paintTheStar();
  document.querySelector('#zone').setAttribute("eraser","yes");
  document.querySelector('#zoneAux').setAttribute("eraser","yes");
  }else if(e.keyCode == 68 && erase){
  erase = false;
  paintTheStar();
  document.querySelector('#zone').setAttribute("eraser","no");
  document.querySelector('#zoneAux').setAttribute("eraser","no");
  }
},false);
 
// FUNCTIONS========================================================================

//// Functions that adds atributes to trigger animations.////

//Function used to create jumping effect on Color Swift button.//
function jump(){
document.querySelector('#change').setAttribute("jump", "yes");
document.querySelector('#change').style.background = color;
document.querySelector('#change').addEventListener('animationend', function(){
  document.querySelector('#change').setAttribute("jump", "no");
},false);
}

//Function used to create the cleaning board effect.//
function shake(){
document.querySelector('#backGround').setAttribute("shake","yes");  
document.querySelector('#zone').setAttribute("shake","yes");
document.querySelector('#zoneAux').setAttribute("shake","yes");
document.querySelector('#zoneAux').style.display = "block";
document.querySelector('#zone').addEventListener('animationend', function(){
  //Cleaning the board.
  paper.clearRect(0, 0, zone.width, zone.height);
  if(!improve){
    document.querySelector('#zoneAux').style.display = "none";
  }
  document.querySelector('#backGround').setAttribute("shake","no");
  document.querySelector('#zone').setAttribute("shake", "no");
  document.querySelector('#zoneAux').setAttribute("shake", "no");
},false);
}

//Function used to create the stars effect when we are drawing.//
function draw(){
document.querySelector('#star').setAttribute("draw", Math.floor((Math.random() * 3) + 1));    
document.querySelector('#star').style.display = "block";
document.querySelector('#star').addEventListener("animationend", function(){
  document.querySelector('#star').setAttribute("draw", "no");
  document.querySelector('#star').style.display = "none";
},false);
}

//// Functions that draw or calcuate in the canvas.////

//Calculate the position and overwrite the position object with all its new properties//
function positionCalculator(canvas , e){
let clientRect = canvas.getBoundingClientRect(); 
return{
  x: Math.round(e.clientX - clientRect.left),
  y: Math.round(e.clientY - clientRect.top),
  color: color,
  style: improve,
  } 
}

//Function that draws a point when the mouse clicks on a canvas.//
function drawPoint(color, x, y, canvas){
  canvas.lineJoin = "round";
  canvas.beginPath();
  canvas.strokeStyle = color;
  canvas.lineWidth = 3;
  canvas.moveTo(x, y);
  canvas.lineTo(x - 1, y - 1);
  canvas.stroke();
  canvas.closePath();
}

//Function that draws the line when the mouse clicks on a canvas.//
function drawLine(color, x, y, canvas){
canvas.lineJoin = "round";
canvas.strokeStyle = color;
canvas.lineWidth = 3;
canvas.lineTo(x,y);
canvas.stroke();
}

//Funtion in charge of redraw the stroke lines, it will check the content of points and strokes.//
function Redraw(){  
paperAux.clearRect(0, 0, zone.width, zone.height);  
reduceNumberOfPoints(5, points);
 for(var i = 0; i < strokes.length; i++){
    upgradeStroke(strokes[i]);
  }
}

//Function thar reduce the number of points in the array and push them in strokes.//
function reduceNumberOfPoints(n, array){
var newArray = [];
newArray[0] = array[0];
  for(var i = 0; i < array.length; i++){
    if(i % n == 0){
      newArray[newArray.length] = array[i];
    }  
  }
newArray[newArray.length - 1] = array[array.length - 1];
strokes.push(newArray);
}

//Funtion that will draw the improved line to the zone canvas from the strokes array.//
function upgradeStroke(ry){
  if(ry.length > 1){
    var lastPoint = ry.length - 1;
    paper.beginPath();
    paper.moveTo(ry[0].x, ry[0].y);
      for(i = 1; i < ry.length - 2; i++){
        paper.strokeStyle = ry[i].color;
        paper.lineWidth = 3;
        var cp = calculateControlPoint(ry, i, i + 1);
        paper.quadraticCurveTo(ry[i].x, ry[i].y, cp.x, cp.y);
      }
      paper.quadraticCurveTo(ry[lastPoint - 1].x, ry[lastPoint - 1].y, ry[lastPoint].x, ry[lastPoint].y); 
    paper.stroke();
  } 
}

//Funtion that calculate control points to be used in the quadraticCurveTo function.//
function calculateControlPoint(ry,a,b){
var cp = {}
cp.x = (ry[a].x + ry[b].x) / 2;
cp.y = (ry[a].y + ry[b].y) / 2;
return cp;
}

//This function how its name says, paints the star with the color variable.//
function paintTheStar(){
  if(!erase){
  document.querySelector('#star').style.background = color;
  document.querySelector('#star').style["box-shadow"] = `
  /*Edges*/
  5px 0px 0 0 ${color},10px 0px 0 0 ${color},15px 0px 0 0 ${color},20px 0px 0 0 ${color},25px 0px 0 0 ${color},
  25px -5px 0 0 ${color},
  30px -10px 0 0 ${color},30px -15px 0 0 ${color},
  35px -20px 0 0 ${color},37.5px -25px 0 0 ${color},
  40px -20px 0 0 ${color},45px -15px 0 0 ${color},
  45px -10px 0 0 ${color},
  50px -5px 0 0 ${color},50px 0px 0 0 ${color},55px 0px 0 0 ${color},60px 0px 0 0 ${color},65px 0px 0 0 ${color},70px 0px 0 0 ${color},
  75px 0px 0 0 ${color},
  75px 5px 0 0 ${color},
  70px 10px 0 0 ${color},
  65px 15px 0 0 ${color},
  60px 20px 0 0 ${color},60px 25px 0 0 ${color},
  65px 30px 0 0 ${color},65px 35px 0 0 ${color},
  70px 40px 0 0 ${color},70px 45px 0 0 ${color},
  75px 50px 0 0 ${color},
  75px 55px 0 0 ${color},70px 55px 0 0 ${color},65px 55px 0 0 ${color},
  60px 50px 0 0 ${color},55px 50px 0 0 ${color},
  50px 45px 0 0 ${color},45px 45px 0 0 ${color},
  40px 40px 0 0 ${color},35px 40px 0 0 ${color},
  30px 45px 0 0 ${color},25px 45px 0 0 ${color},
  20px 50px 0 0 ${color},15px 50px 0 0 ${color},
  10px 55px 0 0 ${color},5px 55px 0 0 ${color},0px 55px 0 0 ${color},
  0px 50px 0 0 ${color},
  5px 45px 0 0 ${color},5px 40px 0 0 ${color},
  10px 35px 0 0 ${color},10px 30px 0 0 ${color},
  15px 25px 0 0 ${color},15px 20px 0 0 ${color},
  10px 15px 0 0 ${color},
  5px 10px 0 0 ${color},
  0px 5px 0 0 ${color},

  /*filling*/
  35px -15px 0 0 ${color},40px -15px 0 0 ${color},
  35px -10px 0 0 ${color},40px -10px 0 0 ${color},
  30px -5px 0 0 ${color},35px -5px 0 0 ${color},40px -5px 0 0 ${color},45px -5px 0 0 ${color},
  30px 0px 0 0 ${color},35px 0px 0 0 ${color},40px 0px 0 0 ${color},45px 0px 0 0 ${color},
  5px 5px 0 0 ${color},10px 5px 0 0 ${color},15px 5px 0 0 ${color},20px 5px 0 0 ${color},25px 5px 0 0 ${color},30px 5px 0 0 ${color},35px 5px 0 0 ${color}
  ,40px 5px 0 0 ${color},45px 5px 0 0 ${color},50px 5px 0 0 ${color},55px 5px 0 0 ${color},60px 5px 0 0 ${color},65px 5px 0 0 ${color},70px 5px 0 0 ${color},
  10px 10px 0 0 ${color},15px 10px 0 0 ${color},20px 10px 0 0 ${color},25px 10px 0 0 ${color},30px 10px 0 0 ${color},35px 10px 0 0 ${color},40px 10px 0 0 ${color}
  ,45px 10px 0 0 ${color},50px 10px 0 0 ${color},55px 10px 0 0 ${color},60px 10px 0 0 ${color},65px 10px 0 0 ${color},
  15px 15px 0 0 ${color},20px 15px 0 0 ${color},25px 15px 0 0 ${color},30px 15px 0 0 ${color},35px 15px 0 0 ${color},40px 15px 0 0 ${color},45px 15px 0 0 ${color}
  ,50px 15px 0 0 ${color},55px 15px 0 0 ${color},60px 15px 0 0 ${color},
  20px 20px 0 0 ${color},25px 20px 0 0 ${color},30px 20px 0 0 ${color},35px 20px 0 0 ${color},40px 20px 0 0 ${color},45px 20px 0 0 ${color}
  ,50px 20px 0 0 ${color},55px 20px 0 0 ${color},
  20px 25px 0 0 ${color},25px 25px 0 0 ${color},30px 25px 0 0 ${color},35px 25px 0 0 ${color},40px 25px 0 0 ${color},45px 25px 0 0 ${color}
  ,50px 25px 0 0 ${color},55px 25px 0 0 ${color},
  15px 30px 0 0 ${color},20px 30px 0 0 ${color},25px 30px 0 0 ${color},30px 30px 0 0 ${color},35px 30px 0 0 ${color},40px 30px 0 0 ${color}
  ,45px 30px 0 0 ${color},50px 30px 0 0 ${color},55px 30px 0 0 ${color},60px 30px 0 0 ${color},
  15px 35px 0 0 ${color},20px 35px 0 0 ${color},25px 35px 0 0 ${color},30px 35px 0 0 ${color},35px 35px 0 0 ${color},40px 35px 0 0 ${color}
  ,45px 35px 0 0 ${color},50px 35px 0 0 ${color},55px 35px 0 0 ${color},60px 35px 0 0 ${color},
  10px 40px 0 0 ${color},15px 40px 0 0 ${color},20px 40px 0 0 ${color},25px 40px 0 0 ${color},30px 40px 0 0 ${color},45px 40px 0 0 ${color}
  ,50px 40px 0 0 ${color},55px 40px 0 0 ${color},60px 40px 0 0 ${color},65px 40px 0 0 ${color},
  10px 45px 0 0 ${color},15px 45px 0 0 ${color},20px 45px 0 0 ${color},50px 45px 0 0 ${color},55px 45px 0 0 ${color},60px 45px 0 0 ${color}
  ,65px 45px 0 0 ${color},
  5px 50px 0 0 ${color},10px 50px 0 0 ${color},65px 50px 0 0 ${color},70px 50px 0 0 ${color}
  `;
  }else{
  document.querySelector('#star').style.background = "white";
  document.querySelector('#star').style["box-shadow"] = `
  /*Edges*/
  5px 0px 0 0 white,10px 0px 0 0 white,15px 0px 0 0 white,20px 0px 0 0 white,25px 0px 0 0 white,
  25px -5px 0 0 white,
  30px -10px 0 0 white,30px -15px 0 0 white,
  35px -20px 0 0 white,37.5px -25px 0 0 white,
  40px -20px 0 0 white,45px -15px 0 0 white,
  45px -10px 0 0 white,
  50px -5px 0 0 white,50px 0px 0 0 white,55px 0px 0 0 white,60px 0px 0 0 white,65px 0px 0 0 white,70px 0px 0 0 white,
  75px 0px 0 0 white,
  75px 5px 0 0 white,
  70px 10px 0 0 white,
  65px 15px 0 0 white,
  60px 20px 0 0 white,60px 25px 0 0 white,
  65px 30px 0 0 white,65px 35px 0 0 white,
  70px 40px 0 0 white,70px 45px 0 0 white,
  75px 50px 0 0 white,
  75px 55px 0 0 white,70px 55px 0 0 white,65px 55px 0 0 white,
  60px 50px 0 0 white,55px 50px 0 0 white,
  50px 45px 0 0 white,45px 45px 0 0 white,
  40px 40px 0 0 white,35px 40px 0 0 white,
  30px 45px 0 0 white,25px 45px 0 0 white,
  20px 50px 0 0 white,15px 50px 0 0 white,
  10px 55px 0 0 white,5px 55px 0 0 white,0px 55px 0 0 white,
  0px 50px 0 0 white,
  5px 45px 0 0 white,5px 40px 0 0 white,
  10px 35px 0 0 white,10px 30px 0 0 white,
  15px 25px 0 0 white,15px 20px 0 0 white,
  10px 15px 0 0 white,
  5px 10px 0 0 white,
  0px 5px 0 0 white,

  /*filling*/
  35px -15px 0 0 white,40px -15px 0 0 white,
  35px -10px 0 0 white,40px -10px 0 0 white,
  30px -5px 0 0 white,35px -5px 0 0 white,40px -5px 0 0 white,45px -5px 0 0 white,
  30px 0px 0 0 white,35px 0px 0 0 white,40px 0px 0 0 white,45px 0px 0 0 white,
  5px 5px 0 0 white,10px 5px 0 0 white,15px 5px 0 0 white,20px 5px 0 0 white,25px 5px 0 0 white,30px 5px 0 0 white,35px 5px 0 0 white
  ,40px 5px 0 0 white,45px 5px 0 0 white,50px 5px 0 0 white,55px 5px 0 0 white,60px 5px 0 0 white,65px 5px 0 0 white,70px 5px 0 0 white,
  10px 10px 0 0 white,15px 10px 0 0 white,20px 10px 0 0 white,25px 10px 0 0 white,30px 10px 0 0 white,35px 10px 0 0 white,40px 10px 0 0 white
  ,45px 10px 0 0 white,50px 10px 0 0 white,55px 10px 0 0 white,60px 10px 0 0 white,65px 10px 0 0 white,
  15px 15px 0 0 white,20px 15px 0 0 white,25px 15px 0 0 white,30px 15px 0 0 white,35px 15px 0 0 white,40px 15px 0 0 white,45px 15px 0 0 white
  ,50px 15px 0 0 white,55px 15px 0 0 white,60px 15px 0 0 white,
  20px 20px 0 0 white,25px 20px 0 0 white,30px 20px 0 0 white,35px 20px 0 0 white,40px 20px 0 0 white,45px 20px 0 0 white
  ,50px 20px 0 0 white,55px 20px 0 0 white,
  20px 25px 0 0 white,25px 25px 0 0 white,30px 25px 0 0 white,35px 25px 0 0 white,40px 25px 0 0 white,45px 25px 0 0 white
  ,50px 25px 0 0 white,55px 25px 0 0 white,
  15px 30px 0 0 white,20px 30px 0 0 white,25px 30px 0 0 white,30px 30px 0 0 white,35px 30px 0 0 white,40px 30px 0 0 white
  ,45px 30px 0 0 white,50px 30px 0 0 white,55px 30px 0 0 white,60px 30px 0 0 white,
  15px 35px 0 0 white,20px 35px 0 0 white,25px 35px 0 0 white,30px 35px 0 0 white,35px 35px 0 0 white,40px 35px 0 0 white
  ,45px 35px 0 0 white,50px 35px 0 0 white,55px 35px 0 0 white,60px 35px 0 0 white,
  10px 40px 0 0 white,15px 40px 0 0 white,20px 40px 0 0 white,25px 40px 0 0 white,30px 40px 0 0 white,45px 40px 0 0 white
  ,50px 40px 0 0 white,55px 40px 0 0 white,60px 40px 0 0 white,65px 40px 0 0 white,
  10px 45px 0 0 white,15px 45px 0 0 white,20px 45px 0 0 white,50px 45px 0 0 white,55px 45px 0 0 white,60px 45px 0 0 white
  ,65px 45px 0 0 white,
  5px 50px 0 0 white,10px 50px 0 0 white,65px 50px 0 0 white,70px 50px 0 0 white
  `;
  }
}