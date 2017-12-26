//-----------------------------------------------------------------------------
// Traffic Simulation
//
// History:
// 2017-12-24: HGR created
//-----------------------------------------------------------------------------

"use strict";

var def =
  {
  elapsedTime: 0,                       // elapsed time in seconds
  dTime:       0.05,                    // 20 frames per second
  scale:       1.25,
  widthLane:   3.75,
  widthLine:   0.2,
  }

var route     = null;
var iTimer    = -1;

// Init
//-----------------------------------------------------------------------------

function init()
  {
  var canvas = document.getElementById("CANVAS");
  var cLanes = 3;
  var length = 1000;

  route = new Route(cLanes, length);

  canvas.width  = def.scale * length;
  canvas.height = def.scale * (cLanes + 1) * def.widthLane;

  onwheel = function(evt)
    {
    var handled = false;

    if (!evt.altKey && !evt.ctrlKey && !evt.shiftKey)
      {
      var dx = 0;

      if (evt.deltaY < 0)
        dx = -canvas.height;
      else if (evt.deltaY > 0)
        dx = canvas.height;

      canvas.parentNode.scrollLeft += dx;
      handled = true;
      }

    if (!evt.altKey && !evt.ctrlKey && evt.shiftKey)
      {
      if (evt.deltaY < 0)
        def.scale *= 1.25;
      else if (evt.deltaY > 0)
        def.scale /= 1.25;

      if (def.scale < 1)
        def.scale = 1;
      else if (def.scale > 8)
        def.scale = 8;

      canvas.width  = def.scale * route.getLength();
      canvas.height = def.scale * (route.getLaneCount() + 1) * def.widthLane;
      draw();
      handled = true;
      }

    if (handled)
      {
      evt.stopPropagation();
      evt.preventDefault();
      }
    }

  draw();

  route.addVehicle(new Vehicle(0));
  route.addVehicle(new Vehicle(1));
  route.addVehicle(new Vehicle(2));

  iTimer = setInterval(nextFrame, def.dTime * 1000);
  }

// Plus adds vehicle
//-----------------------------------------------------------------------------

function handlePlus()
  {
  var next;
  var vehicle = new Vehicle(0);

  route.addVehicle(vehicle);
  next = route.getPreceding(vehicle, 0);

  if (next != null)
    {
    var saftyDist = vehicle.getSaftyDistance();
    var dist      = next.pos - next.length - vehicle.pos;

    if (dist < saftyDist)
      {
      if (vehicle.speed > next.speed)
        vehicle.speed = next.speed;

      vehicle.pos = next.pos - next.length - saftyDist;
      }
    }

  if (iTimer == -1)
    iTimer = setInterval(nextFrame, def.dTime * 1000);
  }

// Pause/continue
//-----------------------------------------------------------------------------

function handlePause(evt)
  {
  if (iTimer == -1)
    {
    iTimer = setInterval(nextFrame, def.dTime * 1000);
    evt.target.innerHTML = "Pause";
    }
  else
    {
    clearInterval(iTimer);
    iTimer = -1;  
    evt.target.innerHTML = "Continue";
    }
  }

// Class: Route
//-----------------------------------------------------------------------------

class Route
  {
  // Constructor
  //---------------------------------------------------------------------------

  constructor(cLanes, lengthRoute)
    {
    this._aVehicles   = [];
    this._cLanes      = cLanes;
    this._lengthRoute = lengthRoute;
    }

  // Get vehicle count
  //---------------------------------------------------------------------------

  getVehicleCount(iIndex)
    {
    return(this._aVehicles.length);
    }

  // Get lane count
  //---------------------------------------------------------------------------

  getLaneCount(iIndex)
    {
    return(this._cLanes);
    }

  // Get vehicle count
  //---------------------------------------------------------------------------

  getLength()
    {
    return(this._lengthRoute);
    }

  // Get vehicle
  //---------------------------------------------------------------------------

  getVehicle(iIndex)
    {
    return(this._aVehicles[iIndex]);
    }

  // Add vehicle
  //---------------------------------------------------------------------------

  addVehicle(vehicle)
    {
    this._aVehicles.push(vehicle);

    return(this._aVehicles.length);
    }

  // Remove vehicle
  //---------------------------------------------------------------------------

  removeVehicle(iIndex)
    {
    this._aVehicles.splice(iIndex, 1);

    return(this._aVehicles.length);
    }

  // Get preceeder on given lane
  //---------------------------------------------------------------------------

  getPreceding(refVehicle, offLane)
    {
    var vehicle, dist;
    var result  = null;
    var distMin = Number.MAX_SAFE_INTEGER;
    var pos     = refVehicle.pos;
    var lane    = refVehicle.lane + offLane;

    for (let iVehicle = 0; iVehicle < this._aVehicles.length; iVehicle ++)
      {
      vehicle = this._aVehicles[iVehicle];

      if (vehicle === refVehicle)       // ignore ourself
        continue;

      if (vehicle.lane != lane)
        continue;

      dist = vehicle.pos - pos;
      if (dist < 0)
        continue;

      if (dist < distMin)
        {
        distMin = dist;
        result  = vehicle;
        }
      }

    return(result)
    }
  }

// Calculate and draw next frame
//-----------------------------------------------------------------------------

function nextFrame()
  {
  var vehicle;
  var iVehicle    = 0;
  var cVehicles   = route.getVehicleCount();
  var lengthRoute = route.getLength();

  def.elapsedTime += def.dTime;

  while (iVehicle < cVehicles)
    {
    vehicle = route.getVehicle(iVehicle);
    vehicle.advance(def.dTime);

    if (vehicle.pos - vehicle.length > lengthRoute)
      {
      cVehicles = route.removeVehicle(iVehicle);

      if (cVehicles == 0)
        {
        clearInterval(iTimer);
        console.log("Done after " + def.elapsedTime + " sec.");
        break;
        }

      continue;
      }

    iVehicle ++;
    }

  draw();
  }

// Draw route and vehicles
//-----------------------------------------------------------------------------

function draw()
  {
  var canvas    = document.getElementById("CANVAS");
  var ctx       = canvas.getContext("2d");
  var cVehicles = route.getVehicleCount();

  ctx.save();
  ctx.scale(def.scale, def.scale);

  drawRoute(ctx);
  for (let iVehicle = 0; iVehicle < cVehicles; iVehicle ++)
    drawVehicle(ctx, route.getVehicle(iVehicle));

  ctx.restore();
  }

// Draw the route
//-----------------------------------------------------------------------------

function drawRoute(ctx)
  {
  var y;
  var cLanes = route.getLaneCount();
  var cx     = route.getLength();
  var cy     = (cLanes + 1) * def.widthLane;

  ctx.beginPath();
  ctx.rect(0, 0, cx, cy);
  ctx.fillStyle = "rgb(20, 20, 20)";
  ctx.fill();

  ctx.lineWidth   = def.widthLine;
  ctx.strokeStyle = "rgb(200, 200, 200)";
  
  // draw the border lines

  ctx.setLineDash([]);
  ctx.beginPath();

  y = def.widthLine / 2;
  ctx.moveTo(0, y);
  ctx.lineTo(cx, y);

  y = cLanes * def.widthLane - def.widthLine / 2;
  ctx.moveTo(0, y);
  ctx.lineTo(cx, y);
  ctx.stroke();

  // draw the white lines 

  ctx.setLineDash([6, 6])
  ctx.beginPath();

  for (let iLane = 1; iLane < cLanes; iLane ++)
    {
    y = def.widthLane * iLane;
    ctx.moveTo(0, y);
    ctx.lineTo(cx, y);  
    }

  ctx.stroke();
  }

// Draw single vehicle
//-----------------------------------------------------------------------------

function drawVehicle(ctx, vehicle)
  {
  var y = (route.getLaneCount() - 1 - vehicle.lane) * def.widthLane + def.widthLane / 2;
  var x = vehicle.pos - vehicle.length;

  ctx.beginPath();
  ctx.fillStyle = vehicle.color;
  ctx.rect(x, y - vehicle.width / 2, vehicle.length, vehicle.width);
  ctx.fill();
  }