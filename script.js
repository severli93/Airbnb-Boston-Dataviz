/**
 * Created by xingyueli on 12/3/15.
 */
console.log("Assignment 5");

var margin = {t:-80,r:100,b:80,l:100};
var width = document.getElementById('map1').clientWidth - margin.r - margin.l,
    height = document.getElementById('map1').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map1 = canvas
    .append('svg')
    map1
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');
//var map2 = canvas
//    .append('svg')
//    .attr('width',width+margin.r+margin.l)
//    .attr('height',height)
//    .append('g')
//    .attr('class','canvas')
//    .attr('transform','translate('+margin.l+','+margin.t+')');

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston

var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html

var projection = d3.geo.mercator()
    .translate([width/2,height/2])
    .center([bostonLngLat[0],bostonLngLat[1]])
    .scale(100000/.62)

//TODO: create a geo path generator
var pathGenerator = d3.geo.path().projection(projection);

//TODO: create a color scale
//var scaleColor=d3.scale.linear().domain([1,2,3]).range(['blue','orange','yellow']);
var colorScale=d3.scale.linear().domain([0,34]).range(['white','red']);


//TODO: create a d3.map() to store the value of airbnb room number per block group
var airbnbRoom=d3.map()
//TODO: import data, parse, and draw
queue()
    .defer(d3.json,'data/bos_census_blk_group_merge.geojson')
    .defer(d3.json,'data/bos_neighborhoods_merge.geojson')
    .defer(d3.csv,'data/boston_listings_cleaned.csv',parseData)
    .defer(d3.csv,'data/boston_listings_cleaned_metadata.csv',parseMetaData)
    .await(dataLoaded)


    function dataLoaded (err,census,neighbors, airbnb,metadata){

        d3.selectAll('.btn').on('click',function(){
            //find out which year is clikced
            var btn=d3.select(this).attr('id')

            if(btn=='rDensity'){
                draw(census,neighbors,airbnb)
            }else{
                draw2(census,neighbors,airbnb)
            }
        })
    }


function parseData(d){
    return{
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
function parseMetaData(d){
    //metadata.set(d.item1, d.classification)
    //   metadata.set(d.activity1, +d.classification)
}

function draw(census,neighbors,airbnb){
  var newCensusFeatures=census.features;
    console.log('features are ',newCensusFeatures)
    function OutsideFilter(element, index, array){
       return element.Town=="Boston";
    }
airbnb_filtered = airbnb.filter(OutsideFilter);
    console.log("airbnb_filtered",census, airbnb,airbnb_filtered);

    var mapA = map1.append('g')
        .selectAll('.map-block')
        .data(newCensusFeatures)
        .enter()
        .append('g')
        .attr('class','map-block')

    mapA
        .append('path')
        .attr('d', pathGenerator)
        .filter(function (d) {
            return d.properties.intersect_count >=0 ;
        })
        //.style('fill','#C5FFEF')
        .style('fill',function(d){
            //console.log(d);
            var count;
            count= d.properties.intersect_count
            //console.log(count)
            return colorScale(count)
        })
        .style('stroke','#6E6D6D')
        .style('stroke-width','.3px')



//2. draw neighbor outline to show the neighbor name
    var mapB= map1.append('g')
        .selectAll('.map-neighbors')
        .data(neighbors.features)
        .enter()
        .append('g')
        .attr('class','map-neighbors')

    mapB
        .append('path')
        .attr('d', pathGenerator)
        .style('fill','none')
        .style('stroke','blue')
        .style('stroke-width','.5px')
        .style("stroke-dasharray", ("1, 1"))//dashline
        //.call(BlingBling1)

    mapB
        .append('text')
        .attr('class','text')
        .attr("text-anchor", "middle")
        .text(function(d){return d.properties.name;})
        .attr('dx',function(d){return pathGenerator.centroid(d)[0]})
        .attr('dy',function(d){return pathGenerator.centroid(d)[1]})
        .style('fill','#646464')
        .call(BlingBling2)


}
function draw2(census,neighbors,airbnb){
    //console.log(airbnb);
    //console.log('blocks data is ',blocks)
    //console.log('neighbors data is ',neighbors)
    //console.log('metadata is ')

    //1.draw census block based on room number
    //before 1. filter the room number outside of the map

    var newCensusFeatures=census.features;
    console.log('features are ',newCensusFeatures)
    function OutsideFilter(element, index, array){
        return element.Town=="Boston";
    }
    airbnb_filtered = airbnb.filter(OutsideFilter);
    //console.log('census are ',census)
    //console.log('features are ',census.features)
    console.log("airbnb_filtered",census, airbnb,airbnb_filtered);

    var mapA = map1.append('g')
        .selectAll('.map-block')
        .data(newCensusFeatures)
        .enter()
        .append('g')
        .attr('class','map-block')

    mapA
        .append('path')
        .attr('d', pathGenerator)
        .filter(function (d) {
            return d.properties.intersect_count >=0 ;
        })
        //.style('fill','#C5FFEF')
        .style('fill',function(d){
            //console.log(d);
            var count;
            count= d.properties.intersect_count
            //console.log(count)
            return colorScale(count)
        })
        .style('stroke','#6E6D6D')
        .style('stroke-width','.3px')



//2. draw neighbor outline to show the neighbor name
    var mapB= map1.append('g')
        .selectAll('.map-neighbors')
        .data(neighbors.features)
        .enter()
        .append('g')
        .attr('class','map-neighbors')

    mapB
        .append('path')
        .attr('d', pathGenerator)
        .style('fill','none')
        .style('stroke','blue')
        .style('stroke-width','.5px')
        .style("stroke-dasharray", ("1, 1"))//dashline
    //.call(BlingBling1)

    mapB
        .append('text')
        .attr('class','text')
        .attr("text-anchor", "middle")
        .text(function(d){return d.properties.name;})
        .attr('dx',function(d){return pathGenerator.centroid(d)[0]})
        .attr('dy',function(d){return pathGenerator.centroid(d)[1]})
        .style('fill','#646464')
        .call(BlingBling2)

}
function draw2(census,neighbors,airbnb){

    var newCensusFeatures=census.features;
    console.log('features are ',newCensusFeatures)
    function OutsideFilter(element, index, array){
        return element.Town=="Boston";
    }
    airbnb_filtered = airbnb.filter(OutsideFilter);

    console.log("airbnb_filtered",census, airbnb,airbnb_filtered);

//3. draw points of room location
    // and append the tooltip to show the information
    var mapC= map1.append('g')
        .selectAll('.map-datapoints')
        .data(airbnb)
        .enter()
        .append('g')
        .attr('class','map-datapoints')
    mapC
        .append('circle')
        //make a filter to drop extra data out side of Boston town
        .filter(function(d) { return d.Town =='Boston' })
        .attr('cx',function(d){return projection([d.X, d.Y])[0]})
        .attr('cy',function(d){return projection([d.X, d.Y])[1]})
        .attr('r','3px')
        .style('fill','#9030FF')
        .style('opacity',.4)
        .style('stroke','rgb(80,80,80)')
        .style('stroke-width','1px')
        .call(getTooltips1)


}
/*
function draw3(census,neighbors,airbnb){
    //console.log(airbnb);
    //console.log('blocks data is ',blocks)
    //console.log('neighbors data is ',neighbors)
    //console.log('metadata is ')

    //1.draw census block based on room number
    //before 1. filter the room number outside of the map

    var newCensusFeatures=census.features;
    console.log('features are ',newCensusFeatures)
    function OutsideFilter(element, index, array){
        return element.Town=="Boston";
    }
    airbnb_filtered = airbnb.filter(OutsideFilter);
    //console.log('census are ',census)
    //console.log('features are ',census.features)
    console.log("airbnb_filtered",census, airbnb,airbnb_filtered);

    var mapA = map1.append('g')
        .selectAll('.map-block')
        .data(newCensusFeatures)
        .enter()
        .append('g')
        .attr('class','map-block')

    mapA
        .append('path')
        .attr('d', pathGenerator)
        .filter(function (d) {
            return d.properties.intersect_count >=0 ;
        })
        //.style('fill','#C5FFEF')
        .style('fill',function(d){
            //console.log(d);
            var count;
            count= d.properties.intersect_count
            //console.log(count)
            return colorScale(count)
        })
        .style('stroke','#6E6D6D')
        .style('stroke-width','.3px')



//2. draw neighbor outline to show the neighbor name
    var mapB= map1.append('g')
        .selectAll('.map-neighbors')
        .data(neighbors.features)
        .enter()
        .append('g')
        .attr('class','map-neighbors')

    mapB
        .append('path')
        .attr('d', pathGenerator)
        .style('fill','none')
        .style('stroke','blue')
        .style('stroke-width','.5px')
        .style("stroke-dasharray", ("1, 1"))//dashline
    //.call(BlingBling1)

    mapB
        .append('text')
        .attr('class','text')
        .attr("text-anchor", "middle")
        .text(function(d){return d.properties.name;})
        .attr('dx',function(d){return pathGenerator.centroid(d)[0]})
        .attr('dy',function(d){return pathGenerator.centroid(d)[1]})
        .style('fill','#646464')
        .call(BlingBling2)


//3. draw points of room location
    // and append the tooltip to show the information
    var mapC= map1.append('g')
        .selectAll('.map-datapoints')
        .data(airbnb)
        .enter()
        .append('g')
        .attr('class','map-datapoints')
    mapC
        .append('circle')
        //make a filter to drop extra data out side of Boston town
        .filter(function(d) { return d.Town =='Boston' })
        .attr('cx',function(d){return projection([d.X, d.Y])[0]})
        .attr('cy',function(d){return projection([d.X, d.Y])[1]})
        .attr('r','3px')
        .style('fill','#9030FF')
        .style('opacity',.4)
        .style('stroke','rgb(80,80,80)')
        .style('stroke-width','1px')
        .call(getTooltips1)
    //map.append('line').attr('class','line')
//    .attr('x1',albertsUsaProjection(lngLatBoston)[0])
//    .attr('x2',albertsUsaProjection(lngLatSF)[0])
//    .attr('y1',albertsUsaProjection(lngLatBoston)[1])
//    .attr('y2',albertsUsaProjection(lngLatSF)[1])

//        .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
//        .attr("cy", function (d) { return projection(d)[1]; })


}
*/
function getTooltips1(selection){
    selection
        .on('mouseenter',function(d){
            //blingbling
            d3.select(this) //this --> selection
                .transition().style('fill','#00F5FF')
                .style('opacity',1)
            //tooltip
            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);
            tooltip.select('#r_id').html(d.ID)
            tooltip.select('#city').html(d.City)
            tooltip.select('#addr').html(d.Address)
            tooltip.select('#bedroom').html(d.BedNum)
            tooltip.select('#bathroom').html(d.BathNum)
            tooltip.select('#price').html(d.Price)
            tooltip.select('#town_id').html(d.TownID)
            tooltip.select('#town').html(d.Town)

        })
        .on('mousemove',function(){
            var xy=d3.mouse(canvas.node());
            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .style('left',xy[0]+150+'px')
                .style('top',(xy[1]+50)+'px')
            //.html('test');

        })
        .on('mouseleave',function(){
            d3.select(this).style('fill','#9030FF')
            var tooltip=d3.select('custom-tooltip')
                .style('opacity',0);
        }
    )
}
function BlingBling2(selection){
    selection
        .on('mouseenter',function(d){
            d3.select(this).style('fill','#4FE126')
        })

        .on('mouseleave',function(){
            d3.select(this).style('fill','#646464')
        })
}
