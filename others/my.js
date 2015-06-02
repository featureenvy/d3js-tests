(function() {
  'use strict';
  window.draw = draw;
  window.drawPlaza = drawPlaza;
  window.accidentStats = accidentStats;
  window.drawTurnstileTraffic = drawTurnstileTraffic;

  function draw(data) {
    d3.select("#serviceStatus")
      .append("ul")
      .selectAll("li")
      .data(data)
      .enter()
      .append("li")
      .text(function(d) {
        return d.name + ": " + d.status;
      });

    d3.selectAll("li")
      .style("font-weight", function(d) {
        if (d.status == "GOOD SERVICE") {
          return "normal";
        } else {
          return "bold"
        }
      });
  }

  function drawPlaza(data) {
    d3.select("#plazaTraffic")
      .append("div")
      .attr("class", "chart")
      .selectAll("div.line")
      .data(data.cash)
      .enter()
      .append("div")
      .attr("class", "line");

    d3.selectAll("div.line")
      .append("div")
      .attr("class", "label")
      .text(function(d) {
        return d.name;
      });

    d3.selectAll("div.line")
      .append("div")
      .attr("class", "bar")
      .style("width", function(d) {
        return d.count / 100 + "px"
      })
      .text(function(d) {
        return Math.round(d.count);
      });
  }

  function accidentStats(data) {
    var margin = 50,
      width = 700,
      height = 300;

    var x_extent = d3.extent(data, function(d) {
      return d.collision_with_injury;
    });
    var x_scale = d3.scale.linear()
      .range([margin, width - margin])
      .domain(x_extent);
    var x_axis = d3.svg.axis().scale(x_scale);

    var y_extent = d3.extent(data, function(d) {
      return d.dist_between_fail;
    });
    var y_scale = d3.scale.linear()
      .range([height - margin, margin])
      .domain(y_extent);
    var y_axis = d3.svg.axis().scale(y_scale).orient("left");

    d3.select("#accidentStats")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle");

    d3.selectAll("circle")
      .attr("cx", function(d) {
        return x_scale(d.collision_with_injury);
      })
      .attr("cy", function(d) {
        return y_scale(d.dist_between_fail)
      });

    d3.selectAll("circle")
      .attr("r", 5);

    d3.select("svg")
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + (height - margin) + ")")
      .call(x_axis);

    d3.select("svg")
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin + ", 0)")
      .call(y_axis);

    d3.select(".x.axis")
      .append("text")
      .text("collisions with injury (per million miles)")
      .attr("x", (width / 2) - margin)
      .attr("y", margin / 1.5);

    d3.select(".y.axis")
      .append("text")
      .text("mean distance between failures (miles)")
      .attr("transform", "rotate(-90, -43, 0) translate(-280)");
  }

  function drawTurnstileTraffic(data) {
    var margin = 40,
      width = 700 - margin,
      height = 300 - margin;

    d3.select("#turnstileTraffic")
      .append("svg")
      .attr("width", width + margin)
      .attr("height", height + margin)
      .append("g")
      .attr("class", "chart");

    d3.select("#turnstileTraffic svg")
      .selectAll("circle.times_square")
      .data(data.times_square)
      .enter()
      .append("circle")
      .attr("class", "times_square");

    d3.select("#turnstileTraffic svg")
      .selectAll("circle.grand_central")
      .data(data.grand_central)
      .enter()
      .append("circle")
      .attr("class", "grand_central");

    var count_extent = d3.extent(data.times_square.concat(data.grand_central), function(d) {
      return d.count;
    });
    var count_scale = d3.scale.linear()
      .domain(count_extent)
      .range([height, margin]);

    d3.selectAll("#turnstileTraffic circle")
      .attr("cy", function(d) {
        return count_scale(d.count);
      });

    var time_extent = d3.extent(data.times_square.concat(data.grand_central), function(d) {
      return d.time;
    });
    var time_scale = d3.time.scale()
      .domain(time_extent)
      .range([margin, width]);

    d3.selectAll("#turnstileTraffic circle")
      .attr("cy", function(d) {
        return count_scale(d.count);
      })
      .attr("cx", function(d) {
        return time_scale(d.time);
      })
      .attr("r", 3);

    var time_axis = d3.svg.axis()
      .scale(time_scale);
    d3.select("#turnstileTraffic svg")
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + height + ")")
      .call(time_axis);

    var count_axis = d3.svg.axis()
      .scale(count_scale)
      .orient("left");
    d3.select("#turnstileTraffic svg")
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin + ", 0)")
      .call(count_axis);

    var line = d3.svg.line()
      .x(function(d) {
        return time_scale(d.time);
      })
      .y(function(d) {
        return count_scale(d.count);
      });

    d3.select("#turnstileTraffic svg")
      .append("path")
      .attr("d", line(data.times_square))
      .attr("class", "times_square");

    d3.select("#turnstileTraffic svg")
      .append("path")
      .attr("d", line(data.grand_central))
      .attr("class", "grand_central");

    d3.select("#turnstileTraffic .y.axis")
      .append("text")
      .text("mean number of turnstile revolutions")
      .attr("transform", "rotate(90, " + margin + ", 0)")
      .attr("x", 20)
      .attr("y", 0);

    d3.select("#turnstileTraffic .x.axis")
      .append("text")
      .text("time")
      .attr("x", function() {
        return (width / 1.6) - margin
      })
      .attr("y", margin / 1.5);
  }
}());
