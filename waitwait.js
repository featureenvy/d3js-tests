(function() {
  'use strict';

  d3.json("data/subway_wait_mean.json", waitWaitAaaandDraw);

  var timeScale, percentScale

  function waitWaitAaaandDraw(data) {
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
      };

    var chart = d3.select("#timeseries")
      .append("svg")
      .attr("width", containerDimensions.width)
      .attr("height", containerDimensions.height)
      .append("g")
      .attr("transform", "translate(" + margins.left + ", " + margins.top + ")")
      .attr("id", "chart");

    timeScale = d3.time.scale()
      .range([0, chartDimensions.width])
      .domain([new Date(2009, 0, 1), new Date(2011, 3, 1)]);

    percentScale = d3.scale.linear()
      .range([chartDimensions.height, 0])
      .domain([65, 90]);

    var timeAxis = d3.svg.axis()
      .scale(timeScale);
    var countAxis = d3.svg.axis()
      .scale(percentScale)
      .orient("left");

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + chartDimensions.height + ")")
      .call(timeAxis);

    chart.append("g")
      .attr("class", "y axis")
      .call(countAxis);

    d3.select(".y.axis")
      .append("text")
      .attr("text-anchor", "middle")
      .text("percent on time")
      .attr("transform", "rotate(-270, 0, 0)")
      .attr("x", containerDimensions.height / 2)
      .attr("y", 50);

    var keyItems = d3.select("#key")
      .selectAll("div")
      .data(data)
      .enter()
      .append("div")
      .attr("class", "key_line")
      .attr("id", function(d) {
        return d.line_id
      });

    keyItems.append("div")
      .attr("id", function(d) {
        return "key_square_" + d.line_id
      })
      .attr("class", function(d) {
        return "key_square " + d.line_id
      });

    keyItems.append("div")
      .attr("class", "key_label")
      .text(function(d) {
        return d.line_name
      });

    d3.selectAll(".key_line")
      .on("click", get_timeseries_data);
  }

  function get_timeseries_data() {
    var id = d3.select(this).attr("id");
    var ts = d3.select("#" + id + "_path");

    if (ts.empty()) {
      d3.json("data/subway_wait.json", function(data) {
        var filtered_data = data.filter(function(d) {
          return d.line_id === id
        });
        draw_timeseries(filtered_data, id);
      });
    } else {
      ts.remove();
    }
  }

  function draw_timeseries(data, id) {
    var line = d3.svg.line()
      .x(function(d) {
        return timeScale(d.time)
      })
      .y(function(d) {
        return percentScale(d.late_percent)
      })
      .interpolate("linear");

    var g = d3.select("#chart")
      .append("g")
      .attr("id", id + "_path")
      .attr("class", function(d) {
        return "timeseries " + id
      });

    g.append("path")
      .attr("d", line(data));

    g.selectAll("circles")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return timeScale(d.time)
      })
      .attr("cy", function(d) {
        return percentScale(d.late_percent)
      })
      .attr("r", 0);

    g.selectAll("circle")
      .on("mouseover", function() {
        d3.select(this)
          .transition()
          .attr("r", 9)
      })
      .on("mouseout", function(d, i) {
        if (i !== data.length - 1) {
          d3.select(this)
            .transition()
            .attr("r", 5);
        }
      });

    var enterDuration = 1000;

    g.selectAll("circle")
      .on("mouseover.tooltip", function(d) {
        d3.select("text#" + d.line_id).remove();
        d3.select("#chart")
          .append("text")
          .text(d.late_percent + "%")
          .attr("x", timeScale(d.time) + 10)
          .attr("y", percentScale(d.late_percent) - 10)
          .attr("id", d.line_id);
      })
      .on("mouseout.tooltip", function(d) {
        d3.select("text#" + d.line_id)
          .transition()
          .duration(500)
          .style("opacity", 0)
          .attr("transform", "translate(10, -10)")
          .remove();
      });

    g.selectAll("circle")
      .transition()
      .delay(function(d, i) {
        return i / data.length * enterDuration
      })
      .attr("r", 5)
      .each("end", function(d, i) {
        if (i === data.length - 1) {
          add_label(this, d);
        }
      });
  }

  function add_label(circle, d) {
    d3.select(circle)
      .transition()
      .attr("r", 9);
    d3.select('#' + d.line_id + "_path")
      .append('text')
      .text(d.line_id.split("_")[1])
      .attr("x", timeScale(d.time))
      .attr("y", percentScale(d.late_percent))
      .attr("dy", "0.35em")
      .attr("class", "linelabel")
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .style("fill", "white")
      .transition()
      .style("opacity", 1);
  }
}());
