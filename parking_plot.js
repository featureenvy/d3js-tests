(function() {
  'use strict';

  if (!window.Parking) {
    window.Parking = {};
  }

  window.Parking.Plot = {
    updatePlot: updatePlot
  };

  var containerDimensions = {
      width: 1100,
      height: 700
    },
    margins = {
      top: 30,
      right: 20,
      bottom: 300,
      left: 60
    },
    chartDimensions = {
      width: containerDimensions.width - margins.left - margins.right,
      height: containerDimensions.height - margins.top - margins.bottom
    },
    animationTime = 900;

  var svg, xScale, yScale, barWidth;
  var isInitialized = false;

  function updatePlot(elements) {
    if (!isInitialized) {
      initPlot(elements);
      isInitialized = true;
    }

    drawBars(svg, elements, xScale, yScale, chartDimensions.height, barWidth);
  }

  function initPlot(parkingData) {
    xScale = d3.scale.ordinal()
      .domain(parkingData.map(function(d) {
        return d.name;
      }))
      .rangeRoundPoints([0, chartDimensions.width]);

    yScale = d3.scale.linear()
      .domain([0, 1000])
      .range([chartDimensions.height, 0]);

    barWidth = (chartDimensions.width / xScale.range().length) - 1;
    svg = appendSvg("#parkingPlot", containerDimensions, margins);
    appendNameAxis(svg, xScale, chartDimensions.height, barWidth);
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
      .style("text-anchor", "end")
      .attr("transform", "rotate(-65) translate(-5, 0)")

    var nameGrid = nameAxis.orient("top")
      .tickSize(-chartDimensions.height, 0);

    element.append("g")
      .classed("x", true)
      .classed("grid", true)
      .call(nameGrid)
      .selectAll("line")
      .attr("transform", "translate(" + barWidth / 2 + ")");
  }

  function drawBars(svg, data, xScale, yScale, height, barWidth) {
    var bars = svg.selectAll(".bar")
      .data(data, function(d) {
        return d.name;
      });

    appendNewData(bars.enter(), height);
    updateBarHeight(bars, height, data);
    updateLabels(bars, height, data);

    bars.each(function(d) {
      var elem = d3.select(this);
      if (d.additionalFreeSpaces != 0) {
        //animateBars(elem);
        animateTransition(elem, d, height);
      }
    });

    bars.exit()
      .transition()
      .delay(animationTime)
      .duration(0)
      .remove();
  }

  function appendNewData(bars, height) {
    var newGroups = bars.append("g")
      .attr("class", "bar")
      .attr("id", function(d) {
        return d.key;
      })
      .attr("transform", function(d) {
        //return "translate(" + xScale(d.name) + "," + yScale(d.freeSpaces) + ")";
        return "translate(" + xScale(d.name) + ")";
      });
    newGroups.append("rect")
      .attr("width", barWidth)
      .style("fill", "black")
      .attr("class", "current-free-spaces");

    newGroups.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", barWidth / 2)
      .attr("text-anchor", "middle");
  }

  function updateBarHeight(bars, height, data) {
    // set X direction first so it isn't transitioned.
    bars.attr("transform", function(d) {
      return "translate(" + xScale(d.name) + "," + yScale(d.freeSpaces) + ")";
    });
    bars.selectAll("rect")
      .data(data, function(d) {
        return d.name;
      })
      .attr("height", function(d) {
        return height - yScale(d.freeSpaces);
      });
  }

  function updateLabels(bars, height, data) {
    var labels = bars.selectAll("text")
      .data(data, function(d) {
        return d.name;
      })
      .attr("transform", function(d) {
        var freeSpaceTop = (height - yScale(yScale.domain()[1] - d.freeSpaces));
        var textTopPadding = 20;
        return "translate(0, " + -(freeSpaceTop + textTopPadding) + ")";
      });

    animateLabels(labels);

  }

  function animateLabels(labels) {
    labels.transition()
      .duration(animationTime)
      .tween("freeSpacesText", function(d) {
        if (d.previousFreeSpaces === d.freeSpaces) {
          return function(t) {
            this.textContent = d.freeSpaces;
          }
        } else {
          var i = d3.interpolate(d.previousFreeSpaces, d.freeSpaces);
          return function(t) {
            this.textContent = Math.round(i(t));
          }
        }
      });
  }

  function animateBars(elem) {
    elem.select("rect")
      .style("fill", function(d) {
        if (d.additionalFreeSpaces > 0) {
          return "green";
        } else {
          return "red";
        }
      })
      .transition()
      .duration(animationTime / 2)
      .style("fill", "black");
  }

  function animateTransition(elem, d, height) {
    var fillerBar = addFillerBar(elem, d);
    animateBarBlink(fillerBar, d);
    var transition = animateBarShrink(fillerBar, d);
    animateRemoveFillerBars(transition);

    function addFillerBar(elem, d) {
      var rect = elem.insert("rect", "text")
        .attr("class", "transition-bar")
        .attr("transform", function() {
          if (d.additionalFreeSpaces > 0) {
            return "translate(0,  0)";
          } else {
            return "translate(0,  " + -(height - yScale(Math.abs(d.additionalFreeSpaces))) + ")";
          }
        })
        .attr("width", barWidth)
        .attr("height", function() {
          return height - yScale(Math.abs(d.additionalFreeSpaces));
        })
        .style("fill", "black")
        .attr("class", function(d) {
          if (d.additionalFreeSpaces > 0) {
            return "more-free-spaces";
          } else {
            return "less-free-spaces";
          }
        });

      return rect;
    }

    function animateBarBlink(elem, d) {
      return elem.transition()
        .duration(1)
        .style("fill", function() {
          if (d.additionalFreeSpaces > 0) {
            return "green";
          } else {
            return "red";
          }
        });
    }

    function animateBarShrink(elem, d) {
      return elem.transition()
        .duration(animationTime / 2)
        .delay(animationTime / 2)
        .ease("linear")
        .attr("height", 0)
        .attr("transform", function() {
          if (d.additionalFreeSpaces > 0) {
            return "translate(0, 0)";
          } else {
            return "translate(0, 0)";
          }
        });
    }

    function animateRemoveFillerBars(transition) {
      transition.each("end", function(d) {
        var fillerRect = d3.select(this);
        fillerRect.remove();
      });
    }
  }
}());
