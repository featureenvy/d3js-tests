(function() {
  'use strict';

  d3.xml("parking_data_1550829.json", "application/xml", initialize);

  var containerDimensions = {
      width: 1100,
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
    window.parkingData = elements;

    drawPlot(elements);
  }

  function drawPlot(parkingData) {
    var xScale = d3.scale.ordinal()
      .domain(parkingData.map(function(d) {
        return d.name;
      }))
      .rangeRoundPoints([0, chartDimensions.width]);

    var yScale = d3.scale.linear()
      .domain(d3.extent(parkingData.map(function(d) {
        return d.freeSpaces;
      })))
      .range([chartDimensions.height, 0]);

    var barWidth = (chartDimensions.width / xScale.range().length) - 1;
    var svg = appendSvg("#parkingPlot", containerDimensions, margins);
    var nameAxis = appendNameAxis(svg, xScale, chartDimensions.height, barWidth);
    var bars = appendBars(svg, parkingData, xScale, yScale, chartDimensions.height, barWidth);

    window.updateData = function() {
      appendBars(svg, parkingData, xScale, yScale, chartDimensions.height, barWidth);
    }
  }

  function appendSvg(selector, containerDimensions, margins) {
    return d3.select(selector).append("svg")
      .attr("width", containerDimensions.width)
      .attr("height", containerDimensions.height)
      .append("g")
      .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
  }

  function appendNameAxis(element, xScale, height, barWidth) {
    var nameAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(d3.time.years, 10);

    element.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + height + ")")
      .call(nameAxis)
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90) translate(-20, " + -(barWidth) + ")")
  }

  function appendBars(svg, data, xScale, yScale, height, barWidth) {
    var bars = svg.selectAll(".bar")
      .data(data, function(d) {
        return d.name + " " + d.freeSpaces
      });

    // append new data
    var newGroups = bars.enter()
      .append("g")
      .attr("class", "bar")
      .attr("id", function(d) {
        return d.key;
      })
      .attr("transform", function(d) {
        return "translate(" + xScale(d.name) + "," + yScale(d.freeSpaces) + ")";
      });
    newGroups.append("rect")
      .attr("width", barWidth)
      .style("fill", "black");

    newGroups.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", barWidth / 2)
      .attr("text-anchor", "middle")

    // set height and params for old and new data
    bars
      .attr("data-free-spaces", function(d) {
        return d.freeSpaces;
      })
      .attr("transform", function(d) {
        return "translate(" + xScale(d.name) + "," + yScale(d.freeSpaces) + ")";
      }).each(function(d) {
        var elem = d3.select(this);
        
      });
    bars.selectAll("rect")
      .transition()
      .duration(3000)
      .attr("height", function(d) {
        return height - yScale(d.freeSpaces);
      })
      .style("fill", "black");

    bars.selectAll("text")
      .transition()
      .duration(3000)
      .tween("freeSpacesText", function(d) {
        var i = d3.interpolate(this.textContent, d.freeSpaces);
        return function(t) {
          this.textContent = Math.round(i(t));
        }
      })

    // remove old data
    bars.exit()
      .remove();
  }

  function updateBars(bars, xScale, yScale, height, barWidth) {

  }

  function cleanFeedForPlot(data) {
    var elementsPlusOtherStuff = data.children[0].children[0].children;
    var elementsWithoutStuff = cleanFeed(elementsPlusOtherStuff);
    var elements = extractInterestingInfo(elementsWithoutStuff);

    return elements;
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
