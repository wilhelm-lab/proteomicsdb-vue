<template>
  <v-row>
    <v-col cols="12" lg="6" xl="3">
      <template v-for="(druglist, listIndex) in concentrationSliderList">
        <div v-if="druglist.drugs.length>0" :key="listIndex">
          <v-card flat class="pa-2">
            <h2>{{ druglist.header }}</h2>
            <v-checkbox
                class="group-checkbox"
                label="Show/Hide all"
                @change="onGroupCheckboxChange($event, listIndex)"
                v-model="groupCheckboxList[listIndex]"
            />
            <v-divider class="mb-2 mx-4"/>
            <v-virtual-scroll
                :bench="druglist.drugs.length"
                :items="druglist.drugs"
                :item-height="150"
                max-height="300"
            >
              <template v-slot:default="{ index, item }">
                <h3 v-if="druglist.targets">{{ druglist.targets[index] }}</h3>
                <v-checkbox
                    class="drug-checkbox"
                    v-model="sliderCheckboxesList[listIndex][index]"
                    :label="item.text"
                ></v-checkbox>
                <logarithmic-slider
                    :min-value="3"
                    :max-value="30000"
                    :width="125"
                    :value="sliderValuesList[listIndex][index]"
                    :show-labels="false"
                    title="Set dose [nM]"
                    @updateValue="(value) => setDrugSliderValue(item, value)"
                ></logarithmic-slider>
              </template>
            </v-virtual-scroll>
          </v-card>
        </div>
      </template>
    </v-col>

    <v-col cols="12" lg="6" xl="2">
      <v-card elevation="0">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-col cols="1" v-bind="attrs" v-on="on">
              <v-slider
                  v-model="effectiveInhibitionSliderValue"
                  label="Inhibition Threshold"
                  max="100"
                  min="0"
                  vertical
                  thumb-label="always"
                  :tick-labels="tickLabels"
                  ticks="always"
                  tick-size="0"
                  step="1"
              ></v-slider>
            </v-col>
          </template>
          <span>Effective inhibition threshold for visualization.</span>
        </v-tooltip>
      </v-card>
    </v-col>

    <v-col cols="12" xl="7" class="mx-0">
      <div id="interactionGraphContainer" class="interaction-graph-container">
        <svg id="interactionGraph" :viewBox="'0 0 ' + width + ' ' + height" :style="cssProps">
          <rect
              :width="width"
              :height="height"
              fill="none"
          />
          <svg
              id="interactionGraphLegend"
              :width="legendWidth"
              :height="legendHeight"
              x="2.5"
              y="2.5"
          ></svg>
        </svg>
      </div>
    </v-col>
  </v-row>
</template>

<script>

import LogarithmicSlider from '@/components/LogarithmicSlider'

const d3 = require("d3v6");

export default {
  name: "ProteinDrugInteractionGraph",
  components: {
    LogarithmicSlider
  },
  props: {
    graphData: {
      type: Object,
      default: () => {
      },
    },
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 500
    },
    selectedDrugs: {
      type: Array,
      default: () => []
    },
    catdsData: {
      type: Array,
      default: () => []
    },
  },

  data() {
    return {
      legendHeight: 78,
      legendWidth: 260,
      processedData: {nodes: [], links: []},
      processedDataFiltered: {nodes: [], links: []},
      fontFamily: 'Arial,Helvetica,sans-serif',
      fontSize: '12px',
      tickLabels: ['0%'].concat(Array(99).fill(""), ['100%']),
      // tickLabelsDrugs: ['3', '30000'],
      sliderValuesList: [[], [], []],
      sliderCheckboxesList: [[], [], []],
      groupCheckboxList: [],
      effectiveInhibitionSliderValue: 0,
      zoom: undefined,
    };
  },
  computed: {
    /** @returns {any} */
    cssProps() {
      return {
        'min-width': this.width,
        'min-height': this.height
      }
    },
    /** @returns {any} */
    allVisibleDrugs() {
      if (typeof this.graphData !== 'undefined') {
        let res = []
        Object.entries(this.graphData.treatments).forEach((treatment) => {
          res.push({
            text: treatment[1].treatment,
            value: treatment[1].drugId
          })
        })
        return res
      } else {
        return []
      }
    },
    /** @returns {any} */
    secondaryDrugs() {
      /*These are drugs that were not selected explicitly, but came by selecting a protein.
      We want to sort them and only them by CATDS score (grouped by targets), so we need a list where
      the selected drugs are removed
       */
      let selectedDrugIds = this.selectedDrugs.map((d) => d.value)
      return this.allVisibleDrugs.filter((drug) => {
        return !selectedDrugIds.includes(drug.value)
      })

    },
    /** @returns {any} */
    drugsByCatds() {
      /*Here we go ~ FH, 2022*/
      /* Take secondaryDrugs (List of drug objects with text: "drugname", value: "ID")
      * Take Axios Call return: List of CATDS objects, look like this:
      *  { "CATDS": 0.69854, "DRUG_EXPERIMENTAL_FACTOR_CV_ID": 256, "EXPERIMENT_DESIGN_ID": 46, "HIT_TARGETS": "EGFR" },
      * GroupBy HIT_TARGETS
      * Take TopN (Default 1), Resulting list: [[{TopN 1}, {...}m ...], [{Rest1}, {...}, ...]]
      * */
      let secondaryDrugsIds = this.secondaryDrugs.map((d) => d.value)
      let catdsDataFilter = this.catdsData.filter((d) => {
        return secondaryDrugsIds.includes(d.DRUG_EXPERIMENTAL_FACTOR_CV_ID)
      })
      let groupedDrugs = catdsDataFilter.reduce((acc, catdsentry) => {
        // Group initialization
        if (!acc[catdsentry.HIT_TARGETS]) {
          acc[catdsentry.HIT_TARGETS] = [];
        }
        // Grouping
        acc[catdsentry.HIT_TARGETS].push(catdsentry);
        return acc;
      }, {});
      let topNArray = []
      let remainingDrugArray = []
      let topNTargets = []
      Object.keys(groupedDrugs).forEach((sProteins) => {
        let druggroup = groupedDrugs[sProteins]
        let lProteins = sProteins.split(',')
        druggroup.sort((drug1, drug2) => {
          if (drug1.CATDS > drug2.CATDS) return -1
          else if (drug2.CATDS > drug1.CATDS) return 1
          else {
            //Filter links for those where target is either of the two drugs and source is any of the proteins of interest
            let relevantLinks = this.processedData.links.filter(link => {
              return (link.target.id === drug1.DRUG_EXPERIMENTAL_FACTOR_CV_ID ||
                  link.target.id === drug2.DRUG_EXPERIMENTAL_FACTOR_CV_ID ||
                  lProteins.includes(link.source.name))
            })
            let ec50Drug1 = relevantLinks
                .filter(link => link.target.id === drug1.DRUG_EXPERIMENTAL_FACTOR_CV_ID)
                .map(link => link.ec50)
            let ec50Drug2 = relevantLinks
                .filter(link => link.target.id === drug2.DRUG_EXPERIMENTAL_FACTOR_CV_ID)
                .map(link => link.ec50)
            if(ec50Drug1.reduce((sum,x) => sum+x, 0)/ec50Drug1.length >
                ec50Drug2.reduce((sum,x) => sum+x, 0)/ec50Drug2.length){
              return 1
            }else{
              return -1
            }

          }
        })
        topNArray = topNArray.concat(this.secondaryDrugs.filter((d) => d.value == druggroup[0].DRUG_EXPERIMENTAL_FACTOR_CV_ID))
        topNTargets.push(druggroup[0].HIT_TARGETS)
        let remainingDrugIds = druggroup.slice(1).map((d) => d.DRUG_EXPERIMENTAL_FACTOR_CV_ID)
        remainingDrugArray = remainingDrugArray.concat(this.secondaryDrugs.filter((d) => remainingDrugIds.includes(d.value)))
      })
      return [topNArray, remainingDrugArray, topNTargets]
    },
    /** @returns {any[]} */
    concentrationSliderList() {
      return [{header: 'Selected drugs', drugs: this.selectedDrugs},
        {header: 'Top CATDS drugs', drugs: this.drugsByCatds[0], targets: this.drugsByCatds[2]},
        {header: 'Remaining drugs, sorted by CATDS', drugs: this.drugsByCatds[1]},]
    },
    /** @returns {any} */
    drugIdToCheckboxIndices() {
      //This computed property is a crutch - I need an O(1) mapping from drugIDs to the value of their checkbox
      //But I had to make the checkboxes a list of lists because the watcher wouldn't work otherwise
      //So this property maps the drugIDs to the indices in the nested list
      let res = {}
      this.selectedDrugs.forEach((val, index) => {
        res[val.value] = [0, index]
      })

      this.drugsByCatds[0].forEach((val, index) => {
        res[val.value] = [1, index]
      })

      this.drugsByCatds[1].forEach((val, index) => {
        res[val.value] = [2, index]
      })

      return res
    }
  },
  watch: {
    graphData: function () {
      //It would make more sense to make the checkboxes and values nested dictionaries instead of lists
      //But we couldn't make the watchers work that way, so they remain lists for now
      //If someone figures out how to fix that feel free to get rid of these lists
      this.sliderCheckboxesList = Array(Array(this.selectedDrugs.length).fill(true),
          Array(this.drugsByCatds[0].length).fill(true),
          Array(this.drugsByCatds[1].length).fill(false) //Hide these by default
      );
      this.groupCheckboxList = [true, true, false];
      //TODO: Not sure why I need to call rerender here -
      // the whole thing would anyway be rerendered since processedDataFiltered has changed
      this.rerender();
    },
    sliderCheckboxesList: function () {
      this.processedDataFiltered = {
        nodes: this.processedData.nodes.filter(node => {
          if (node.isDrug) {
            const indices = this.drugIdToCheckboxIndices[node.drugId]
            return this.sliderCheckboxesList[indices[0]][indices[1]]
          } else {
            return Object.keys(node.treatments).some((drugId) => {
              const indices = this.drugIdToCheckboxIndices[drugId]
              return this.sliderCheckboxesList[indices[0]][indices[1]]
            })
          }
        }),
        links: this.processedData.links.filter(link => {
          const indices = this.drugIdToCheckboxIndices[link.drugId]
          return this.sliderCheckboxesList[indices[0]][indices[1]]
        })
      }
    },
    processedDataFiltered: function () {
      this.rerender()
      this.enableZoomingAndPanning()
      d3.select("#interactionGraph").call(this.zoom);
      d3.select("#interactionGraph").transition().call(this.zoom.scaleTo, 0.5);

    },
    effectiveInhibitionSliderValue: function () {
      this.updateLinkTransparency();
      this.updateNodeTransparency()
    }
  },
  methods: {
    preprocessData: function () {
      if (
          typeof this.graphData !== "undefined" && typeof this.graphData.treatments !== "undefined" && typeof this.graphData.proteins !== "undefined"
      ) {
        let nodes = [];
        let links = [];
        let treatmentMatching = {};
        let nodeCounter = 0;

        Object.keys(this.graphData.treatments).forEach((drugIndex) => {
          let treatment = this.graphData.treatments[drugIndex]
          treatmentMatching[treatment.drugId] = nodeCounter;
          nodes.push({
            isDrug: true,
            name: treatment.treatment,
            drugId: treatment.drugId
          })
          nodeCounter++;
        })


        Object.keys(this.graphData.proteins).forEach((proteinIndex) => {
          let protein = this.graphData.proteins[proteinIndex];
          let treatments = {};

          nodes.push({
            isDrug: false,
            name: protein.gene_name === '' ? protein.uniqueId : protein.gene_name,
            treatments: treatments,
          })

          Object.keys(protein.treatments).forEach((drugIndex) => {
            let treatment = protein.treatments[drugIndex]
            links.push({
              source: nodes[nodeCounter],
              target: nodes[treatmentMatching[treatment.drugId]],
              drugId: treatment.drugId,
              ec50: treatment.fit.inflection,
              pec50: -(Math.log(treatment.fit.inflection / Math.pow(10, 9)) / Math.LN10),
              transparent: false, //This is so the nodes know about it, then they can go transparent once all links are
            })
            treatments[treatment.drugId] = treatment;
          })
          nodeCounter++;
        })
        this.processedData = {nodes: nodes, links: links}
      }
    },
    drawGraph: function () {
      let initial = true;

      let nodeSize = 12;

      d3.select("#interactionGraph").selectAll('g').remove();


      const simulation = d3
          .forceSimulation()
          .force(
              "link",
              d3.forceLink(this.processedDataFiltered.links)
                  .strength(0.75)
                  .distance(80)
          )
          .force("charge", d3.forceManyBody().strength((d) => d.isDrug ? -60 : -180))
          .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(0.05))


      let interactionGraph = d3.select('#interactionGraph');

      let d3ZoomableGroup = interactionGraph.append('g').attr("id", "d3ZoomableGroup");

      //TODO: Does it make sense anymore to put this property _inside_ of processedDataFiltered?
      this.processedDataFiltered.state = {
        size: {},
      }

      let min, max;
      let link = d3ZoomableGroup.selectAll('.link')
          .data(this.processedDataFiltered.links)
          .enter().append('line')
          .attr('class', 'link')
          .each((d) => {
            if (!min) {
              min = d.pec50;
              max = d.pec50;
            } else {
              min = Math.min(min, d.pec50);
              max = Math.max(max, d.pec50);
            }
          })
          .attr('stroke-width', (d) => {
            let maxStrength = 7;
            let substract = d.pec50 - min;
            return Math.max(1, Math.pow(substract, 2) / (max - min) * maxStrength / (max - min));
          })
          .on('mousedown', (e) => {
            e.stopPropagation();
          })
          .on('mouseover', function () {
            d3.select(this).classed('linkHover', true);
          })
          .on('mouseout', function () {
            d3.select(this).classed('linkHover', false);
          })
          .on('click', (e, d) => {
            //SetDrugSliderValue expects an object with attributes text and value
            this.setDrugSliderValue({text: d.target.name, value: d.target.drugId}, d.ec50)
          });

      link.append('title')
          .text((d) => {
            return `EC50 of ${d.target.name} on ${d.source.name}: ${d.ec50.toFixed(2)} nM.${'\n'}Click to set the dose of the drug to this value.`
          });


      // append background shapes to overlay links
      let backgroundShapes = d3ZoomableGroup.selectAll('.backgroundShapes')
          .data(this.processedDataFiltered.nodes)
          .enter().append((d) => {
            if (d.isDrug) {
              return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            }
            return document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          })
          .classed('node', true)
          .attr('class', 'backgroundShapes')
          .attr('r', nodeSize / 2)
          .attr('width', nodeSize)
          .attr('height', nodeSize)

      // append circles to d3ZoomableGroup
      let node = d3ZoomableGroup.selectAll('.node')
          .data(this.processedDataFiltered.nodes)
          .enter().append((d) => {
            if (d.isDrug) {
              return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            }
            return document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          })
          .classed('node', true)
          .classed('rectangle', (d) => {
            return d.isDrug;
          })
          .classed('circle', (d) => {
            return !d.isDrug;
          })
          .attr('r', nodeSize / 2)
          .attr('width', nodeSize)
          .attr('height', nodeSize)
          .style('fill', (d) => {
            if (!d.isDrug && d.maxInhibition) {
              return this.colorGradient(0, 100, d.maxInhibition, '#E8f4FF', '#0053AF');
            }
            return false;
          })
          .on('mousedown', (e) => {
            e.stopPropagation();
          })

      node.each(function dummy(d) {
        let title = d.name;
        let d3Title = d3.select(this).append('title');
        d3Title.text(title);
        //Used to be done as below in all Browsers except Internet Explorer
        //Nowadays it seems that the IE version has become the standard
        // let aText = title.split('\n');
        // aText.forEach((line) => {
        //   d3Title.append('tspan').text(line).attr('class', 'whiteSpaces');
        //   d3Title.append('tspan').attr('class', 'lineBreak');
        // })
      });

      let nodeLabel = d3ZoomableGroup.selectAll('.nodeLabel')
          .data(this.processedDataFiltered.nodes)
          .enter()
          .append('text')
          .attr('class', 'nodeLabel')
          .classed('drugText', (d) => {
            return d.isDrug;
          })
          .text((d) => {
            return d.name;
          })
          .style('font-family', this.fontFamily)
          .style('font-size', this.fontSize)

      this.appendLegend(nodeSize);

      //Define drag behaviour
      function dragNodes(sim) {
        function dragstarted(event) {
          if (!event.active) sim.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
          d3.select('#interactionGraph').classed('svgDrag', true);
        }

        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event) {
          if (!event.active) sim.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
          d3.select('#interactionGraph').classed('svgDrag', false);
        }

        return d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
      }

      //Apply drag behaviour to the nodes of the graph
      d3.selectAll(".node").call(dragNodes(simulation));

      simulation.nodes(this.processedDataFiltered.nodes)
          .on("tick", () => {
            this.applyCoordinates(link, node, backgroundShapes, nodeLabel, nodeSize);
            this.refreshCurrentForceGraphSize(this.processedDataFiltered.state.size, this.processedDataFiltered.nodes, this.width, this.height);

          })

      //It is weird that I need to call this once more here, but otherwise neither dragging nor zooming works
      this.applyCoordinates(link, node, backgroundShapes, nodeLabel, nodeSize);
      this.refreshCurrentForceGraphSize(this.processedDataFiltered.state.size, this.processedDataFiltered.nodes, this.width, this.height);

    },
    rerender: function () {
      this.preprocessData();

      //Initialize the effective inhibition for all links associated with that drug
      this.allVisibleDrugs.forEach((drug) => this.updateEffectiveInhibitionsOfDrug(drug, 3))
      this.drawGraph()

      //Reset all slider Values to 3
      this.sliderValuesList = Array(Array(this.selectedDrugs.length).fill(3),
          Array(this.drugsByCatds[0].length).fill(3),
          Array(this.drugsByCatds[1].length).fill(3)
      );

      //Reset the effective inhibition slider
      this.effectiveInhibitionSliderValue = 0
    },
    colorGradient: function (iMin, iMax, iValue, sHexMinColor, sHexMaxColor) {
      let aMaxColors = sHexMaxColor.split('#');
      if (!(aMaxColors.length === 2 && aMaxColors[0].length === 0 && aMaxColors[1].length === 6)) {
        return false;
      }
      let sMaxColor = aMaxColors[1];
      let oMaxColors = {
        red: parseInt(sMaxColor.slice(0, 2), 16),
        yellow: parseInt(sMaxColor.slice(2, 4), 16),
        blue: parseInt(sMaxColor.slice(4, 6), 16)
      };

      let aMinColors = sHexMinColor.split('#');
      if (!(aMinColors.length === 2 && aMinColors[0].length === 0 && aMinColors[1].length === 6)) {
        return false;
      }
      let sMinColor = aMinColors[1];
      let oMinColors = {
        red: parseInt(sMinColor.slice(0, 2), 16),
        yellow: parseInt(sMinColor.slice(2, 4), 16),
        blue: parseInt(sMinColor.slice(4, 6), 16)
      };

      if (isNaN(oMaxColors.red) || isNaN(oMaxColors.yellow) || isNaN(oMaxColors.blue) ||
          isNaN(oMinColors.red) || isNaN(oMinColors.yellow) || isNaN(oMinColors.blue) ||
          iMax === iMin) {
        return false;
      }

      let ratio = (iValue - iMin) / (iMax - iMin);
      let oValueColor = {
        red: Math.round(oMinColors.red + ratio * (oMaxColors.red - oMinColors.red)).toString(16),
        yellow: Math.round(oMinColors.yellow + ratio * (oMaxColors.yellow - oMinColors.yellow)).toString(16),
        blue: Math.round(oMinColors.blue + ratio * (oMaxColors.blue - oMinColors.blue)).toString(16)
      };

      // leading zero
      oValueColor = {
        red: oValueColor.red.length === 1 ? '0' + oValueColor.red : oValueColor.red,
        yellow: oValueColor.yellow.length === 1 ? '0' + oValueColor.yellow : oValueColor.yellow,
        blue: oValueColor.blue.length === 1 ? '0' + oValueColor.blue : oValueColor.blue
      };
      // return oValueColor;
      return '#' + oValueColor.red + oValueColor.yellow + oValueColor.blue;
    },

    applyCoordinates: function (link, node, backgroundShapes, nodeLabel, nodeSize) {
      var textPadding = 2;
      // Set the coordinates
      link.attr('x1', function setLinkCoordinateX1(d) {
        return d.source.x;
      })
          .attr('y1', function setLinkCoordinateY1(d) {
            return d.source.y;
          })
          .attr('x2', function setLinkCoordinateX2(d) {
            return d.target.x;
          })
          .attr('y2', function setLinkCoordinateY2(d) {
            return d.target.y;
          });

      node.attr('cx', function setNodeCoordinateCX(d) {
        return d.x;
      })
          .attr('cy', function setNodeCoordinateCY(d) {
            return d.y;
          })
          .attr('x', function setNodeCoordinateX(d) {
            return d.x - nodeSize / 2;
          })
          .attr('y', function setNodeCoordinateY(d) {
            return d.y - nodeSize / 2;
          });

      backgroundShapes.attr('cx', function setBackgroundNodeCoordinateCX(d) {
        return d.x;
      })
          .attr('cy', function setBackgroundNodeCoordinateCY(d) {
            return d.y;
          })
          .attr('x', function setBackgroundNodeCoordinateX(d) {
            return d.x - nodeSize / 2;
          })
          .attr('y', function setBackgroundNodeCoordinateY(d) {
            return d.y - nodeSize / 2;
          });

      nodeLabel
          .attr('x', function setNodeLabelCoordinateX(d) {
            return d.x - nodeSize / 2 - textPadding;
          })
          .attr('y', function setNodeLabelCoordinateY(d) {
            return d.y - nodeSize / 2 - textPadding;
          });
    },

    refreshCurrentForceGraphSize: function (oSize, nodes, iWidth, iHeight) {
      let padding = 50;
      let minX = 0;
      let maxX = iWidth;
      let minY = 0;
      let maxY = iHeight;
      // Loop should be fastest
      for (let i = 0; i < nodes.length; i++) {
        let x = nodes[i].x;
        let y = nodes[i].y;
        minX = Math.min(x - padding, minX);
        maxX = Math.max(x + padding, maxX);
        minY = Math.min(y - padding, minY);
        maxY = Math.max(y + padding, maxY);
      }
      // Change the object instead of return one
      oSize.minX = minX;
      oSize.maxX = maxX;
      oSize.minY = minY;
      oSize.maxY = maxY;
      oSize.width = maxX - minX;
      oSize.height = maxY - minY;
    },

    enableZoomingAndPanning() {
      let oSize = this.processedDataFiltered.state.size;
      const maxScale = 0.25 / Math.max(oSize.width / this.width, oSize.height / this.height)
      this.zoom = d3.zoom().scaleExtent([maxScale, 5]).on("zoom", ({transform}) => {
        d3.selectAll("#d3ZoomableGroup").attr("transform", transform);

      })
    },

    appendLegend: function (nodeSize) {
      let svg = d3.select("#interactionGraphLegend")

      nodeSize /= 2;


      let d3LegendGroup = svg.append('g').attr('transform', 'scale(0.5) translate(10,10)');
      let iNodePadding = 2;
      let iLinkDistance = 20;
      let iTextPadding = Math.max(iNodePadding * 2 + nodeSize * 2, iLinkDistance + 5 * nodeSize);
      let iLineHeight = 16;
      let iLineCounter = 0.2;


      /**
       * Frame
       */
      d3LegendGroup
          .append("rect")
          .attr("x", -5)
          .attr("y", -5)
          .attr("width", this.legendWidth - 10)
          .attr("height", this.legendHeight - 10)
          .attr("fill", "transparent")
          .style("stroke-width", "1.0")
          .style("stroke", "darkgray");

      /**
       * Drugs
       */
      d3LegendGroup.append('rect')
          .attr('class', 'nodeLegend')
          .classed('rectangle', true)
          .attr('width', nodeSize)
          .attr('height', nodeSize)
          .attr('x', 0)
          .attr('y', iLineHeight * iLineCounter)

      d3LegendGroup.append('rect')
          .classed('rectangle', true)
          .classed('nodeLegend', true)
          .classed('transparent', true)
          .attr('width', nodeSize)
          .attr('height', nodeSize)
          .attr('x', iNodePadding + nodeSize)
          .attr('y', iLineHeight * iLineCounter);

      d3LegendGroup.append('text')
          .text('Drugs')
          .style('font-family', this.fontFamily)
          .style('font-size', this.fontSize / 2)
          .attr('x', iTextPadding)
          .attr('y', iLineHeight * iLineCounter + nodeSize);

      iLineCounter++;

      /**
       * Proteins
       **/
      d3LegendGroup.append('circle')
          .classed('circle', true)
          .classed('nodeLegend', true)
          .attr('r', nodeSize / 2)
          .style('fill', function setFillForColoredLegendCircle() {
            // return oControl.colorGradient(0, 100, d.maxInhibition, '#E8f4FF', '#0053AF');
            return '#0053AF';
          })
          .attr('cx', nodeSize / 2)
          .attr('cy', iLineHeight * iLineCounter + nodeSize / 2);

      d3LegendGroup.append('circle')
          .classed('circle', true)
          .classed('nodeLegend', true)
          .classed('transparent', true)
          .attr('r', nodeSize / 2)
          .attr('cx', nodeSize * 1.5 + iNodePadding)
          .attr('cy', iLineHeight * iLineCounter + nodeSize / 2);

      d3LegendGroup.append('text')
          .text('Proteins')
          .style('font-family', this.fontFamily)
          .style('font-size', this.fontSize / 2)
          .attr('x', iTextPadding)
          .attr('y', iLineHeight * iLineCounter + nodeSize);

      iLineCounter++;

      /**
       * Highlighted Link
       */

      d3LegendGroup.append('line')
          .attr('class', 'link')
          .attr('stroke-width', 1.5)
          .attr('x1', nodeSize / 2)
          .attr('y1', iLineHeight * iLineCounter + nodeSize / 2)
          .attr('x2', nodeSize / 2 + iLinkDistance)
          .attr('y2', iLineHeight * iLineCounter + nodeSize / 2);

      d3LegendGroup.append('rect')
          .attr('class', 'nodeLegend')
          .classed('rectangle', true)
          .attr('width', nodeSize)
          .attr('height', nodeSize)
          .attr('x', 0)
          .attr('y', iLineHeight * iLineCounter);

      d3LegendGroup.append('circle')
          .classed('circle', true)
          .classed('nodeLegend', true)
          .attr('r', nodeSize / 2)
          .style('fill', function setFillForColoredLegendCircle() {
            // return oControl.colorGradient(0, 100, d.maxInhibition, '#E8f4FF', '#0053AF');
            return '#0053AF';
          })
          .attr('cx', iLinkDistance + nodeSize / 2)
          .attr('cy', iLineHeight * iLineCounter + nodeSize / 2);

      d3LegendGroup.append('text')
          .text('Inhibition above threshold')
          .style('font-family', this.fontFamily)
          .style('font-size', this.fontSize / 2)
          .attr('x', iTextPadding)
          .attr('y', iLineHeight * iLineCounter + nodeSize);

      iLineCounter++;

      /**
       * Transparent Link
       */

      d3LegendGroup.append('line')
          .attr('class', 'link')
          .attr('stroke-width', 1)
          .classed('transparentLegend', true)
          .attr('x1', nodeSize / 2)
          .attr('y1', iLineHeight * iLineCounter + nodeSize / 2)
          .attr('x2', nodeSize / 2 + iLinkDistance)
          .attr('y2', iLineHeight * iLineCounter + nodeSize / 2);

      d3LegendGroup.append('rect')
          .classed('nodeLegend', true)
          .classed('backgroundShapes', true)
          .attr('width', nodeSize)
          .attr('height', nodeSize)
          .attr('x', 0)
          .attr('y', iLineHeight * iLineCounter);

      d3LegendGroup.append('rect')
          .classed('nodeLegend', true)
          .classed('transparent', true)
          .attr('width', nodeSize)
          .attr('height', nodeSize)
          .attr('x', 0)
          .attr('y', iLineHeight * iLineCounter);

      d3LegendGroup.append('circle')
          .classed('nodeLegend', true)
          .classed('backgroundShapes', true)
          .attr('r', nodeSize / 2)
          .attr('cx', iLinkDistance + nodeSize / 2)
          .attr('cy', iLineHeight * iLineCounter + nodeSize / 2);

      d3LegendGroup.append('circle')
          .classed('circle', true)
          .classed('nodeLegend', true)
          .classed('transparent', true)
          .attr('r', nodeSize / 2)
          .attr('cx', iLinkDistance + nodeSize / 2)
          .attr('cy', iLineHeight * iLineCounter + nodeSize / 2);

      d3LegendGroup.append('text')
          .text('Inhibition below threshold')
          .style('font-family', this.fontFamily)
          .style('font-size', this.fontSize / 2)
          .attr('x', iTextPadding)
          .attr('y', iLineHeight * iLineCounter + nodeSize);

    },
    onDoseSliderChange: function (drug, dose) {
      this.updateEffectiveInhibitionsOfDrug(drug, dose);
      this.updateLinkTransparency();
      this.updateNodeTransparency()
    },
    updateEffectiveInhibitionsOfDrug: function (drug, dose) {
      //Iterate over links, filter for those that have our drug as target, calculate their effective Inhibition
      this.processedDataFiltered.links.forEach(link => {
        if (link.drugId === drug.value) {
          link.effectiveInhibition = this.calculateEffectiveInhibition(dose, link.source.treatments[link.drugId].fit)
        }
      })

    },
    calculateEffectiveInhibition: function (dose, parameters) {

      if (parameters.inflection && parameters.slope && parameters.top && parameters.bottom) {
        var nEC50 = parameters.bottom + (parameters.top - parameters.bottom) / (1 + Math.exp(parameters.slope * (Math.log(dose) - Math.log(parameters.inflection))));
        var nResult = 1 - (nEC50 - parameters.bottom) / (parameters.top - parameters.bottom);
        return Math.ceil(100 * nResult);
      } else {
        return 0
      }
    },
    updateLinkTransparency: function () {
      d3.selectAll('.link')
          .classed('transparent', (d) => {
            if (typeof d !== 'undefined' && typeof d.drugId !== 'undefined') {
              // Grey this link
              if (d.effectiveInhibition < this.effectiveInhibitionSliderValue) {
                //This is so the nodes will know and go transparent if all their links are transparent
                d.transparent = true;
                return true;
              } else {
                d.transparent = false;
                return false
              }
            } else {
              return false;
            }
          })
    },
    updateNodeTransparency: function () {
      d3.selectAll('.node,.nodeLabel')
          .classed('transparent', (d) => {
            if (typeof d !== 'undefined') {
              //Iterate over all links, get all links where this node is involved and check whether SOME of these links are not transparent

              let anyNonTransparent = false
              d3.selectAll('.link').each((link) => {
                if (typeof link !== 'undefined' && (link.source === d || link.target === d) && !link.transparent) {
                  anyNonTransparent = true;
                }
              })
              return !anyNonTransparent


            } else {
              return false;
            }
          })
    },
    setDrugSliderValue: function (drug, value) {
      const indices = this.drugIdToCheckboxIndices[drug.value];
      this.sliderValuesList[indices[0]][indices[1]] = value;
      //I recreate the whole list here, otherwise the slider and textField will not update
      this.sliderValuesList = [...this.sliderValuesList]
      this.onDoseSliderChange(drug, value)
    },
    onGroupCheckboxChange: function (newValue, listIndex) {
      this.sliderCheckboxesList[listIndex] = Array(this.sliderCheckboxesList[listIndex].length).fill(newValue)
      this.sliderCheckboxesList = [...this.sliderCheckboxesList]
    },
    getSVG: function () {
      return d3.select(this.$el).selectAll("svg").node();
    },
  },
}
;
</script>

<style>
@import "./ProteinDrugInteractionGraph.css.prdb";
</style>
