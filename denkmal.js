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
    var cleanedData = removeInvalidDates(data);

    var nest = d3.nest()
      .key(function(d) {
        return Math.floor(d.properties.Baujahr / yearBinSize);
      })
      .key(function(d) {
        return d.properties.Schutzstatus;
      })
      .entries(cleanedData);
    var years = extractAllYears(nest);
    var yearExtent = d3.extent(years);
    var xScale = d3.time.scale()
      .domain(yearExtent)
      .range([0, chartDimensions.width]);
    var yScale = d3.scale.linear()
      .range([chartDimensions.height, 0])
      .domain([0, d3.max(nest, function(nestEntry) {
        return countObjectsInYearGroup(nestEntry);
      })]);

    var numberOfElements = (yearExtent[1].getYear() - yearExtent[0].getYear()) / 10;
    var barWidth = calculateBarWidth(chartDimensions.width, numberOfElements);

    var svg = appendSvg("#newChart", containerDimensions, margins);

    var timeAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(d3.time.years, 10);
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + chartDimensions.height + ")")
      .call(timeAxis)
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90) translate(-20, " + -(barWidth) + ")")

    d3.select("path.domain")
      .attr("transform", "translate(" + barWidth / 2 + ")");
    d3.selectAll(".tick")
      .attr("width", barWidth);
    d3.selectAll(".tick line")
      .attr("transform", "translate(" + barWidth / 2 + ")");

    var bars = svg.selectAll(".bar")
      .data(nest)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) {
        return "translate(" + xScale(new Date("" + d.key + "0", 0, 1)) + "," + yScale(countObjectsInYearGroup(d)) + ")";
      });

    bars.append("rect")
      .attr("width", barWidth)
      .attr("height", function(d) {
        return chartDimensions.height - yScale(countObjectsInYearGroup(d));
      });

    ///////////////////////////////////////////
    // OLD
    ///////////////////////////////////////////

    // // x axis
    // var years = extractAllYearsOld(cleanedData);
    // var yearExtent = d3.extent(years, function(d) {
    //   return d;
    // });
    // var xScale = d3.time.scale()
    //   .domain(yearExtent)
    //   .range([0, chartDimensions.width]);
    //
    // // y axis
    // var histogram = d3.layout.histogram()
    //   .bins((yearExtent[1].getYear() - yearExtent[0].getYear()) / yearBinSize)(years);
    // var histoExtent = d3.extent(histogram, function(d) {
    //   return d.y;
    // });
    // var yScale = d3.scale.linear()
    //   .domain(histoExtent)
    //   .range([chartDimensions.height, 0]);
    //
    // var svg = appendSvg("body", containerDimensions, margins);
    // var bar = appendBars(svg, histogram, chartDimensions, xScale, yScale);
    //
    // var timeAxis = d3.svg.axis()
    //   .scale(xScale)
    //   .ticks(d3.time.years, 10);
    // svg.append("g")
    //   .attr("class", "x axis")
    //   .attr("transform", "translate(0, " + chartDimensions.height + ")")
    //   .call(timeAxis)
    //   .selectAll("text")
    //   .attr("transform", "rotate(-90) translate(-20)");


    // bar.append("text")
    //   .attr("dy", ".75em")
    //   .attr("y", 6)
    //   .attr("x", x(histogram[0].dx) / 2)
    //   .attr("text-anchor", "middle")
    //   .text(function(d) {
    //     return formatCount(d.y);
    //   });
  }

  function removeInvalidDates(data) {
    return data.features.filter(function(d) {
      return !Number.isNaN(Number.parseInt(d.properties.Baujahr));
    });
  }

  function extractAllYearsOld(data) {
    return data.map(function(d) {
      return new Date(Number.parseInt(d.properties.Baujahr), 0, 1);
    });
  }

  function extractAllYears(nest) {
    return nest.map(function(d) {
      return new Date("" + d.key + "0", 0, 1);
    });
  }

  function appendSvg(selector, containerDimensions, margins) {
    return d3.select(selector).append("svg")
      .attr("width", containerDimensions.width)
      .attr("height", containerDimensions.height)
      .append("g")
      .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
  }

  function appendBars(element, histogram, containerDimensions, xScale, yScale) {
    var bars = element.selectAll(".bar")
      .data(histogram)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function(d) {
        return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
      });

    var barWidth = calculateBarWidth(chartDimensions.width, bars.size());

    bars.append("rect")
      .attr("x", 1)
      .attr("width", barWidth)
      .attr("height", function(d) {
        return containerDimensions.height - yScale(d.y);
      });
  }

  function calculateBarWidth(containerWidth, numElements) {
    return (containerWidth / numElements) - 1;
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
}());
