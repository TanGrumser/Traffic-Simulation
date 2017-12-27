// Class: Vehicle
//
// History:
// 2017-12-24: HGR created
//-----------------------------------------------------------------------------

const ENGINE_BREAK = .5;

class Vehicle
  {
  constructor(lane)
    {
    //var aColors = ["red", "green", "yellow", "lightblue", "pink"];
    var isTruck = Math.random() > 0.8;

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
      this.speed       = (80 + Math.random() * 80)   / 3.6;
      this.maxSpeed    = (140 + Math.random() * 100) / 3.6;
      this.wantedSpeed = (80 + Math.random() * 160)  / 3.6; 
      this.maxAcceleration = Math.random() * 7.5 + 2,5;
      this.color  = "white";
      }

    this.pos   = this.width;
    this.lane = lane;
    this.safetyDistance = Math.random() * 1.2 + 0.8; //0.8 - 2.0 seconds
    this.aggresivity = Math.random(); 
    }

  // Get Speed
  //---------------------------------------------------------------------------

    getSpeed() {
      return this.speed;
    }

  // Get Safety Distance
  //---------------------------------------------------------------------------

    getSaftyDistance() {
      return this.speed;
    }

  // Advance time
  //---------------------------------------------------------------------------

  advance(dTime) {
    var optimalBreakingDistance;
    var hadToBreak = false;
    var preceeder =   route.getPreceding(this, 0);
    var realtiveSpeed = preceeder == null ? this.speed : this.speed - preceeder.getSpeed();
    var distanceToPreceeder  = preceeder == null ? 9999 : this.getDistanceTo(preceeder);

    if (distanceToPreceeder < 1000) { // the driver first noticed the preceder
      optimalBreakingDistance = .5 * realtiveSpeed * realtiveSpeed / ENGINE_BREAK + this.safetyDistance * this.speed;
      hadToBreak = true;
      //console.log("rSpeed: " + realtiveSpeed + "\ndistance: " + distanceToPreceeder + "\noptBDist:" + optimalBreakingDistance);

      if (distanceToPreceeder < this.speed * this.safetyDistance) {
          this.speed -= this.maxAcceleration;
      } else if (distanceToPreceeder < optimalBreakingDistance  && realtiveSpeed > 0) {
        this.speed -= ENGINE_BREAK;
      } else {
        hadToBreak = false;
      }
    } 

    if (!hadToBreak) {
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
      return other.pos - this.pos - other.length;
    }
  }