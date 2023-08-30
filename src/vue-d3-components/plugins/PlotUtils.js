var utils = {

    /**
 * Expands the width of the svg, if the title has a longer width, then the content.
 * Additionally aligns the title left and places it to margin.left
 */
    expandChartSizeToTitle: function (svg, d3Title, width, margin) {
        var titleWidth = d3Title.node().getBBox().width;
        var titlePadding = 10;
        if (titleWidth > width) {
            var newWidth = Math.max(titleWidth + margin.left + titlePadding, width + margin.left + margin.right);
            svg.attr('width', newWidth);
            d3Title
                .attr('x', margin.left)
                .attr('text-anchor', 'left');
        }
    }
}
export default utils
