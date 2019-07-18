window.onload = () => {
   draw_map()
   draw_barplot()
   draw_linechart()
   draw_donutChart()
   draw_donutChartv2()

}


function draw_map(){
  var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(80)
  .center([0,0])
  .translate([width / 2, 300]);

// Data and color
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
  .await(ready);

function ready(error, topo) {

  let mouseOver = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black")
  }

  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent")
  }

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
    }

}


function draw_barplot(){
  var margin = {top: 10, right: 30, bottom: 20, left: 50},
  width_1 = 460 - margin.left - margin.right,
  height_1= 400 - margin.top - margin.bottom;

var svg_1 = d3.select("#barChart")
.append("svg")
  .attr("width", width_1 + margin.left + margin.right)
  .attr("height", height_1 + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv", function(data_1) {

// List of subgroups = header of the csv files
var subgroups_1 = data_1.columns.slice(1)

// value of the first column called group X axis
var groups_1 = d3.map(data_1, function(d){return(d.group)}).keys()

//X axis
var x_1 = d3.scaleBand()
    .domain(groups_1)
    .range([0, width_1])
    .padding([0.2])
svg_1.append("g")
  .attr("transform", "translate(0," + height_1 + ")")
  .call(d3.axisBottom(x_1).tickSize(0));



//Y axis
var y_1 = d3.scaleLinear()
  .domain([0, 40])
  .range([ height_1, 0 ]);
svg_1.append("g")
  .call(d3.axisLeft(y_1));

// Another scale for subgroup
var xSubgroup_1 = d3.scaleBand()
  .domain(subgroups_1)
  .range([0, x_1.bandwidth()])
  .padding([0.05])

//one color per subgroup
var color_1 = d3.scaleOrdinal()
  .domain(subgroups_1)
  .range(['#e41a1c','#377eb8','#4daf4a'])
console.log(function(d) { return subgroups_1.map(function(key) { return {key: key, value: d[key]}; }); })
// bars
svg_1.append("g")
  .selectAll("g")
  //loop group per group
  .data(data_1)
  .enter()
  .append("g")
    .attr("transform", function(d) { return "translate(" + x_1(d.group) + ",0)"; })
  .selectAll("rect")
  .data(function(d) { return subgroups_1.map(function(key) { return {key: key, value: d[key]}; }); })
  .enter().append("rect")
    .attr("x", function(d) { return xSubgroup_1(d.key); })
    .attr("y", function(d) { return y_1(d.value); })
    .attr("width", xSubgroup_1.bandwidth())
    .attr("height", function(d) { return height_1 - y_1(d.value); })
    .attr("fill", function(d) { return color_1(d.key); });

})
}


function draw_linechart(){
  // set the dimensions and margins
var margin = {top: 10, right: 30, bottom: 30, left: 60},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

var svg = d3.select("#lineChart")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/connectedscatter.csv",

function(d){
return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
},

function(data) {

//X axis date format
var x = d3.scaleTime()
  .domain(d3.extent(data, function(d) { return d.date; }))
  .range([ 0, width ]);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

//Y axis
var y = d3.scaleLinear()
  .domain( [8000, 9200])
  .range([ height, 0 ]);
svg.append("g")
  .call(d3.axisLeft(y));

svg.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 1.5)
  .attr("d", d3.line()
    .curve(d3.curveBasis) // Just add that to have a curve instead of segments
    .x(function(d) { return x(d.date) })
    .y(function(d) { return y(d.value) })
    )

var Tooltip = d3.select("#my_dataviz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

  // change the tooltip hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    Tooltip
      .html("Exact value: " + d.value)
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
  }

//points
svg
  .append("g")
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
    .attr("class", "myCircle")
    .attr("cx", function(d) { return x(d.date) } )
    .attr("cy", function(d) { return y(d.value) } )
    .attr("r", 8)
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})


}


function draw_donutChart(){
  var width = 450
    height = 450
    margin = 40


var radius = Math.min(width, height) / 2 - margin

// append the svg object
var svg = d3.select("#donutChart")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create data
var data = {a: 100, b: 60, c:180, d:7, e:12}

// color scale
var color = d3.scaleOrdinal()
  .domain(data)
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

// Compute the position of each group on the pie:
var pie = d3.pie()
  .value(function(d) {return d.value; })
var data_ready = pie(d3.entries(data))

// Build the pie chart
svg
  .selectAll('whatever')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(100)         //size of the donut hole
    .outerRadius(radius)
  )
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "black")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)
}

function draw_donutChartv2() {

  var width = 450
    height = 450
    margin = 40

var radius = Math.min(width, height) / 2 - margin


var svg = d3.select("#donutChart-v2")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
var data = {a: 15, b: 20, c:30, d:18}

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d"])
  .range(d3.schemeDark2);

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function(d) {return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positionning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

// Add the polylines between chart and labels:
svg
  .selectAll('allPolylines')
  .data(data_ready)
  .enter()
  .append('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
      var posA = arc.centroid(d) // line insertion in the slice
      var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
      var posC = outerArc.centroid(d); // Label position = almost the same as posB
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      return [posA, posB, posC]
    })

// Add the polylines between chart and labels:
svg
  .selectAll('allLabels')
  .data(data_ready)
  .enter()
  .append('text')
    .text( function(d) { console.log(d.data.key) ; return d.data.key } )
    .attr('transform', function(d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })

  
}


