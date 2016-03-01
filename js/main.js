
// SVG drawing area

var margin = {top: 40, right: 10, bottom: 60, left: 60};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Scales
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);
var y = d3.scale.linear()
    .range([height, 0]);

// x Axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// y axis label
var yLabel = svg.append("g")    
    .append("text")
    .attr("class", "axis_label")
    .attr("x", -10)
    .attr("y", -10)
    .attr("fill", "#aba7a7");

// y axis label
var xLabel = svg.append("g")    
    .append("text")
    .attr("class", "axis_label")
    .attr("x", width / 2 - 10)
    .attr("y", height + 40)
    .attr("fill", "#aba7a7")

// Initialize data
loadData();

// Coffee chain data
var data;

// Load CSV file
function loadData() {
	d3.csv("data/coffee-house-chains.csv", function(error, csv) {

		csv.forEach(function(d){
			d.revenue = +d.revenue;
			d.stores = +d.stores;
		});

		// Store csv data in global variable
		data = csv;

    // Draw the visualization for the first time
		updateVisualization();
	});
}

// Render visualization
function updateVisualization() {

	// stores value of the selected value
	var rankSelect = d3.select("#ranking-type").property("value");

	// sorts bars by selected rank type
	var barSort = data.sort(function(a,b) {
		return b[rankSelect] - a[rankSelect];
	});
	
	// sets the domain for the axes
	x.domain(barSort.map(function(d) { 
		return d.company; 
	}));
	y.domain([0, d3.max(barSort, function(d) {
        return d[rankSelect];
    	})
	]);
    console.log(y.domain())
    
    // appends class and calls x-axis    
    xAxisGroup = svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + height + ")");
    svg.select(".x-axis")
    	.transition()
    	.call(xAxis);

    // appends class and calls y-axis
    yAxisGroup = svg.append("g")
        .attr("class", "axis y-axis")
    svg.select(".y-axis")
    	.transition()
    	.duration(800)
        .call(yAxis);

    // y axis label
    yLabel
        .transition()
        .duration(800)
        .text(rankSelect);
    
    // y axis label
    xLabel
        .transition()
        .delay(800)
        .text("Brands");

    // Data Join
    var bars = svg.selectAll("rect")
        .data(barSort)

    // initialize new elements
    bars.enter().append("rect")         
        .attr("class", "bar");
    
    // updates bars based on selection    
	bars
		.transition()
		.duration(800)
        .attr("x", function(d) { 
			return x(d.company); 
		}) 
		.attr("y", function(d) { 
			return y(d[rankSelect]); 
		}) 
		.attr("width", x.rangeBand()) 
		.attr("height", function(d) { 
			return height - y(d[rankSelect]); 
		});

	// exit
    bars.exit().remove()
}