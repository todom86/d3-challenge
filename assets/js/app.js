var svgWidth = 1100;
var svgHeight = 900;

var margin = {
  top: 20,
  right: 20,
  bottom: 160,
  left: 160
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

function xScale(dataGroup, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(dataGroup, d => d[chosenXAxis] * 0.9),
        d3.max(dataGroup, d => d[chosenXAxis] * 1.1)
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
    
    return yAxis;
}

function renderCircles(circles, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circles.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circles;
}

function renderCircleText(circleText, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
  circleText.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]))
    .attr("dy", d => newYScale(d[chosenYAxis]) + 5);

  return circleText;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circles, circleText) {

  var xLabel;

  if (chosenXAxis === "poverty") {
    xLabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    xLabel = "Age:";
  }
  else {
    xLabel = "Income:";
  }

  var yLabel;

  if (chosenYAxis === "healthcare") {
    yLabel = "Healthcare:";
  }
  else if (chosenYAxis === "smokes") {
    yLabel = "Smokes:";
  }
  else {
    yLabel = "Obesity:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br> ${yLabel} ${d[chosenYAxis]} `);
    });

  circlesGroup.call(toolTip);

  circles.on("mouseover", function(d) {
    toolTip.show(d);
  })    
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

  circleText.on("mouseover", function(d) {
    toolTip.show(d);
  })    
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

  return circles, circleText;
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
        .call(bottomAxis)
        .attr("font-size", "20px");
    
    var yAxis = chartGroup.append("g")
        .call(leftAxis)
        .attr("font-size", "20px");
    
    var circlesGroup = chartGroup.append("g");

    var circles = circlesGroup.selectAll("circle")
        .data(dataGroup)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 18)
        .attr("class", "stateCircle")
        .attr("opacity", ".5");
    
    var circleText = circlesGroup.selectAll("text")
        .data(dataGroup)
        .enter()
        .append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
        .text(d => d.abbr)
        .attr("class", "stateText");

    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty") 
        .classed("active aText", true)
        .text("In Poverty (%)");
    
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 80)
        .attr("value", "age")
        .classed("inactive aText", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 120)
        .attr("value", "income") 
        .classed("inactive aText", true)
        .text("Household Income (Median)");

    var yLabelsGroup = chartGroup.append("g")
        // .attr("transform", "rotate(-90)")
        .attr("transform", `translate(0, ${height / 2}) rotate(-90)`);
        // .attr("x", 0 - margin.left)
        // .attr("y", 0 - (height / 2));
    
    var healthcareLabel = yLabelsGroup.append("text")
        // .attr("x", 0)
        .attr("y", -40)
        .attr("value", "healthcare") 
        .classed("active aText", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        // .attr("x", 0)
        .attr("y", -80)
        .attr("value", "smokes") 
        .classed("inactive aText", true)
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        // .attr("x", 0)
        .attr("y", -120)
        .attr("value", "obesity") 
        .classed("inactive aText", true)
        .text("Obesity (%)");
      
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circles, circleText);

    xLabelsGroup.selectAll("text")
        .on("click", function() {
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {
    
            chosenXAxis = value;
    
            console.log(chosenXAxis)
    
            xLinearScale = xScale(dataGroup, chosenXAxis);
    
            xAxis = renderXAxis(xLinearScale, xAxis);
    
            circles = renderCircles(circles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circleText = renderCircleText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circles, circleText);

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
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {
    
            chosenYAxis = value;
    
            console.log(chosenYAxis)
    
            yLinearScale = yScale(dataGroup, chosenYAxis);
    
            yAxis = renderYAxis(yLinearScale, yAxis);
    
            circles = renderCircles(circles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesText = renderCircleText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circles, circleText);
    
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