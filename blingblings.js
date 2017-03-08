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
                .style('opacity',1);
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
            .style('fill',colorType[0])
            .style('opacity',0.6)
    })
}
//type points blingbling
function BlingBling4(selection){
  // console.log(selection);
  selection
  .on('mouseenter',function(d){
      d3.select(this)//this --> selection
          .transition()
          .duration(200)
          .style('r',10)
          .style('fill',"red");
  })
  .on('mouseleave',function(d){
      d3.select(this)
          .transition()
          .duration(1000)
          .style('r',3)
          .style('fill',colorType[0])
          .style('opacity',0.6);
  })
}
