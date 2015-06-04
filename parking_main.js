(function() {
  'use strict';

  window.Parking.Main =  {
      loadData: loadData
  }

  var parkingData = window.Parking.Data;
  var parkingPlot = window.Parking.Plot;

  var current = 1550831;
  var last = 1550859;



  setInterval(function() {
    loadData("parking_data_" + current + ".json");
    current += 1;
  }, 1000)

  function loadData() {
    var path = "parking_data_" + current + ".json";
    parkingData.loadData(path, callback);

    var timeSpan = document.getElementById("time");
    timeSpan.innerHTML = current.toString().substring(3,7);

    current += 1;
  }

  function callback(data) {
    parkingPlot.updatePlot(data);
  }
}());
