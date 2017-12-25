// Class: Vehicle
//
// History:
// 2017-12-24: HGR created
//-----------------------------------------------------------------------------

class Vehicle
  {    
  constructor(lane)
    {
    //var aColors = ["red", "green", "yellow", "lightblue", "pink"];
    var isTruck = Math.random() > 0.8;

    this.index = route.getVehicleCount();
    this.lane = lane;

    if (isTruck)
      {
      this.length = 15;                 // m
      this.width  = 2.5;                // m
      this.speed       = (80 + Math.random() * 10) / 3.6;
      this.maxSpeed    = (80 + Math.random() * 40) / 3.6;
      this.wantedSpeed = (80 + Math.random() * 10) / 3.6;
      this.maxAcceleration = 2;
      this.color  = "yellow";
      }
    else
      {
      this.length = 5;                  // m
      this.width  = 1.8;                // m
      this.speed       = (80 + Math.random() * 80) / 3.6;
      this.maxSpeed    = Math.random() * 100 + 140; // 140 - 200
      this.wantedSpeed = (80 + Math.random() * 160) / 3.6; 
      this.maxAcceleration = Math.random() * 7.5 + 2,5;
      this.color  = "white";
      }

      this.safetyDistance = Math.random() * 1.2 + 0.8; //0.8 - 2.0 seconds
      this.aggresivity = Math.random(); 
    // set random color

    //this.color = aColors[Math.floor(Math.random() * aColors.length)];
    this.pos   = this.width;
    }

  // Get Speed
  //---------------------------------------------------------------------------

    getSpeed() {
      return this.speed;
    }

  // Advance time
  //---------------------------------------------------------------------------

  advance(dTime) {
    var preceeder =   route.getPreceederOf(this.index, 0);
    var distanceToPreceeder  = this.getDistanceTo(preceeder);

    if (distanceToPreceeder < this.speed / this.safetyDistance) {
      if (this.speed > preceeder.getSpeed())
        this.speed -= 1;
    } else {
     if (this.speed > this.wantedSpeed)
       this.speed -= (this.aggresivity * 0.8 + 0.2) * this.maxAcceleration;
      else if (this.speed < this.wantedSpeed)
       this.speed += (this.aggresivity * 0.8 + 0.2) * this.maxAcceleration;
    }




    this.pos += dTime * this.speed;
    }

  //Get Distance To Other Vehicle
  //---------------------------------------------------------------------------
    getDistanceTo(other) {
      return other.pos - this.pos;
    }
  }