(function() {
  'use strict';

  var parkingData = window.Parking.Data(callback);
  var parkingPlot = window.Parking.Plot();

  d3.xml("parking_data_1550829.json", "application/xml", parkingData.loadData);

  function callback(data) {
    parkingPlot.updatePlot(data);
  }
}());
