function drawVis(svgClass, data) {
  console.log(data)
  let svg = d3.select(svgClass);

  let coralColor = "#fb6466";
  let darkGreyColor = "#282828";
  let textColor = "#696969";

  let innerRadius = 100; 
  let center = 150;
  let outerRadius = 350;

  let centerX = 750;
  let centerY = 400
  
  let x = d3.scaleLinear()
    .domain([1,13])
    .range([0, 2 * Math.PI]);

  let extent = d3.extent(data.flat(), (d) => { return Number(d.amt)})

  let y = d3.scaleLinear()
    .domain([0, extent[1]])
    .range([innerRadius, outerRadius]);

  let xByDay = d3.lineRadial()
    .angle(function(d) {
      return Number(transformMonthDateToFraction(d["month"], d["date"]))/12*(2*Math.PI);
    })
    .radius(function(d) {
      return y(d["amt"]);
    });

  let mainG = svg.append("g").attr("transform", "translate("+centerX+","+centerY+")");
  
  let area = d3.radialArea()
    .angle(function(d) {
      return x(d.month);
    })
    .curve(d3.curveCatmullRom.alpha(1))
    .innerRadius(y(0))
    .outerRadius(function(d) {
      return y(Number(d.amt));
    });

  // draw radial axis for donut vis
  let xAxis = mainG.append("g");
  var xTick = xAxis
    .selectAll("g")
    .data(x.ticks(12))
    .enter().append("g")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "rotate(" + ((x(d)) * 180 / Math.PI - 90) + ")translate(" + (innerRadius-5) + ",0)";
      });
  xTick.append("line")
    .attr("x2", -5)
    .attr("stroke", "#000")
    .attr("opacity", 0.8);
  xTick.append("text")
    .attr("transform", function(d) { 
      var angle = x(d);
      return ((angle < Math.PI / 2) || (angle > (Math.PI * 3 / 2))) ? "rotate(90)translate(0,17)" : "rotate(-90)translate(0, -10)"; })
    .text((d) => {return (d != 13) ? formatMonth(d) : ""})
    .style("font-family", "Rubik")
    .style("font-size", 10)
    .attr("opacity", 0.5);
  
  mainG.append("text")
    .attr("class", "yearText")
    .attr("x", 0)
    .attr("y", 0)
    .text("2000")
    .style("font-size", 35)
    .style("alignment-baseline", "middle")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-family", "Proza Libre");
      
  // drawing underlay of old year value blobs
  for (var i = 0; i < 21; i++) {
    mainG.append("path")
      .attr("class", "underlay")
      .attr("id", "underlay"+i)
      .style("fill", "grey")
      .style("opacity", 0)
      .style("stroke", "none")
      .on("mouseover", function() {
        d3.select(this).transition().duration(300).style("opacity", 0.2);
      })
      .on("mouseout", function() {
        d3.select(this).transition().duration(300).style("opacity", 0.1);
      })
      .attr("d", area(data[i]));
  }

  // draw main circle blob
  mainG.datum(data[0])
    .append("path")
    .attr("class", "mainArea")
    .attr("fill", "red")
    .attr("fill-opacity", 0.5)
    .attr("d", (d) => area(d));

  // add x-axis lines for months 
  let fakePieData = createFakePieData();
  let pie = d3.pie()
    .value(function(d) {return d.value; })
  const arcs = pie(d3.entries(fakePieData));
  mainG.selectAll('.treeRingOutline')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
    )
    .attr('fill', "none")
    .attr("stroke", "grey")
    .style("stroke-width", 1.5)
    .style("opacity", 0.1);

  //draw concentric circles for yaxis
  for (var i = innerRadius; i < outerRadius; i+=50) {
    mainG.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", i)
      .style("fill", "none")
      .style("stroke", "grey")
      .style("stroke-width", 1.5)
      .style("opacity", 0.1);
    mainG.append("text")
      .attr("x", -1*i)
      .attr("y", 0)
      .text(i)
      .attr("transform", "translate(-2.5, -2.5)")
      .style("font-family", "Rubik")
      .style("font-size", 10)
      .style("opacity", 0.5)
      .style("text-anchor", "end");
  }
  // add label for y axis 
  mainG.append("text")
    .attr("x", -1*outerRadius)
    .attr("y", 0)
    .text("£m")
    .attr("transform", "translate(-2.5, -2.5)")
    .style("font-family", "Rubik")
    .style("font-size", 10)
    .style("opacity", 0.5)
    .style("text-anchor", "end")
    .style("background", "white")
    .style("font-weight", "bold");

  counter = 0;
  for (var lst of data) {
    // handling transitions for year changes
    mainG.selectAll(".mainArea")
      .transition()
      .delay(counter*1000)
      .duration(1000)
      .attr("d", area(lst));

    if (counter < 20) {
      // handle underlay blob opacity 
      mainG.select("#underlay"+counter)
        .transition()
        .delay((counter+1)*1000)
        .duration(1000)
        .style("opacity", 0.1);
    }

    mainG.select(".yearText")
      .transition()
      .delay(counter*1000)
      .duration(1000)
      .text(2000+counter);
      
    counter = counter + 1;
  }

  // jan 2021, largest decline in exports in 20 years at 8180£m
  addAnnotation(svg, centerX, centerY, xByDay, counter, 1, 1, 8180, false, 
    ["january 2021: the largest decline", 
     "in exports in 20 years at 8180 £m"
    ], darkGreyColor, true);
  // jan 31, 2020 - start of Brexit, UK left the EU
  addAnnotation(svg, centerX, centerY, xByDay, counter, 1, 31, data[20][0]["amt"], true, 
    ["january 31, 2020: start of brexit",
     "when the UK officially left the EU"
    ], darkGreyColor, false);
  // mar 23, 2020 - first national UK coronavirus lockdown
  addAnnotation(svg, centerX, centerY, xByDay, counter, 3, 23, data[20][2]["amt"]-150, true,
    ["march 23, 2020:",
     "first national UK",
     "covid-19 lockdown"
    ], darkGreyColor, false);
  // nov 5, 2020 - second national UK coronavirus lockdown
  addAnnotation(svg, centerX, centerY, xByDay, counter, 11, 5, data[20][10]["amt"]-50, true,
    ["november 5, 2020:",
     "second national UK",
     "covid-19 lockdown"
    ], darkGreyColor, true);

  //add title + text
  svg.append("text")
    .attr("x", 5)
    .attr("y", 75)
    .text("UK exports plummet due")
    .attr("transform", "translate(-2.5, -2.5)")
    .style("font-family", "Proza Libre")
    .style("font-size", 35)
    .style("fill", darkGreyColor)
    .style("font-weight", "bold");
  svg.append("text")
    .attr("x", 5)
    .attr("y", 75+30)
    .text("to Brexit and Covid-19")
    .attr("transform", "translate(-2.5, -2.5)")
    .style("font-family", "Proza Libre")
    .style("font-size", 35)
    .style("fill", darkGreyColor)
    .style("font-weight", "bold");

  addBodyText(svg, 5, 200, textColor, 
    [
      "In 2020, the UK was affected by multiple", 
      "events related to Brexit and Covid-19",
      "that contributed to its decline in exports."
    ]);

  addBodyText(svg, 5, 300, textColor, 
      [
        "By January 2021, UK exports of goods", 
        "to the EU have plunged by over ",
        "40%, the largest monthly decline ",
        "in British trade in over 20 years."
      ]);

  addBodyText(svg, 5, 425, textColor, 
    [
      "Watch the animation to learn", 
      "how UK exports have changed",
      "throughout the years."
    ]);
  
}

function addBodyText(svg, x, y, textColor, textLst) {
  let counter = 0;
  for (var text of textLst) {
    svg.append("text")
      .attr("x", x)
      .attr("y", y+25*counter)
      .text(text)
      .attr("transform", "translate(-2.5, -2.5)")
      .style("font-family", "Rubik")
      .style("font-size", 18)
      .style("fill", textColor);
      
    counter = counter + 1;
  }
}

function addAnnotationText(svg, x, y, textColor, textLst, isEnd = false) {
  let line = 0;
  for (var text of textLst) {
    svg.append("text")
      .attr("x", x)
      .attr("y", y-15+15*line)
      .text(text)
      .style("font-family", "Rubik")
      .style("text-anchor", isEnd ? "end" : "start")
      .style("font-size", 12)
      .style("fill", textColor)
      .style("font-weight", "bold")
      .style("opacity", 0)
      .transition()
      .delay((counter+1)*1000)
      .duration(250)
      .style("opacity", 1);
      
      line = line + 1;
  }
}

function addAnnotation(svg, centerX, centerY, xByDay, counter, month, date, amt, isEvent, textLst, textColor, isEnd) {
  let xy = xByDay([{"month": month, "date": date, "amt": amt}]).slice(1).slice(0, -1);
  let xy1 = xByDay([{"month": month, "date": date, "amt": amt-500}]).slice(1).slice(0, -1);
  let xy15 = xByDay([{"month": month, "date": date, "amt": amt}]).slice(1).slice(0, -1);
  let xy2 = xByDay([{"month": month, "date": date, "amt": 0}]).slice(1).slice(0, -1);

  // add circle annotation
  svg.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", isEvent ? 3 : 6)
    .attr("transform", function() {
      return "translate(" + xy + ")";
    })
    .style("fill", isEvent ? "black" : "none")
    .style("stroke", "black")
    .style("stroke-width", 1.5)
    .style("opacity", 0)
    .transition()
    .delay((counter+1)*1000)
    .duration(250)
    .style("opacity", 1);

  // add line annotation
  svg.append("line")
    .attr("x1", isEvent ? xy15.split(",")[0] : xy1.split(",")[0])
    .attr("x2", xy2.split(",")[0])
    .attr("y1", isEvent ? xy15.split(",")[1] : xy1.split(",")[1])
    .attr("y2", xy2.split(",")[1])
    .attr("transform", function() {
      return "translate("+centerX+","+centerY+")";
    })
    .style("stroke", "black")
    .style("stroke-width", 1.5)
    .style("opacity", 0)
    .transition()
    .delay((counter+1)*1000)
    .duration(250)
    .style("opacity", 1);

  let xOffset = isEnd ? -15 : 15;
  addAnnotationText(svg, Number(xy1.split(",")[0])+centerX+xOffset, Number(xy1.split(",")[1])+centerY, textColor, textLst, isEnd);
}

function transformMonthDateToFraction(month, date) {
  return Number(month)-1 + (Number(date)-1)/30;
}

function createFakePieData() {
  return {"Jan": 1, "Feb": 1, "Mar": 1, "Apr": 1, "May": 1, "Jun": 1,"July": 1,
    "Aug": 1, "Sep": 1, "Oct": 1, "Nov": 1, "Dec": 1 };
}

/* GRADIENT SPLIT COLOR CODE */
function findNewStop(min, max) {
  if (min > 0 && max > 0) return 0;
  if (min < 0 && max < 0) return 1;

  return Math.abs(min)/(Math.abs(max)-Math.abs(min));
}

/* GRADIENT SPLIT COLOR CODE */
    // let extent = d3.extent(lst, (d) => d.amt);
    // svg.selectAll(".gradientStop")
    //   .transition()
    //   .delay(counter*1000)
    //   .duration(1000)
    //   .attr("offset", findNewStop(extent[0], extent[1]));

/* GRADIENT SPLIT COLOR CODE */
  // let gradient = svg.append("defs")
  //   .append("radialGradient")
  //   .attr("id", "radial-gradient");
  
  // gradient.append("stop")
  //   .attr("offset", 0)
  //   .attr("stop-color", "red");
  //   gradient.append("stop")
  //   .attr("class", "gradientStop")
  //   .attr("offset", 0.5)
  //   .attr("stop-color", "red");
  //   gradient.append("stop")
  //   .attr("class", "gradientStop")
  //   .attr("offset", 0.5)
  //   .attr("stop-color", "blue");
  //   gradient.append("stop")
  //   .attr("offset", 1)
  //   .attr("stop-color", "blue");
  
  // svg.append("circle")
  //     .attr("cx", 400)
  //     .attr("cy", 400)
  //     .attr("r", 300)
  //     .style("fill", "url(#radial-gradient)");

  // svg.datum(data[4])
  //   .append("path")
  //   .attr("class", "posArea")
  //   .attr("fill", "blue")
  //   .attr("fill-opacity", 0.5)
  //   .attr("d", (d) => posArea(d))
  //   .attr("transform", "translate(400,400)");

  // svg.datum(data[4])
  //   .append("path")
  //   .attr("class", "negArea")
  //   .attr("fill", "url(#radial-gradient)")
  //   .attr("fill-opacity", 0.5)
  //   .attr("d", (d) => negArea(d))
  //   .attr("transform", "translate(400,400)");

  /* GRADIENT SPLIT COLOR CODE */
  // let extent = d3.extent(data[0], (d) => d.amt);
  // svg.selectAll(".gradientStop").transition().attr("offset", findNewStop(extent[0], extent[1]));
  // console.log(findNewStop(extent[0], extent[1]))