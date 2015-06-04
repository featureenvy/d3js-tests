(function() {
  'use strict';
  if (!window.Parking) {
    window.Parking = {};
  }

  var callback, previousData;

  window.Parking.Data = {
    loadData: loadData,
    loadAllDataForDay: loadAllDataForDay
  };

  function loadAllDataForDay(day) {
    var possibleFiles = [];
    for (var hour = 8; hour < 18; hour++) {
      for (var min = 0; min < 60; min++) {
        possibleFiles.push("parking_data_" + day + format(hour) + format(min) + ".xml");
      }
    }

    var allData = {};
    possibleFiles.forEach(function(fileName) {
      loadData(fileName, callbackWrapper(fileName))

      function callbackWrapper(fileName) {
        return function allCallback(error, data) {
          var cleanedData = cleanData(error, data);
          if (cleanedData) {
            allData[fileName] = cleanedData;
          }
        }
      }
    });

    return allData;
  }

  function loadData(path, cb) {
    if (!cb) {
      console.error("Callback not set, no data will be returned.");
      return;
    }

    callback = cb;

    d3.xml(path, "application/xml", cb);
  }

  function cleanData(error, data) {
    if (!data) {
      if (!previousData) {
        console.log("Have no current data nor previous data. Skipping.");
        return;
      }
      console.log("data could not be read. Working with old data");
      //callback(mergeData(previousData, previousData));
      return;
    }

    var elementsPlusOtherStuff = data.children[0].children[0].children;
    var elementsWithoutStuff = cleanFeed(elementsPlusOtherStuff);
    var newData = extractInterestingInfo(elementsWithoutStuff);
    var mergedData = mergeData(previousData, newData);

    previousData = mergedData;
    callback(mergedData);

    return mergedData;
  }

  function cleanFeed(elementsWithStuff) {
    var elementsWithoutStuff = [];
    for (var i = 0; i < elementsWithStuff.length; i++) {
      var element = elementsWithStuff[i];
      if (element.tagName === "item") {
        elementsWithoutStuff.push(element);
      }
    }

    return elementsWithoutStuff;
  }

  function extractInterestingInfo(dirtyElements) {
    return dirtyElements.map(function(e) {
      var nameAdress = e.getElementsByTagName("title")[0].innerHTML;
      var status = e.getElementsByTagName("description")[0].innerHTML;

      return {
        name: extractName(nameAdress),
        freeSpaces: extractFreeSpaces(status),
        additionalFreeSpaces: 0
      }
    });

    function extractName(nameAdress) {
      return nameAdress.split("/")[0].trim();
    }

    function extractFreeSpaces(status) {
      return Number.parseInt(status.split("/")[1].trim());
    }
  }

  function mergeData(previousData, nextData) {
    if (!previousData) {
      previousData = nextData; // so we can still initialize properly.
    }

    for (var i = 0; i < previousData.length; i++) {
      var previous = previousData[i];
      var next = nextData[i];

      next.previousFreeSpaces = previous.freeSpaces;
      next.additionalFreeSpaces = next.freeSpaces - previous.freeSpaces;
    }

    return nextData;
  }

  function format(time) {
    if (time < 10) {
      return "0" + time;
    } else {
      return time.toString();
    }
  }
}());
