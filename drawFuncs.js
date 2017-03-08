var colorType=['rgb(255,90,95)','rgb(144,48,255)','rgb(255,180,0)','rgb(66,134,244)','rgb(0,166,153)'];
var reviewById = d3.map();
// map1
function drawInitial(census,neighbors, airbnb){
  var newCensusFeatures=census.features;
  //console.log('features are ',newCensusFeatures);

  function OutsideFilter(element, index, array){
    return element.Town=="Boston";}

  //1. draw neighbors outline to show the neighbor blocks' name
  mapA = mapA0
      .append('g')
      .selectAll('.map-block')
      .data(newCensusFeatures, function (d) { return d.properties.cartodb_id; })

  var mapAEnter = mapA.enter()
      .append('g')
      .attr('class','map-block');

  var mapAExit = mapA.exit()
      .transition()
      .remove();
  mapA
  .append('path')
  .attr('d', pathGenerator)
  .filter(function (d) { return d.properties.intersect_count >=0 ;})
  .style('fill',function(d){
      var count= d.properties.intersect_count;
      var colorRoom=colorScale(count);
      return colorScale(count) })
  .style('stroke','#6E6D6D')
  .style('stroke-width','.3px')
  .style('fill-opacity', 0);

  //draw block
  var mapB = mapA0
      .append('g')
      .selectAll('.map-neighbors')
      .data(neighbors.features,function(d){ return d.properties.cartodb_id;})

  var mapBEnter=mapB.enter()
      .append('g')
      .attr('class','map-neighbors')

  var mapBEnter=mapB.exit()
      .transition()
      .remove()

  mapB
  .append('path')
  .attr('d', pathGenerator)
  .style('fill','rgba(255,255,0,0)')
  .style('stroke','blue')
  .style('stroke-width','.5px')
  .style("stroke-dasharray", ("1, 1"))//dashline
  .call(BlingBling1)
  //block name
  mapB
  .attr('dx',function(d){return pathGenerator.centroid(d)[0]})
  .attr('dy',function(d){return pathGenerator.centroid(d)[1]})
  .style('fill','#646464')
  .style('opacity',0)
  .call(BlingBling2)
  .call(getTownname);

  //room points
  var newCensusFeatures=census.features;
  //console.log('features are ',newCensusFeatures)
  function OutsideFilter(element, index, array){
    return element.Town=="Boston";
  }
  airbnb_filtered = airbnb.filter(OutsideFilter);

  var mapC= mapA0
      .append('g')
      .selectAll('.map-datapoints')
      .data(airbnb_filtered);
  mapC
  .enter()
  .append('g')
  .attr('class','map-datapoints');
  mapC
  .exit()
  .transition()
  .remove();

  mapC1=mapC
      .append('circle')
      //make a filter to drop extra data out side of Boston town
      .filter(function(d) { return d.Town =='Boston' })
      .attr('cx',function(d){return projection([d.X, d.Y])[0];})
      .attr('cy',function(d){return projection([d.X, d.Y])[1]})
      .attr('r',3)
      .style('stroke','rgb(100,100,100)')
      .style('stroke-width',1)
      .style('fill','white');
  mapC1
  .transition()//make a transition to looks cool
  .duration(2000)
  .attr('r',10)
  .style('fill',colorType[0])
  .style('opacity',0.3)
  .style('stroke','rgb(200,200,200)')
  .transition()//make a transition to looks cool
  .duration(1000)
  .attr('r',3)
  .style('fill',colorType[0])
  .style('opacity',0.6);

  mapC1
  .call(BlingBling3);
  mapC1
  .on('click',function(d){
    if(d.selected == true){
        //if state is already selected, de-select, remove time series in graph module
        //set stroke to null
        dispatch.map1deSelect(d.ID);
        d.selected = false;
        d3.select(this).style('stroke','rgb(200,200,200)').style('stroke-width',1);
    }else{
        //if state is NOT selected yet, select it, add time series in graph module
        d.selected = true;
        dispatch.map1Select(+d.ID);
        d3.select(this).style('stroke','black').style('stroke-width',5);
    }
  })
  mapC
  .call(getTooltips1);
}
//district density
function drawDistri(census,neighbors,airbnb){
    var mapA = d3.selectAll('.map-block')
        .selectAll('path')
    mapA
        .transition()
        .duration(1000)
        .attr('d', pathGenerator)
        .filter(function (d) {
            return d.properties.intersect_count >=0;
        })
        .style('fill',function(d){
            var count= d.properties.intersect_count;
            return colorScale(count)
        })
        .style('stroke','#6E6D6D')
        .style('stroke-width',.3)
        .style('fill-opacity',1)

}
//room types
function drawType(census,neighbors,airbnb){
  var mapC=d3.selectAll('.map-datapoints')
      .selectAll('circle')
      //make a filter to drop extra data out side of Boston town
      .filter(function(d) { return d.Town =='Boston' })
      .attr('cx',function(d){return projection([d.X, d.Y])[0]})
      .attr('cy',function(d){return projection([d.X, d.Y])[1]})
      .transition()
      .duration(200)
      .style('fill',function(d){
        if(d.Type=="Private room"){return colorType[1];}
        else if(d.Type=="Shared room"){return colorType[2];}
        else if(d.Type=="Entire home/apt"){return colorType[3];}
        else {return colorType[0];}
      })
  mapC1
  .call(BlingBling4);
  mapC1=mapC
      .transition()
      .duration(1000)
      .attr('r','10px')
      .style('opacity',.3);
  mapC2=mapC1
      .transition()
      .duration(1000)
      .attr('r','3px')
      .style('opacity',.8);
}
// map2 Reviews
function drawGraph1(census,neighbors,airbnb){
  //filter data ouside map region
  function OutsideFilter1(element, index, array){return element.Town=="Boston";}
  //filter data with zero value
  function OutsideFilter2(element, index, array){return element.Review!=0;}

  var _filtered = airbnb.filter(OutsideFilter1);
  var filtered = _filtered.filter(OutsideFilter2)
  //axes scale
  var ReviewMin=d3.min(filtered, function(d){return d.Review}),
      ReviewMax=d3.max(filtered, function(d){return d.Review});
  featureLength  = filtered.length;
  console.log('length is ',featureLength);

  scaleX=d3.scale.linear().domain([0,featureLength]).range([0,width2]);
  scaleY1=d3.scale.linear().domain([ReviewMin,ReviewMax]).range([height2,0]);

  var axisY1=d3.svg.axis()
      .orient('left')
      .ticks(8)
      .tickSize(.2)
      //.tickValues([0,50,100,150,200,250,300,350]);

  // draw axes
  axisY1.scale(scaleY1)
  //review axis y
  mapaxis=mapB0
      .append('g')
      .attr('class','axis axis-y')
      .call(axisY1)
      .attr('transform','translate('+(-10)+','+0+')')
      .style('fill',colorType[4])
  mapB0
  .append('text')
  .attr('y',150)
  .attr('x',-25)
  .attr('dy','1em')
  .style('text-anchor','middle')
  .text('Review')
  .style('fill',colorType[4])

  //draw reviews
  var map2=mapB0
      .append('g')
      .selectAll('.graph1')
      .data(filtered)

  var map2Enter=map2.enter()
      .append('g')
      .attr('class','graph1')

  var map2Exit=map2.exit()
      .transition()
      .remove()
  map2
  .append('g')
  .append('line')
  .attr('class','Reviews')
  .attr('id',function(d){return 'review-'+ d.ID;})
  .attr('x1',function(d, i){return scaleX(i);})
  .attr('y1',height2)
  .attr('x2', function(d,i){return scaleX(i);})
  .attr('y2',function(d){
    if (d.Review==undefined) {return height2; }
    else {return scaleY1(d.Review);}
  })
  .style('stroke',colorType[4])
  .style('stroke-width',1)
  .style('opacity',.65)
  .on('mouseover',function(d){
    var xy = d3.mouse(map2.node());
    var BlingBling5 = d3.select(this)
        .style('opacity', 1)
        .style('stroke','#7DF12A')
        .style('stroke-width', 8);
    var div = d3.select('#tooltip2');
    div
    .transition();
    div
    .style('opacity', 1)
    .html("Room ID:" + d.ID + ",  Review:" + d.Review + ", Star:" + d.AveStar)
    .style("left", (xy[0] + 210) + "px")
    .style("top", function (d) {return (xy[1] + "px");})
  })
  .on('mouseout',function(){
    var BlingBling5=d3.select(this)
        .transition()
        .duration(400)
        .style('stroke',colorType[4])
        .style('stroke-width',1)
        .style("opacity",.65)
    var div=d3.select('#tooltip2')
    div.style('opacity',0)
  })
  dispatch.on('map1Select',function(roomId){
    var BlingBling51 = d3.select('#review-'+ roomId)
        .style('opacity', 1)
        .style('stroke','#7DF12A')
        .style('stroke-width', 8);
    var div = d3.select('#tooltip2');
    div
    .transition();
    div
    .style('opacity', 1)
    .html("Room ID:" + roomId + ' | Room Reviews:' + reviewById.get(roomId)[0] + ' | Assessment ' + reviewById.get(roomId)[1])
    .style("left", (210) + "px")
    .style("top", function (d){ return (100 + "px");})
  });
  dispatch.on('map1deSelect',function(roomId){
    d3.select('#stars-'+roomId).remove();
    d3.select('#review-'+roomId).remove();
  })
}

//'clear all' button
function drawClearAll(){
    d3.selectAll('.map-block')
        .data([]).exit().remove()
    d3.selectAll('.map-neighbors')
        .data([]).exit().remove()
    d3.selectAll('.map-datapoints')
        .data([]).exit().remove()
    d3.select('#tooltip1')
        .style('opacity',0)
}
//map3 Stars
function drawGraph2(census,neighbors,airbnb){
  //filter data ouside map region
  function OutsideFilter1(element, index, array){return element.Town=="Boston";}
  //filter data with zero value
  function OutsideFilter2(element, index, array){return element.Review!=0;}

  var _filtered = airbnb.filter(OutsideFilter1);
  var filtered = _filtered.filter(OutsideFilter2);
  var randByStars = filtered.slice().sort(function(a, b){return b.AveStar - a.AveStar;});
  //axes scale
  var StarsMin=d3.min(randByStars, function(d){return d.AveStar}),
      StarsMax=d3.max(randByStars, function(d){return d.AveStar});
  featureLength  = randByStars.length;

  scaleX=d3.scale.linear().domain([0,featureLength]).range([0,width2]);
  scaleY2=d3.scale.linear().domain([StarsMin,StarsMax]).range([height2,0]);

  var axisY2=d3.svg.axis()
      .orient('right')
      .ticks(4)
      .tickSize(.2)
      //.tickValues([0,1,2,3,3.5,4,4.5,5]);
  // draw axes
  axisY2.scale(scaleY2);

  //assessment axis y
  mapaxis2=mapB1
      .append('g')
      .attr('class','axis axis-y')
      .call(axisY2)
      .attr('transform','translate('+(width2+10)+','+0+')')
      .style('fill','orange')
  mapB1
  .append('text')
  .attr('y',150)
  .attr('x',width2+10)
  .attr('dy','1em')
  .style('text-anchor','middle')
  .text('Stars')
  .style('fill','orange')
  //draw assessment
  var map3=mapB1
      .append('g')
      .selectAll('.graph1')
      .data(randByStars)

  var map3Enter=map3.enter()
      .append('g')
      .attr('class','graph1')

  var map3Exit=map3.exit()
      .transition()
      .remove()
  map3
  .append('g')
  .append('line')
  .attr('class','Stars')
  .attr('id',function(d){return 'stars-'+ d.ID;})
  .attr('x1',function(d, i){return scaleX(i);})
  .attr('y1',height2)
  .attr('x2', function(d,i){return scaleX(i);})
  .attr('y2',function(d){
    if (d.AveStar==undefined) {return height2; }
    else { return  scaleY2((d.AveStar))}
  })
  .style('stroke',function(d){
    if(d.AveStar<=3){return '#916216'}
    else if(d.AveStar<=4){return '#C58720'}
    else if(d.AveStar<=4.5){return '#FFB02B'}
    else {return '#FFEE27'}})
  .style('stroke-width',1)
  .style('opacity',1)
  .on('mouseover',function(d){
    var xy=d3.mouse(map2.node());
    var BlingBling5 = d3.select(this)
    .style('opacity',1)
    .style('stroke','#6514ED')
    .style('stroke-width',8);
  })
  .on('mouseout',function(){
    var BlingBling5=d3.select(this)
        .transition()
        .duration(400)
        .style('stroke',function(d){
          if(d.AveStar<=3){return '#916216'}
          else if(d.AveStar<=4){return '#C58720'}
          else if(d.AveStar<=4.5){return '#FFB02B'}
          else {return '#FFEE27'}})
        .style('stroke-width',1)
        .style("opacity",.7);
    var div=d3.select('#tooltip2');
    div.style('opacity',0);
  });
}
