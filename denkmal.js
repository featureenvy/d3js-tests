(function() {
  'use strict';
  d3.json("data/denkmalschutzobjekt.json", draw)

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
    },
    formatCount = d3.format(",.0f"),
    yearBinSize = 10;

  function draw(data) {
    var nest = prepareData(data);

    var years = extractAllYears(nest);
    var yearExtent = d3.extent(years);

    var numberOfElements = (yearExtent[1].getYear() - yearExtent[0].getYear()) / 10;
    var barWidth = calculateBarWidth(chartDimensions.width, numberOfElements);

    // setup scales
    var xScale = createXScale(yearExtent, chartDimensions.width);
    var yScale = createYScale(nest, chartDimensions.height);

    var svg = appendSvg("#newChart", containerDimensions, margins);
    var timeAxis = appendTimeAxis(svg, xScale, chartDimensions.height, barWidth)
    var bars = appendBars(svg, nest, xScale, yScale, chartDimensions.height, barWidth);
    var labels = appendLabels(bars, nest);
  }

  function prepareData(data) {
    var cleanedData = removeInvalidDates(data);
    var nest = d3.nest()
      .key(function(d) {
        return Math.floor(d.properties.Baujahr / yearBinSize);
      })
      .key(function(d) {
        return d.properties.Schutzstatus;
      })
      .entries(cleanedData);

    return nest;
  }

  function removeInvalidDates(data) {
    return data.features.filter(function(d) {
      return !Number.isNaN(Number.parseInt(d.properties.Baujahr));
    });
  }

  function extractAllYears(nest) {
    return nest.map(function(d) {
      return new Date("" + d.key + "0", 0, 1);
    });
  }

  function createXScale(extent, width) {
    var xScale = d3.time.scale()
      .domain(extent)
      .range([0, width]);

    return xScale;
  }

  function createYScale(data, height) {
    var yScale = d3.scale.linear()
      .domain([0, d3.max(data, function(nestEntry) {
        return countObjectsInYearGroup(nestEntry);
      })])
      .range([height, 0]);

    return yScale;
  }

  function countObjectsInYearGroup(nestEntry) {
    var count = 0;
    if (nestEntry.values[0]) {
      count += nestEntry.values[0].values.length;
    }

    if (nestEntry.values[1]) {
      count += nestEntry.values[1].values.length;
    }

    return count;
  }

  function appendTimeAxis(element, xScale, height, barWidth) {
    var timeAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(d3.time.years, 10);

    element.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + height + ")")
      .call(timeAxis)
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90) translate(-20, " + -(barWidth) + ")")

    // move labels and tick into the center of each bar
    d3.select("path.domain")
      .attr("transform", "translate(" + barWidth / 2 + ")");
    d3.selectAll(".tick line")
      .attr("transform", "translate(" + barWidth / 2 + ")");
  }

  function appendBars(svg, data, xScale, yScale, height, barWidth) {
    var bars = svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) {
        return "translate(" + xScale(new Date("" + d.key + "0", 0, 1)) + "," + yScale(countObjectsInYearGroup(d)) + ")";
      });

    bars.append("rect")
      .attr("width", barWidth)
      .attr("height", function(d) {
        return height - yScale(countObjectsInYearGroup(d));
      });
  }

  function appendSvg(selector, containerDimensions, margins) {
    return d3.select(selector).append("svg")
      .attr("width", containerDimensions.width)
      .attr("height", containerDimensions.height)
      .append("g")
      .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
  }

  function appendLabels(bars, data) {
    d3.selectAll(".bar")
      .on("mouseover", highlightBar)
      .on("mouseout", dehighlightBar);

    function highlightBar(d) {
      d3.select("#tooltip" + d.key).remove();

      d3.select(this)
        .append("text")
        .attr("id", "tooltip" + d.key)
        .attr("class", "tooltip")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0, -5)")
        .style("opacity", 0)
        .text("" + countObjectsInYearGroup(d) + " Objects")
        .transition(1000)
        .style("opacity", 1);

      d3.select(this).select("rect")
      .transition(1000)
        .style("fill", "red");
    };

    function dehighlightBar(d) {
      d3.select("#tooltip" + d.key).remove();
      d3.select(this).select("rect")
        .transition(1000)
        .style("fill", "steelblue");
    }
  }

  function calculateBarWidth(containerWidth, numElements) {
    return (containerWidth / numElements) - 1;
  }


}());
