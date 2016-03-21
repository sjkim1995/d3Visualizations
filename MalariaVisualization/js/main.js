// SVG drawing area
var margin = {top: 40, right: 40, bottom: 60, left: 60};

// width and height with margins
var width = 800 - margin.right - margin.left,
    height = 700 - margin.top - margin.bottom;

// drawing space for the choropleth
var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// drawing space for the tree diagram
var svg2 = d3.select("#chart-area2").append("svg")
    .attr("width", width)
    .attr("height", height)
	.append("g")
		.attr("transform", "translate(" + (-40) + "," + margin.top + ")");

// declaring the type of map projection and attributes
var projection = d3.geo.mercator()  
	.translate([100, 280])
	.scale([400]);

// path for the map projection
var path = d3.geo.path()     
	.projection(projection);

// domain for At_risk and At_high_risk values
var riskDomain = [25, 50, 75, 100];

// domain for UN population data
var populationDomain = [5000000, 10000000, 15000000, 200000000];

// initialize objects for country code and data
var riskID = {};
var highRiskID = {};
var populationID = {};

// domain for color keys
var riskColorDomainKey = [0, 25, 50, 75, 100];
var populationColorDomainKey = [0, 5000000, 10000000, 15000000, 200000000];

// labels for the color legend
var riskLabels = ["0-24%", "25-49%", "50-74%", "75-99%", "100%"];
var populationLabels = ["<50,000,000", "<100,000,000", "<150,000,000", "<200,000,000", ">200,000,000"];

loadData();

function loadData() {
	queue()
		.defer(d3.csv, "data/global-malaria-2015.csv")
		.defer(d3.json, "data/africa.topo.json")
		.await(updateVisualization)
};

function updateVisualization(error, malaria, map) {
	
	// create a copy of the data passed in
	var data = malaria;
	
	// filters out non-African nations
	var filtered = data.filter(function (d) {
		return d.WHO_region == "African";

	});

	// check the filtered data
	console.log(filtered);

	var suspectedCases = {};
	var country = {};
	var malariaCases = {};

	// converts strings to numbers
	filtered.forEach(function(d, i) {
		riskID[d.Code] = +d.At_risk;
		highRiskID[d.Code] = +d.At_high_risk;
		populationID[d.Code] = +d.UN_population;
		suspectedCases[d.Code] = d.Suspected_malaria_cases;
		country[d.Code] = d.Country;
		malariaCases[d.Code] = d.Malaria_cases;
	});

	console.log(suspectedCases);
	// converts the map from topo to GeoJson
	var converted = topojson.feature(map, map.objects.collection).features;

	// retrieves the value selected in the combobox
	var selection = d3.select("#combobox").property("value");

	// arrays to store the domains and label values based on the selection
	var colorDomain = [];
	var domainVal = [];
	var legendVals = [];

	// sets the domains and labels based on the combobox selection
	if (selection == "atRisk" || selection == "atHighRisk")
	{
		domainVal = riskDomain;
		colorDomain = riskColorDomainKey;
		legendVals = riskLabels;
	}
	else
	{
		domainVal = populationDomain;
		colorDomain = populationColorDomainKey;
		legendVals = populationLabels;
	}

	// color threshold scale
	var color = d3.scale.threshold()
	    .domain(domainVal)
	    .range(["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"]);

	// declare tooltip that diplsays information about each country
	var tip = d3.tip().attr('class', 'd3-tip').offset([10, 0]).html(function(d,i) { 
		
		if (country[d.properties.adm0_a3_is])
		{
			return country[d.properties.adm0_a3_is] + "<br>Malaria Cases: " +  malariaCases[d.properties.adm0_a3_is]
			+ "<br>Suspected Cases: " +  suspectedCases[d.properties.adm0_a3_is]+ "<br>Population: " +  populationID[d.properties.adm0_a3_is];
		}
		else 
			return "No Data Available";
	});

	// call mouse hover tooltip    
	svg.call(tip);

		// add rectangles for the color legend
	svg.selectAll("rect")     
		.data(colorDomain)     
		.enter()     
		.append("rect")     
		.attr("fill", function (d) {
			return color(d);
		})     
		.attr("width", 25)     
		.attr("height", 25) 
		.attr("stroke", "black")
		.attr("stroke-width", 1)     
		.attr("x", 30)     
		.attr("y", function(d, index) {         
			return (index * 25) + 350;     
		});

	// adds the labels for the color boxes in the legend
	var legendLabels = svg.selectAll("legendLabels")	
		.data(riskLabels)     
		.enter()  
		.append ("text")
		.transition()
		.text(function(d, i) {
	   		return riskLabels[i];
	   	})
		.attr("x", 60)     
		.attr("y", function(d, index) {         
			return (index * 25) + 370; 
		});

	// renders map of Africa by using the path generator     
	svg.append("g")
     	.attr("class", "country")
		.selectAll("path")             
	    .data(converted)        
	    .enter().append("path")             
	    .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("fill", function(d) {
        	if (selection == "atRisk")
	        {
	        	if (isNaN(riskID[d.properties.adm0_a3_is])) 
	        		return "#808080";
	        	else
	        		return color(riskID[d.properties.adm0_a3_is]);
        	}
        	else if (selection =="atHighRisk")
        	{
        		if (isNaN(highRiskID[d.properties.adm0_a3_is])) 
	        		return "#808080";
	        	else
	        		return color(highRiskID[d.properties.adm0_a3_is]);
	        }
	       	else 
        	{
        		if (isNaN(populationID[d.properties.adm0_a3_is])) 
	        		return "#808080";
	        	else
	        		return color(populationID[d.properties.adm0_a3_is]);
	        }
        })
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);

	};

// declare a var to store the tree layout
var tree = d3.layout.tree()
	.size([750, 500]);

// variable to store the links
var lines = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

d3.json("data/malaria-parasites.json", function(error, para) {
	// set the root of the tree
	root = para[0];
	
	// call the functon that builds with the tree map
	treeMap(root);
	
	});

var level = 0;

function treeMap(source) {
	// set the tree layout
	var nodes = tree.nodes(root),
		links = tree.links(nodes);
	
	// Nodes
	var node = svg2.selectAll("g.node")
		.data(nodes, function(d) { return d.id || (d.id = ++level); })

	// Links
	var link = svg2.selectAll("path.link")
		.data(links, function(d) { return d.target.id; });
	
	// set the depth of each node
	nodes.forEach(function(d) { d.y = d.depth * 110; });
	
	// enter nodes
	var placeNodes = node.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; });
		placeNodes.append("text")
			.attr("y", function(d) { 
			  return level - 30;
			})
			.attr("text-anchor", "middle")
			.text(function(d) { return d.name; })
		placeNodes.append("circle");

	// enter links
	link.enter().insert("path", "g")
		.attr("class", "link")
		.attr("fill", "none")
		.attr("d", lines);
	
}

