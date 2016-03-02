
// SVG drawing area
var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 600 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
var formatDate = d3.time.format("%Y");

// X Scale
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// x axis enter
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")

var xAxisGroup = svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0," + height + ")");

// y axis enter
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var yAxisGroup = svg.append("g")
    .attr("class", "axis y-axis")
// FIFA world cup
var data,DATA;

// path for the line chart 
var path = svg.append("g").append("path")
	.attr("class", "line"); 

// default y-axis chart data
var selection = "GOALS";
    
// y axis label
var yLabel = svg.append("g")    
    .append("text")
    .attr("class", "axis_label")
    .attr("x", 10)
    .attr("y", 15)
    .attr("fill", "#aba7a7");

// y axis label
var xLabel = svg.append("g")    
    .append("text")
    .attr("class", "axis_label")
    .attr("x", width / 2 - 10)
    .attr("y", height + 40)
    .attr("fill", "#aba7a7")

// object containing formats for chart data labels
var labelFormat = {
		"GOALS": "Goals",
		"AVERAGE_GOALS": "Average Goals",
		"MATCHES": "Matches",
		"TEAMS": "Teams",
		"AVERAGE_ATTENDANCE": "Average Attendance"
	}
 
// x axis label
xLabel.text("Year");

  // Initialize data
loadData();

// Load CSV file
function loadData() {
	d3.csv("data/fifa-world-cup.csv", function(error, csv) {

		csv.forEach(function(d){
			// Convert string to 'date object'
			d.YEAR = formatDate.parse(d.YEAR);
			
			// Convert numeric values to 'numbers'
			d.TEAMS = +d.TEAMS;
			d.MATCHES = +d.MATCHES;
			d.GOALS = +d.GOALS;
			d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
			d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
			
		});

		// Store csv data in global variable
		data = csv;

		// Draw the visualization for the first time
		updateVisualization();
	});
}


// Render visualization
function updateVisualization() {

	// stores value of the selected chart data
	var selection = d3.select("#ranking-type").property("value");

	// stores value of the lower time bound
	var xMin = d3.select("#xMin").property("value");
	
	// stores value of the upper time bound
	var xMax = d3.select("#xMax").property("value");

	// filters data by time period
	DATA = data.filter( function(d) {     
		return (+formatDate(d.YEAR) >= xMin) && (+formatDate(d.YEAR) <= xMax)
	});

	// retrieves the max and min into an array		
	// x domain
	x.domain(d3.extent(DATA, function (d) {
		return d.YEAR;
	}));


	// y domain
	y.domain([0, d3.max(DATA, function(d) {
    	return d[selection];
    	})
	]);

	// line 
	var line = d3.svg.line()
	    .x(function(d) { return x(d.YEAR); })
	    .y(function(d) { return y(d[selection]); })
	    .interpolate("linear");

    // y axis label
    yLabel
    	.transition()
    	.delay(800)
    	.text(labelFormat[selection]);
    
    // updates path
    path
	    .transition()
	    .duration(800)
	    .attr("d", line(DATA)); 

	// stores edition and selected chart data on mouseover
	var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) { 
		return d.EDITION + "<br>" + labelFormat[selection] + ": " + d[selection]; 
	});

	// call mouse hover tooltip    
	svg.call(tip);

	// data join
    var circles = svg.selectAll("circle")
		.data(DATA)     
	
	// enter (initialize elements)	
	circles.enter().append("circle")
		.attr("class", "points")     
		.attr("r", 4.5)
		.attr("fill", "#9c9f61")
		.attr("stroke", "black")
		.attr("stroke-width", 1)

	// update (set properties)	
	circles
		.transition()
  		.duration(800)
		.attr("cy", function (d) {
			return (y(d[selection]));
		})     
		.attr("cx", function (d) {         
			return (x(d.YEAR));     
		});
		
	// event listeners for circles
	circles
		.on('mouseover', tip.show)
  		.on('mouseout', tip.hide)
  	
  	// exit for circles
	circles.exit().remove();

	// calls x axis
	xAxisGroup
    	.transition()
    	.duration(800)
    	.call(xAxis);
	
	// calls y axis
	yAxisGroup
    	.transition()
    	.duration(800)
    	.call(yAxis);
}


