var margin = {t:80,r:50,b:80,l:100};
var width = document.getElementById('map1').clientWidth - margin.r - margin.l,
    height = document.getElementById('map1').clientHeight - margin.t - margin.b;

var margin2 = {t:20,r:50,b:80,l:50};
var width2 = document.getElementById('map2').clientWidth - margin.r - margin.l,
    height2 = document.getElementById('map2').clientHeight - margin.t - margin.b;

var map1 = d3.select('#map1')
    .append('svg')
    .attr('width',width + margin.l + margin.r)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas-map1')
    .attr('transform','translate('+margin.l*(1)+','+margin.t+')');

var map2 = d3.select('#map2')
    .append('svg')
    .attr('width',width2 + margin2.l + margin2.r)
    .attr('height',height2 + margin2.t + margin2.b)
    .append('g')
    .attr('class','canvas-map2')
    .attr('transform','translate('+margin2.l+','+margin2.t+')');

//graph tooltip
var div=d3.select('body').append('div')
    .attr('class','tooltip')
    .style('opacity',0);

var mapA0 = map1
var mapB0 = map2
//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520];

var projection = d3.geo.mercator()
    .translate([width/2,height/2])
    .center([bostonLngLat[0],bostonLngLat[1]])
    .scale(120000/1)

//TODO: create a geo path generator
var pathGenerator = d3.geo.path().projection(projection);

//TODO: create a color scale
//var scaleColor=d3.scale.linear().domain([1,2,3]).range(['blue','orange','yellow']);
var colorScale=d3.scale.linear().domain([0,34]).range(['white','red']);
var colorType=["#9030FF",'2FFF22','yellow',"#FF34D6"];
var legendText=['All rooms','Private room','Shared room','Entire home/apt']


d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

var dispatch = d3.dispatch('map1Select','map1deSelect','timechange');

//TODO: create a d3.map() to store the value of airbnb room number per block group
// var airbnbRoom=d3.map()
//TODO: import data, parse, and draw
queue()
    .defer(d3.json,'data/bos_census_blk_group_merge.geojson')
    .defer(d3.json,'data/bos_neighborhoods_merge.geojson')
    .defer(d3.csv,'data/boston_listings_cleaned.csv',parseData)
    .await(dataLoaded)


function dataLoaded (err,census,neighbors, airbnb){
        var newCensusFeatures=census.features;
        //console.log('features are ',newCensusFeatures);
        airbnb = airbnb.filter(function(d) {
          return d.Review != 0;
        })
        // console.log(airbnb);
//0.draw legend
        // Legend = d3.select('#legend').append('svg')
        //     .attr('height', height+ margin.t + margin.b)
        //     .append('g')
        //     .attr('class','legend')
        //     .attr('transform','translate('+(margin2.l*(1))+','+( margin.t)+')')
        // for(var i=0;i<=3;i++) {
        //     //console.log(colorType[i]);
        //     Legend
        //         .append('rect')
        //         .attr('x', 10)
        //         .attr('y', 25*i)
        //         .attr('width',20)
        //         .attr('height',20)
        //         .style('fill',colorType[i])
        //     Legend
        //         .append('text')
        //         .text(legendText[i])
        //         .attr('x',45)
        //         .attr('y',16+25*i)
        // }
//draw initial map
        drawInitial(census,neighbors,airbnb);

//buttons control
        d3.selectAll('.btn').on('click',function(){
            //find out which button is clikced
            var id = d3.select(this).attr('id')
            location.href = "#titleId"
            if(id == 'rDensity'){
                drawDistri(census,neighbors,airbnb)}
            if(id == "rType"){
                drawType(census,neighbors,airbnb)}
            if(id == "rClearAll"){
              document.querySelectorAll("#rDensity input")[0].checked = false
              document.querySelectorAll("#rType input")[0].checked = false
                drawClearAll(census,neighbors,airbnb)}
            if(id == "rInitial"){
                drawInitial(census,neighbors,airbnb);}
        })
//draw bar charts below
        drawGraph(census,neighbors,airbnb)
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

function drawInitial(census,neighbors, airbnb){
    var newCensusFeatures=census.features;
    //console.log('features are ',newCensusFeatures);

    function OutsideFilter(element, index, array){
        return element.Town=="Boston";
    }

//1. draw neighbors outline to show the neighbor blocks' name
    mapA = mapA0
        .append('g')
        .selectAll('.map-block')
        .data(newCensusFeatures, function (d) { return d.properties.cartodb_id; })

    var mapAEnter = mapA.enter()
        .append('g')
        .attr('class','map-block')

    var mapAExit = mapA.exit()
        .transition()
        .remove()
    mapA
        .append('path')
        .attr('d', pathGenerator)
        .filter(function (d) { return d.properties.intersect_count >=0 ;})
        .style('fill',function(d){
            //console.log(d);
            //console.log('color is', colorRoom)
            var count= d.properties.intersect_count;
            var colorRoom=colorScale(count);
            return colorScale(count) })
        .style('stroke','#6E6D6D')
        .style('stroke-width','.3px')
        .style('fill-opacity', 0)

//draw block
    var mapB = mapA0
        .append('g')
        .selectAll('.map-neighbors')
        .data(neighbors.features,function(d){ return d.properties.cartodb_id;})
    // console.log(neighbors.features)

    var mapBEnter=mapB.enter()
        .append('g')
        .attr('class','map-neighbors')

    var mapBEnter=mapB.exit()
        .transition()
        .remove()

    mapB
        .append('path')
        //.transition()
        .attr('d', pathGenerator)
        .style('fill','rgba(255,255,0,0)')
        .style('stroke','blue')
        .style('stroke-width','.5px')
        .style("stroke-dasharray", ("1, 1"))//dashline
        .call(BlingBling1)
//block name
    mapB
        .append('text')
        .attr('class','text')
        .attr("text-anchor", "middle")
        .text(function(d){return d.properties.name;})
        .attr('dx',function(d){return pathGenerator.centroid(d)[0]})
        .attr('dy',function(d){return pathGenerator.centroid(d)[1]})
        .style('fill','#646464')
        .style('opacity',0)
        .call(BlingBling2)

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
        .data(airbnb_filtered)
    mapC
        .enter()
        .append('g')
        .attr('class','map-datapoints')
    mapC
        .exit()
        .transition()
        .remove()

    mapC1=mapC
        .append('circle')
        //make a filter to drop extra data out side of Boston town
        .filter(function(d) { return d.Town =='Boston' })
        .attr('cx',function(d){return projection([d.X, d.Y])[0];})
        .attr('cy',function(d){return projection([d.X, d.Y])[1]})
        .attr('r',3)
        .style('stroke','rgb(100,100,100)')
        .style('stroke-width',1)
        .style('fill','white')
    mapC1
        .transition()//make a transition to looks cool
        .duration(2000)
        .attr('r',10)
        .style('fill',"#9030FF")
        .style('opacity',0.3)
        .style('stroke','rgb(200,200,200)')
        .transition()//make a transition to looks cool
        .duration(1000)
        .attr('r',3)
        .style('fill',"#9030FF")
        .style('opacity',0.6)

    mapC1
        .call(BlingBling3)
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
        .call(getTooltips1)

}

function drawGraph(census,neighbors,airbnb){

//filter data ouside map region
    function OutsideFilter1(element, index, array){return element.Town=="Boston";}
//filter data with zero value
    function OutsideFilter2(element, index, array){
      // return element.Review!=0;
      return element;
    }

    var _filtered = airbnb.filter(OutsideFilter1);
    var filtered = _filtered.filter(OutsideFilter2)
//axes scale
    var ReviewMin=d3.min(filtered, function(d){return d.Review}),
        ReviewMax=d3.max(filtered, function(d){return d.Review});
    featureLength  = filtered.length;
    // console.log('length is ',featureLength);

    scaleX=d3.scale.linear().domain([0,featureLength]).range([0,width2]);
    scaleY1=d3.scale.log().domain([ReviewMin,ReviewMax]).range([height2,0])
    scaleY2=d3.scale.linear().domain([0,5]).range([height2,0]);


    var axisY1=d3.svg.axis()
        .orient('left')
        .scale(scaleY1)
        .ticks(6, ",.1s")
        .tickSize(2, 0)
        // .tickFormat(function(d) {
        //   return Number(d)
        // })
        //.tickValues([0,50,100,150,200,250,300,350]);
    var axisY2=d3.svg.axis()
        .orient('right')
        .ticks(4)
        .tickSize(.2)
        //.tickValues([0,1,2,3,3.5,4,4.5,5]);
// draw axes
    // axisY1
    axisY2.scale(scaleY2);
    //review axis y
    mapaxis=mapB0
        .append('g')
        .attr('transform','translate('+(-10)+','+30+')')
        .attr('class','axis axis-y')
        .call(axisY1)
        .style('fill','red')
    mapB0.append('text')
        .attr('class','h4')
        .attr('y',0)
        .attr('x',-margin.r/2)
        .attr('dy','1em')
        .style('text-anchor','left')
        .text('Review')
        .style('fill','red')

    //assessment axis y
    mapaxis2=mapB0
        .append('g')
        .attr('class','axis axis-y ')
        .call(axisY2)
        .attr('transform','translate('+(width2+10)+','+30+')')
        .style('fill','orange')
    mapB0.append('text')
        .attr('class','h4')
        .attr('y',0)
        .attr('x',width2)
        .attr('dy','1em')
        .style('text-anchor','left')
        .text('Stars')
        .style('fill','orange')


//draw assessment
    var map2=mapB0
        .append('g')
        .selectAll('.graph1')
        .data(filtered)

    var map2Enter=map2.enter()
        .append('g')
        .attr('class','graph1')
        .attr('transform','translate('+0+','+30+')')

    var map2Exit=map2.exit()
        .transition()
        .remove()
    map2
        .append('g')
        .append('line')
        .attr('class','Stars')
        .attr('id',function(d){return 'stars-'+ d.ID;})
        .attr('x1',function(d, i){
            return scaleX(i);
        })
        .attr('y1',height2)
        .attr('x2', function(d,i){
            //return 100;
            return scaleX(i);
        })
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
            var BlingBling5 =d3.select(this)
                .style('opacity',1)
                .style('stroke','#6514ED')
                .style('stroke-width',8)
            var div=d3.select('#tooltip2')
            div
                .transition()
            div
                .style('opacity',1)
                .html("Room ID:" + d.ID+ " | Review:" + d.Review+ " |  Assessment:" + d.AveStar )
                .style("left", (xy[0]+210) + "px")
                .style("top", function(d){
                    return (xy[1]+"px");
                   })
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
                .style("opacity",.7)
            var div=d3.select('#tooltip2')
            div.style('opacity',0)
        })


//draw reviews
    map2
        .append('g')
        .append('line')
        .attr('class','Reviews')
        .attr('id',function(d){return 'review-'+ d.ID;})
        .attr('x1',function(d, i){
           return scaleX(i);
        })
        .attr('y1',height2)
        .attr('x2', function(d,i){
            //return 100;
            return scaleX(i);
        })
        .attr('y2',function(d){
            if (d.Review==undefined) {return height2; }
            else {return  scaleY1(d.Review)}
        })
        .style('stroke','red')
        .style('stroke-width',1)
        .style('opacity',.65)

        .on('mouseover',function(d) {
            var xy = d3.mouse(map2.node());
            var BlingBling5 = d3.select(this)
                .style('opacity', 1)
                .style('stroke','#7DF12A')
                .style('stroke-width', 8)
            var div = d3.select('#tooltip2')
            div
                .transition()
            div
                .style('opacity', 1)

                .html("Room ID:" + d.ID + ",  Review:" + d.Review + ", Star:" + d.AveStar)
                .style("left", (xy[0] + 210) + "px")
                .style("top", function (d) {
                    return (xy[1] + "px");
                })
        })
        .on('mouseout',function(){
            var BlingBling5=d3.select(this)
                .transition()
                .duration(400)
                .style('stroke','red')
                .style('stroke-width',1)
                .style("opacity",.65)
            var div=d3.select('#tooltip2')
            div.style('opacity',0)
        })


    dispatch.on('map1Select',function(roomId){
        //Get unemployment time series for a particular state
        // var xy = d3.mouse(map2.node());
        //var BlingBling5 = d3.select('#stars-'+ roomId)
        //    .style('opacity', 1)
        //    .style('stroke','#6514ED')
        //    .style('stroke-width', 8)
        var BlingBling51 = d3.select('#review-'+ roomId)
            .style('opacity', 1)
            .style('stroke','#7DF12A')
            .style('stroke-width', 8)

        var div = d3.select('#tooltip2')
        div
            .transition()
        div
            .style('opacity', 1)
            .html("Room ID:" + roomId + ' | Room Reviews:' + reviewById.get(roomId)[0] + ' | Assessment ' + reviewById.get(roomId)[1])
            .style("left", (210) + "px")
            .style("top", function (d) {
                return (100 + "px");
            })

    });

    dispatch.on('map1deSelect',function(roomId){
        d3.select('#stars-'+roomId).remove();
        d3.select('#review-'+roomId).remove();

    })



}
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
//type rooms
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
        .call(BlingBling4)
    mapC1=mapC
        .transition()
        .duration(1000)
        .attr('r','10px')
        .style('opacity',.3)
    mapC2=mapC1
        .transition()
        .duration(1000)
        .attr('r','3px')
        .style('opacity',.8)


}

function getTooltips1(selection){
    selection
        .on('mouseenter',function(d){
            d3.select(this) //this --> selection
                .transition()
                .duration(2000)
                .attr('r','5px')

            //tooltip
            var tooltip=d3.select('#tooltip1');
            tooltip
                .transition()
                .style('opacity',1);
            tooltip.select('#r_id').html(d.ID)
            tooltip.select('#city').html(d.City)
            tooltip.select('#addr').html(d.Address)
            tooltip.select('#rtypes').html(d.Type)
            tooltip.select('#bedroom').html(d.BedNum)
            tooltip.select('#bathroom').html(d.BathNum)
            tooltip.select('#price').html(d.Price)
            tooltip.select('#town_id').html(d.TownID)
            tooltip.select('#town').html(d.Town)
            //tooltip.select('#reviews').html(d.Review)
            //tooltip.select('#stars').html(d.AveStar)
        })
        .on('mousemove',function(){
            var xy=d3.mouse(map1.node());
            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .style('left',(width/2)+66+'px')
                .style('top',function(d){
                    if((xy[1]+50)<162){  return 162+'px';}

                else if((xy[1]+50)>350)
                    { return 350+'px';}
                else
                    { return (xy[1]+50)+'px' }    })
            // .style('top',(xy[1]+50)+'px')
            //.html('test');

        })
        .on('mouseleave',function(){
            d3.select(this)
                .transition()
                .duration(2000)

                .attr('r','3px')
               // .style('fill','#9030FF')
            var tooltip=d3.select('custom-tooltip')
                //.style('opacity',0);
        }
    )
}
//block blingbling
function BlingBling1(selection){
    selection
        .on('mouseenter',function(d){
            d3.select(this)//this --> selection
                .transition()
                .duration(100)
                .style('fill','rgba(0,0,255,.1)')
                .style('stroke','red')
                .style('stoke-width','10px')
        })

        .on('mouseleave',function(){
            d3.select(this)
                .transition()
                .duration(2000)
                .style('fill','rgba(0,0,255,0)')
                .style('stroke','blue')
                .style('stroke-width','.5px')
                .style("stroke-dasharray", ("1, 1"))
        })
}
//neighbor name blingbling
function BlingBling2(selection){
    selection
        .on('mouseenter',function(d){
            var sel = d3.select(this);
            sel.moveToFront();
            d3.select(this)
                .moveToFront()
                .transition()
                .duration(200)
                .style('opacity',1)

        })
        .on('mouseover',function(d){
            d3.select(this)
            .moveToFront();
        })
        .on('mouseleave',function(d){
            d3.select(this)
                .transition()
                .duration(2000)
                .style('opacity',0)
        })
}
//all points blingbling
function BlingBling3(selection){
    selection
        .on('mouseenter',function(d){
            d3.select(this)//this --> selection
                .transition()
                .duration(200)
                .style('r',10)
                .style('fill',"red")

        })
        .on('mouseleave',function(d){
            d3.select(this)
                .transition()
                .duration(1000)
                .style('r',3)
                .style('fill',"#9030FF")
                .style('opacity',0.6)
        })
}
//type points blingbling
function BlingBling4(selection){
  console.log(selection);
    selection.each(function(e) {
        e.on('mouseenter',function(d){
            // console.log('bingbling4')
            var sel = d3.select(this);
            sel.moveToFront();
           // this.parentElement.appendChild(this);

            var mapC=d3.select(this)
                .transition()
                .duration(200)
                .attr('r',10)
                .style('fill','blue')//this --> selection
            mapC1=mapC
                .transition()
                .duration(200)
                .style('opacity',.3)

        })

        e.on('mouseleave',function(d){
            var mapC=d3.select(this)
                .transition()
                .duration(1000)
                .attr('r',3)
                .style('fill',function(d){
                    if(d.Type=="Private room"){return colorType[1]; }
                    else if(d.Type=="Shared room"){ return colorType[2]; }
                    else if(d.Type=="Entire home/apt"){ return colorType[3]; }
                    else { return "black"; }
                })
                .style('opacity',.8)
        })
      });
}
//


var reviewById = d3.map();

function parseData(d){
    reviewById.set(+d.room_id, [+d['reviews'], +d['overall_sa']])
    return {
        ID:+d.room_id,
        X: +d.X,
        Y: +d.Y,
        Type:d['room_type'],
        City:d['city'],
        Neighbor:d['neighborho'],
        Address:d['address'],
        Review:+d['reviews'],
        AveStar:+d['overall_sa'],
        AccomNum:+d['accommodat'],
        BedNum:+d['bedrooms'],
        BathNum:+d['bathrooms'],
        Price:+d['price'],
        TownID:+d['town_id'],
        Town:d['town']
    }
}
