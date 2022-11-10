const educationDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const color = ['#2FA236', '#59B55E', '#82C786', '#ACDAAF', '#D5ECD7', '#EAF6EB'];

let svg = d3.select("#svg-area");
let legend = d3.select("#legend");
let tooltip = d3.select('body')
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

d3.queue()
    .defer(d3.json, educationDataURL)
    .defer(d3.json, countyDataURL)
    .awaitAll(ready);

function ready(error, response) { 
    if (error) {
        console.log(error)
    }
    let educationData = response[0];
    console.log(educationData);
    let countyData = topojson.feature(response[1], response[1].objects.counties).features;
    
    let colorScale = d3.scaleQuantize()
        .domain(d3.extent(educationData.map((data) => {
            return data.bachelorsOrHigher;
        })))
        .range(color);

    svg.selectAll('path')
        .data(countyData)
        .enter()
        .append('path')
        .attr('d', d3.geoPath())
        .attr('class', 'county')
        .attr('stroke', 'white')
        .attr('stroke-width', 0.25)
        .attr('fill', (data) => {
            let id = data.id;
            let county = educationData.find((county) => {
                return county.fips === id;
            });
            let percentage = county.bachelorsOrHigher;
            return colorScale(percentage);
        })
        .attr('data-fips', (data) => {
            return data.id;
        })
        .attr('data-education', (data) => {
            let id = data.id;
            let county = educationData.find((county) => {
                return county.fips === id;
            });
            return county.bachelorsOrHigher;
        })
        .on("mouseover", function (data) {
            let county = educationData.find((county) => {
                return county.fips === data.id;
            });

            tooltip.transition()
                .duration("100")
                .style("opacity", 0.9);
            tooltip.html(county.area_name + ', ' + county.state + ': ' + county.bachelorsOrHigher + '%')
                .style("left", (d3.event.pageX + 25) + "px")
                .style("top", (d3.event.pageY - 20) + "px")
                .attr("data-education", county.bachelorsOrHigher);
        })
        .on("mouseout", (data) => {
            tooltip.transition()
                .duration("100")
                .style("opacity", 0);
        });

    const legendWidth = 200;
    const legendHeight = 15;
    const legendCellWidth = legendWidth / color.length;

    legend.selectAll('rect')
        .data(color)
        .enter()
        .append('rect')
        .attr('width', legendCellWidth)
        .attr('height', legendHeight)
        .attr('y', 20)
        .attr('x', (data, i) => {
            return 600 + legendCellWidth * i;
        })
        .attr('fill', (data) => data)
        
    legend.selectAll('text')
        .data(color)
        .enter()
        .append('text')
        .text((data) => {
            console.log(data);
            console.log(colorScale.invertExtent(data));
            console.log(d3.format('%')(colorScale.invertExtent(data)[1] / 100));
            return d3.format('0.0%')(colorScale.invertExtent(data)[1] / 100);
        })
        .attr('x', (data, i) => {
            return 600 + legendCellWidth * (1 + i);
        })
        .attr('y', 50)
        .style('font-size', '12px');
}