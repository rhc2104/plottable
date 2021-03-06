function makeData() {
  "use strict";

  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}];
  var data3 = [{name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Category().rangeType("points");
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var stackedAreaPlot = new Plottable.Plot.StackedArea(xScale, yScale)
                                         .attr("x", "name", xScale)
                                         .attr("y", "y", yScale)
                                         .attr("fill", "type", colorScale)
                                         .attr("type", "type")
                                         .attr("yval", "y")
                                         .addDataset("d1", data[0])
                                         .addDataset("d2", data[1])
                                         .addDataset("d3", data[2])
                                         .animate(true);

  var center = stackedAreaPlot.merge(new Plottable.Component.Legend(colorScale));

  var horizChart = new Plottable.Component.Table([
    [yAxis, center], [null, xAxis]
    ]).renderTo(svg);
}
