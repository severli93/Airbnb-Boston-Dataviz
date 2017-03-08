var margin = {t:80,r:50,b:80,l:50};
var width = document.getElementById('map1').clientWidth - margin.r - margin.l,
    height = $(window).height()*0.7 - margin.t - margin.b;
console.log('height',height);
var margin2 = {t:20,r:50,b:50,l:50};
var width2 = document.getElementById('map2').clientWidth - margin.r - margin.l,
    height2 = document.getElementById('map2').clientHeight - margin.t - margin.b;

var map1 = d3.select('#map1')
    .append('svg')
    .attr('width',width + margin.l + margin.r)
    .attr('height',height + margin.t + margin.b)
    .call(d3.behavior.zoom().on("zoom",function(){
      map1.attr("transform","translate("+ d3.event.translate + ")" + "scale(" +d3.event.scale + ")")
    }))
    .append('g')
    .attr('class','canvas-map1')
    .attr('transform','translate('+margin.l*(1)+','+margin.t*(1)+')');

var map2 = d3.select('#map2')
    .append('svg')
    .attr('width',width2 + margin2.r + margin2.l)
    .attr('height',height2 + margin2.t + margin2.b)
    .append('g')
    .attr('class','canvas-map2')
    .attr('transform','translate('+margin2.l+','+margin2.t+')');

var map3 = d3.select('#map3')
    .append('svg')
    .attr('width',width2 + margin2.r + margin2.l)
    .attr('height',height2 + margin2.t + margin2.b)
    .append('g')
    .attr('class','canvas-map2')
    .attr('transform','translate('+margin2.l+','+margin2.t*(1)+')');

var mapA0 = map1;
var mapB0 = map2;
var mapB1 = map3;
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
var colorType=['rgb(255,90,95)','rgb(144,48,255)','rgb(255,180,0)','rgb(66,134,244)','rgb(0,166,153)'];//red,purple,yellow,blue,green
var colorScale=d3.scale.linear().domain([0,34]).range(['white',colorType[0]]);
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
.await(dataLoaded);


function dataLoaded (err,census,neighbors, airbnb){
  var newCensusFeatures=census.features;
  //console.log('features are ',newCensusFeatures);
  airbnb = airbnb.filter(function(d) {
    return d.Review != 0;
  })
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
        document.querySelectorAll("#rDensity input")[0].checked = false;
        document.querySelectorAll("#rType input")[0].checked = false;
          drawClearAll(census,neighbors,airbnb);
        drawInitial(census,neighbors,airbnb);}
      if(id == "rInitial"){
          drawInitial(census,neighbors,airbnb);}
  })
  //draw bar charts below
  drawGraph1(census,neighbors,airbnb);
  drawGraph2(census,neighbors,airbnb);
}


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
