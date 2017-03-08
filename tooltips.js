function getTownname(selection){
  selection
  .on('mouseenter',function(d){
    d3.select('#tooltip1').select('#block').html(d.properties.name)
  })
}
function getTooltips1(selection){
  var tooltip=d3.select('#tooltip1');
  selection
  .on('mouseenter',function(d){
    console.log(d);
      d3.select(this) //this --> selection
          .transition()
          .duration(2000)
          .attr('r','5px');
      tooltip
      .transition()
      .style('background-color','rgba(238,238,238,0.5)')
      .style('opacity',1);
      tooltip.select('#r_id').html(d.ID);
      tooltip.select('#city').html(d.City);
      tooltip.select('#addr').html(d.Address);
      tooltip.select('#rtypes').html(d.Type);
      tooltip.select('#bedroom').html(d.BedNum);
      tooltip.select('#bathroom').html(d.BathNum);
      tooltip.select('#price').html(d.Price);
      tooltip.select('#town_id').html(d.TownID);
      tooltip.select('#reviewNo').html(d.Review);
      tooltip.select('#stars').html(d.AveStar);
  })
  .on('mousemove',function(){
    var xy=d3.mouse(map1.node());
    // var tooltip=d3.select('.custom-tooltip');
    tooltip
    .style('left',(width/2)+66+'px')
    .style('top',function(d){
      if((xy[1]+50)<162){  return 162+'px';}
      else if((xy[1]+50)>350){ return 350+'px';}
      else { return (xy[1]+50)+'px'; }
    })
  })
  .on('mouseout',function(){
    d3.select(this)
        .transition()
        .duration(1000)
        .style('opacity',0);
    // var tooltip=d3.select('custom-tooltip');
    tooltip
    .transition()
    .duration(500)
    .style('opacity',0);
  })
}
