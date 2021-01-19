var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

function xScale(dataGroup, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(dataGroup, d => d[chosenXAxis]) * 0.8,
        d3.max(dataGroup, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

    return xLinearScale;
}

function yScale(dataGroup, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(dataGroup, d => d[chosenYAxis]) * 0.8,
        d3.max(dataGroup, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

function renderXAxis(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

d3.csv("/assets/data/data.csv").then((dataGroup) => {
    console.log(dataGroup);

    dataGroup.forEach((data) => {
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
    });

    var xLinearScale = xScale(dataGroup, chosenXAxis);
    var yLinearScale = yScale(dataGroup, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(dataGroup)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "teal")
        .attr("opacity", ".5");


    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Household Income (Median)");

    var yLabelsGroup = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("transform", `translate(${0 - margin.left}, ${0 - height / 2})`);
    
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", -20)
        .attr("y", 0)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", -40)
        .attr("y", 0)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("x", -60)
        .attr("y", 0)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");

    xLabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {
    
            chosenXAxis = value;
    
            console.log(chosenXAxis)
    
            xLinearScale = xScale(dataGroup, chosenXAxis);
    
            xAxis = renderXAxis(xLinearScale, xAxis);
    
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
            if (chosenXAxis === "age") {
                ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenXAxis === "income") {
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", true)
                  .classed("inactive", false);
              }
              else {
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                povertyLabel
                  .classed("active", true)
                  .classed("inactive", false);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
          }    
    });

    yLabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {
    
            chosenYAxis = value;
    
            console.log(chosenYAxis)
    
            yLinearScale = yScale(dataGroup, chosenYAxis);
    
            yAxis = renderYAxis(yLinearScale, yAxis);
    
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    
            if (chosenYAxis === "smokes") {
                smokesLabel
                  .classed("active", true)
                  .classed("inactive", false);
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity") {
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
            }
            else {
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                healthcareLabel
                  .classed("active", true)
                  .classed("inactive", false);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
            }
          }
    });
    
    // xAxis;
    // yAxis;
    // circlesGroup;

}).catch(function(error) {
    console.log(error);
  });