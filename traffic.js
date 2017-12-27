//-----------------------------------------------------------------------------
// Traffic Simulation
//
// History:
// 2017-12-24: HGR created
//-----------------------------------------------------------------------------

"use strict";

var def =
  {
  scale: 1.25,
  }

var route = null;                       // global route object

// Init
//-----------------------------------------------------------------------------

function init()
  {
  var canvas = document.getElementById("CANVAS");
  var cLanes = 3;
  var length = 1000;

  route = new Route(cLanes, length);

  canvas.width  = def.scale * length;
  canvas.height = def.scale * (cLanes + 1) * route._widthLane;

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
      canvas.height = def.scale * (route.getLaneCount() + 1) * route._widthLane;
      route.draw();
      handled = true;
      }

    if (handled)
      {
      evt.stopPropagation();
      evt.preventDefault();
      }
    }

  route.draw();

  route.insertVehicle(new Vehicle(0));
  route.insertVehicle(new Vehicle(1));
  route.insertVehicle(new Vehicle(2));

  route.run();
  }

// Plus adds vehicle
//-----------------------------------------------------------------------------

function handlePlus()
  {
  route.addVehicle();
  route.run();
  }

// Pause/continue
//-----------------------------------------------------------------------------

function handlePause(evt)
  {
  if (route.isRunning())
    {
    evt.target.innerHTML = "\u23F5";
    route.pause();
    }
  else
    {
    evt.target.innerHTML = "\u23F8";
    route.run();
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
    this._cLanes       = cLanes;
    this._lengthRoute  = lengthRoute;
    this._aVehicles    = [];
    this._widthLane    = 3.75;
    this._widthLine    = 0.2;
    this._timerAdvance = -1;
    this._dTime        = 0.05;          // 20 frames per second
    this._elapsedTime  = 0;             // elapsed time in seconds
    }

  // Run the animation
  //---------------------------------------------------------------------------

  run()
    {
    if (this._timerAdvance == -1)
      {
      this._timerAdvance = setInterval(Route._nextFrame, this._dTime * 1000, this);
      }
    }

  // Pause the animation
  //---------------------------------------------------------------------------

  pause()
    {
    if (this._timerAdvance != -1)
      {
      clearInterval(this._timerAdvance);
      this._timerAdvance = -1;     
      }
    }

  // Pause the animation
  //---------------------------------------------------------------------------

  isRunning()
    {
    return(this._timerAdvance != -1)
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

  // Add new vehicle
  //---------------------------------------------------------------------------

  addVehicle()
    {
    var next;
    var lane    = 0;
    var vehicle = new Vehicle(lane);

    if (vehicle.speed > 180 / 3.6)
      lane = 2;
    else if (vehicle.speed > 100 / 3.6)
      lane = 1;

    vehicle.lane = lane;
    next = route.getFirst(lane);
    route.insertVehicle(vehicle);

    if (next != null)
      {
      var distSafty = vehicle.getSaftyDistance();
      var dist      = vehicle.getDistanceTo(next);

      if (dist < distSafty)
        vehicle.pos = next.pos - next.length - distSafty;
      }
    }

  // Insert given vehicle
  //---------------------------------------------------------------------------

  insertVehicle(vehicle)
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

  // Get first vehicle in lane
  //---------------------------------------------------------------------------

  getFirst(lane)
    {
    var vehicle;
    var result = null;
    var pos    = Number.MAX_SAFE_INTEGER;

    for (let iVehicle = 0; iVehicle < this._aVehicles.length; iVehicle ++)
      {
      vehicle = this._aVehicles[iVehicle];

      if (vehicle.lane != lane)
        continue;
      
      if (vehicle.pos < pos)
        {
        pos    = vehicle.pos;
        result = vehicle;
        }
      }

    return(result);
    }
    
  // Get preceder on given lane
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

  // Draw route and vehicles
  //---------------------------------------------------------------------------

  draw()
    {
    var canvas    = document.getElementById("CANVAS");
    var ctx       = canvas.getContext("2d");
    var cVehicles = this.getVehicleCount();

    ctx.save();
    ctx.scale(def.scale, def.scale);

    this._drawRoute(ctx);
    for (let iVehicle = 0; iVehicle < cVehicles; iVehicle ++)
      this._drawVehicle(ctx, route.getVehicle(iVehicle));

    ctx.restore();
    }

  // Draw the route
  //---------------------------------------------------------------------------

  _drawRoute(ctx)
    {
    var y;
    var cx = this._lengthRoute;
    var cy = (this._cLanes + 1) * this._widthLane;

    ctx.beginPath();
    ctx.rect(0, 0, cx, cy);
    ctx.fillStyle = "rgb(20, 20, 20)";
    ctx.fill();

    ctx.lineWidth   = this._widthLine;
    ctx.strokeStyle = "rgb(200, 200, 200)";
    
    // draw the border lines

    ctx.setLineDash([]);
    ctx.beginPath();

    y = this._widthLine / 2;
    ctx.moveTo(0, y);
    ctx.lineTo(cx, y);

    y = this._cLanes * this._widthLane - this._widthLine / 2;
    ctx.moveTo(0, y);
    ctx.lineTo(cx, y);
    ctx.stroke();

    // draw the white lines 

    ctx.setLineDash([6, 6])
    ctx.beginPath();

    for (let iLane = 1; iLane < this._cLanes; iLane ++)
      {
      y = this._widthLane * iLane;
      ctx.moveTo(0, y);
      ctx.lineTo(cx, y);  
      }

    ctx.stroke();
    }

  // Draw single vehicle
  //---------------------------------------------------------------------------

  _drawVehicle(ctx, vehicle)
    {
    var y = (this._cLanes- 1 - vehicle.lane) * this._widthLane + this._widthLane / 2;
    var x = vehicle.pos - vehicle.length;

    ctx.beginPath();
    ctx.fillStyle = vehicle.color;
    ctx.rect(x, y - vehicle.width / 2, vehicle.length, vehicle.width);
    ctx.fill();
    }

  // Calculate and draw next frame
  //---------------------------------------------------------------------------

  static _nextFrame(self)
    {
    var vehicle;
    var iVehicle  = 0;
    var cVehicles = self.getVehicleCount();

    self._elapsedTime += self._dTime;

    while (iVehicle < cVehicles)
      {
      vehicle = self.getVehicle(iVehicle);
      vehicle.advance(self._dTime);

      if (vehicle.pos - vehicle.length > self._lengthRoute)
        {
        cVehicles = self.removeVehicle(iVehicle);

        if (cVehicles == 0)
          {
          self.pause();
          console.log("Done after " + self._elapsedTime + " sec.");
          break;
          }

        continue;
        }

      iVehicle ++;
      }

    self.draw();
    }
  }