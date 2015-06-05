(function() {
  'use strict';

  window.Parking.Main = {
    loadData: loadData
  }

  var parkingData = window.Parking.Data;
  var parkingPlot = window.Parking.Plot;

  var hour = 8
  var min = 35;
  var timeIncrement = 30;
  var intervalTime = 1000;

  var allData; // = parkingData.loadAllDataForDay(155);
  window.allData = allData;

  showData();

  function showData() {
    loadDataFromStorage();
    var i = 0,
      next;
    var dataPoint = {};
    var keys = d3.keys(window.allData);

    var interval = setInterval(function() {
      var key = keys[i];

      parkingPlot.updatePlot(window.allData[key]);
      updateTime(key);

      next = (i + timeIncrement) % keys.length;
      var nextKey = keys[next];
      dataPoint = parkingData.mergeData(window.allData[key], window.allData[nextKey]);
      i = next;
    }, intervalTime)
  }

  function storeDataIntoStorage() {
    if (localStorage.getItem("parking.allData") !== null) {
      console.log("parking.allData already set. Remove by hand first.");
    }
    localStorage.setItem("parking.allData", JSON.stringify(window.allData));
  }

  function loadDataFromStorage() {
    window.allData = JSON.parse(localStorage.getItem("parking.allData"));
  }

  // setInterval(loadData, 1000)
  //
  function loadData() {
    var path = "parking_data_155" + createNextTimeString(hour, min) + ".json";
    parkingData.loadData(path, callback);

    var timeSpan = document.getElementById("time");
    timeSpan.innerHTML = "" + hour + ":" + min;

    advanceTime();
  }

  function updateTime(filename) {
    var hour = filename.substring(16, 18);
    var min = filename.substring(18, 20);
    var timeSpan = document.getElementById("time");
    timeSpan.innerHTML = "" + hour + ":" + min;
  }

  function callback(data) {
    parkingPlot.updatePlot(data);
  }

  function advanceTime() {
    var nextMin = (min + 5) % 60;
    var nextHour = hour;
    if (nextMin < timeIncrement) {
      nextHour += 1;
    }

    hour = nextHour;
    min = nextMin;
  }

  function createNextTimeString(hour, min) {
    var time = "";
    if (hour < 10) {
      time += "0";
    }
    time += hour;

    if (min < 10) {
      time += "0";
    }

    time += min;

    return time;
  }
}());
