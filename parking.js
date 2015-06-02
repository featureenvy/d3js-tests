(function() {
  'use strict';

  d3.xml("parking_data_1531741.xml", initialize);

  var containerDimensions = {
      width: 900,
      height: 400
    },
    margins = {
      top: 10,
      right: 20,
      bottom: 30,
      left: 60
    },
    chartDimensions = {
      width: containerDimensions.width - margins.left - margins.right,
      height: containerDimensions.height - margins.top - margins.bottom
    }

  function initialize(error, data) {
    var elements = cleanFeedForPlot(data);

    drawPlot(elements);
  }

  function drawPlot(parkingData) {

  }

  function cleanFeedForPlot(data) {
    var elementsPlusOtherStuff = data.children[0].children[0].children;
    var elementsWithoutStuff = cleanFeed(elementsPlusOtherStuff);
    var elements = extractInterestingInfo(elementsWithoutStuff);
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
        freeSpaces: extractFreeSpaces(status)
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
