(function() {
  'use strict';
  if(!window.Parking) {
    window.Parking = {};
  }

  var callback;

  window.Parking.Data = function(cb) {
    if(!cb) {
      error("Needs a callback to give back the data.");
    }

    callback = cb;

    return {
      loadData: loadData
    }
  };

  function loadData(error, data) {
    var elementsPlusOtherStuff = data.children[0].children[0].children;
    var elementsWithoutStuff = cleanFeed(elementsPlusOtherStuff);
    var elements = extractInterestingInfo(elementsWithoutStuff);

    return callback(elements);
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
}());
