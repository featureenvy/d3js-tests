(function() {
  'use strict';

  window.Parking.Main =  {
      loadData: loadData
  }

  var parkingData = window.Parking.Data;
  var parkingPlot = window.Parking.Plot;

  var hour = 8
  var min = 35;
  var timeIncrement = 5;



  setInterval(loadData, 1000)

  function loadData() {
    var path = "parking_data_155" + createNextTimeString(hour, min) + ".json";
    parkingData.loadData(path, callback);

    var timeSpan = document.getElementById("time");
    timeSpan.innerHTML = "" + hour + ":" + min;

    advanceTime();
  }

  function callback(data) {
    parkingPlot.updatePlot(data);
  }

  function advanceTime() {
    var nextMin = (min + 5) % 60;
    var nextHour = hour;
    if(nextMin < timeIncrement) {
      nextHour += 1;
    }

    hour = nextHour;
    min = nextMin;
  }

  function createNextTimeString(hour, min) {
    var time = "";
    if(hour < 10) {
      time += "0";
    }
      time += hour;

    if(min < 10) {
      time += "0";
    }

    time += min;

    return time;
  }
}());
