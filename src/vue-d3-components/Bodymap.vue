<template>
  <v-row class="bodymapDiv" id="bodymapDiv" justify="center">
    <v-btn-toggle
      v-if="selectedOrganism.taxcode === 9606"
      v-model="selectedGender"
      tile
      :color="buttonsColor"
      group
      fixed
      top
      left
      mandatory
      style="margin-left: 20px; margin-right: -40px"
    >
      <v-btn icon value="female">
        <v-icon>mdi mdi-gender-female</v-icon>
      </v-btn>
      <v-btn icon value="male">
        <v-icon>mdi mdi-gender-male</v-icon>
      </v-btn>
    </v-btn-toggle>
    <div id="bodymap" class="bodymap"></div>
    <div id="bodymapLegendDiv" class="bodymapLegendDiv"></div>
  </v-row>
</template>

<script>
const d3 = require("d3");
import d3tip from "d3-tip";
d3.tip = d3tip;

import SVGBodymapHumanMale from '@/assets/bodyMap/man_new_with_IDs_final.svg';
import SVGBodymapHumanFemale from '@/assets/bodyMap/woman_new_with_IDs_final.svg';
import SVGBodymapArabidopsis from '@/assets/bodyMap/AraTh_body_map_with_IDS.svg';
import SVGBodymapMouse from '@/assets/bodyMap/Mouse_body_map_with_IDS.svg';
import SVGBodymapRice from '@/assets/bodyMap/Rice_body_map_with_IDS_Final.svg';

export default {
  props: {
    width: {
      type: String,
      default: "40%",
    },
    height: {
      type: String,
      default: "40%",
    },
    minWidthCSS: {
      type: [String, Number],
      default: "100",
    },
    minHeightCSS: {
      type: [String, Number],
      default: "100",
    },
    minWidth: {
      type: Number,
      default: 500,
    },
    buttonsColor: {
      type: String,
      default: "#0065BD",
    },
    minHeight: {
      type: Number,
      default: 500,
    },
    data: {
      type: Array,
      default: () => [],
    },
    selectedOrganism: {
      type: Object,
      default: () => {},
    },
  },
  data: function () {
    return {
      bodyMapSvg: "",
      svg: null,
      promiseLoadSvg: null,
      selectedGender: "female",
    };
  },
  watch: {
    data: function (newData) {
      if (newData && this.selectedOrganism) {
        this.redraw();
      }
    },
    selectedOrganism: function (oOrg) {
      if (this.selectedOrganism.taxcode !== oOrg.taxcode) {
        this.selectedGender = oOrg.taxcode === 9606 ? "female" : null;
      }
    },
    selectedGender: function () {
      if (this.data && this.selectedOrganism) {
        this.redraw();
      }
    },
  },
  methods: {
    drawBodymap: function () {
      this.svgLoaded = false;

      switch (this.selectedOrganism.taxcode) {
        case 9606:
          if (this.selectedGender === "male") {
            d3.select(".bodymap").node().innerHTML = SVGBodymapHumanMale;
          } else if (this.selectedGender === "female") {
            d3.select(".bodymap").node().innerHTML = SVGBodymapHumanFemale;
          }
          break;
        case 3702:
          d3.select(".bodymap").node().innerHTML = SVGBodymapArabidopsis;
          break;
        case 10090:
          d3.select(".bodymap").node().innerHTML = SVGBodymapMouse;
          break;
        case 39947:
          d3.select(".bodymap").node().innerHTML = SVGBodymapRice;
          break;
      }

      this.svgLoaded = true;
      this.bind();

      this.$emit("resetSelections", null);
    },
    getOrgans: function () {
      switch (this.selectedOrganism.taxcode) {
        case 9606:
          return {
            small_intestine: "small_intestine",
            rectum: "rectum",
            anus: "anus",
            nasopharynx: "nasopharynx",
            kidney: "kidney",
            lung: "lung",
            heart: "heart",
            brain: "brain",
            breast: "breast",
            thyroid: "thyroid",
            adrenal: "adrenal",
            pancreas: "pancreas",
            femur: "femur",
            lymph_node: "lymph_node",
            skeletal_muscle: "skeletal_muscle",
            adipose: "adipose",
            oral_cavity: "oral_cavity",
            tonsils: "tonsils",
            stomach: "stomach",
            cardia: "cardia",
            duodenum: "duodenum",
            esophagus: "esophagus",
            appendix: "appendix",
            urinary_bladder: "urinary_bladder",
            ovary: "ovary",
            liver: "liver",
            gall_bladder: "gall_bladder",
            colon: "colon",
            uterus: "uterus",
            cervix_uterine: "cervix_uterine",
            vagina: "vagina",
            bone_marrow: "bone_marrow",
            placenta: "placenta",
            skin: "skin",
            circulatory_system: "circulatory_system",
            prostate: "prostate",
            testis: "testis",
            salivary_gland: "salivary_gland",
          };
        case 10090:
          return {
            bto_0000047: "adrenal_gland",
            bto_0000141: "bone_marrow",
            bto_0000142: "brain",
            bto_0000156: "brown_adipose_tissue",
            bto_0000214: "cell_culture",
            bto_0000232: "cerebellum",
            bto_0000243: "vagina",
            bto_0000293: "occipital_lobe",
            bto_0000365: "duodenum",
            bto_0000379: "embryo",
            bto_0000408: "epididymis",
            bto_0000439: "eye",
            bto_0000484: "frontal_lobe",
            bto_0000562: "heart",
            bto_0000601: "hippocampus",
            bto_0000651: "small_intestine",
            bto_0000671: "kidney",
            bto_0000672: "hindbrain",
            bto_0000706: "large_intestine",
            bto_0000759: "liver",
            bto_0000763: "lung",
            bto_0000784: "lymph_node",
            bto_0000817: "mammary_gland",
            bto_0000959: "esophagus",
            bto_0000961: "olfactory_bulb",
            bto_0000975: "ovary",
            bto_0000988: "pancreas",
            bto_0001103: "skeletal_muscle",
            bto_0001129: "prostate_gland",
            bto_0001203: "salivary_gland",
            bto_0001234: "seminal_vesicle",
            bto_0001253: "skin",
            bto_0001279: "spinal_cord",
            bto_0001281: "spleen",
            bto_0001284: "femur",
            bto_0001307: "stomach",
            bto_0001355: "temporal_lobe",
            bto_0001363: "testis",
            bto_0001374: "thymus",
            bto_0001379: "thyroid_gland",
            bto_0001385: "tongue",
            bto_0001388: "trachea",
            bto_0001418: "urinary_bladder",
            bto_0001424: "uterus",
            bto_0001456: "white_adipose_tissue",
          };
        case 3702:
          return {
            po_0009046: "flower",
            po_0009001: "fruit",
            po_0025268: "fruit_septum",
            po_0000033: "fruit_valve",
            po_0009010: "seed",
            po_0009031: "sepal",
            po_0009032: "petal",
            po_0009029: "stamen",
            po_0009030: "carpel",
            po_0000013: "cauline_leaf",
            po_0005005: "shoot_axis_internode",
            po_0005004: "shoot_axis_node",
            po_0000014: "rosette_leaf",
            po_0009005: "root",
            po_0020030: "cotyledon",
            po_0006079: "shoot_system_meristem",
            po_0025291: "seedling_hypocotyl",
            po_0020135: "root_differential_zone",
            po_0000025: "root_tip",
            po_0030112: "pedicel",
            // po_0025281: 'pollen',
            po_0025280: "pollen",
          };
        case 39947:
          return {
            po_0000009: "cultured_plant_callus",
            po_0000042: "shoot-borne_root",
            po_0000046: "seminal_root",
            po_0025281: "L_mature_pollen_stage",
            po_0004506: "developing_seed_stage",
            po_0004712: "axillary_vegetative_bud",
            po_0004715: "terminal_inflorescence_bud",
            po_0005004: "shoot_axis_node",
            po_0006012: "leaf_collar",
            po_0007065: "LP_05_five_leaves_visible_stage",
            po_0007094: "LP_01_one_leaf_visible_stage",
            po_0007106: "LP_03_three_leaves_visible_stage",
            po_0007115: "LP_04_four_leaves_visible_stage",
            po_0007131: "seedling_development_stage",
            po_0009005: "root",
            po_0009009: "plant_embryo",
            po_0009030: "carpel",
            po_0009036: "lodicule",
            po_0009066: "anther",
            po_0020031: "radicle",
            po_0020033: "coleoptile",
            po_0020037: "mesocotyl",
            po_0020039: "leaf_lamina",
            po_0020103: "flag_leaf",
            po_0020104: "leaf_sheath",
            po_0025034: "leaf",
            po_0025100: "shoot_axis_internode_elongation_zone",
            po_0025327: "keel",
            po_0025280: "pollen",
          };
        default:
          return [];
      }
    },

    reset: function () {
    },

    bind: function () {
      var that = this;

      var highColor = "rgba(180, 0, 0, 1.0)";
      var lowColor = "rgba(180, 0, 0, 0.0)";
      var minIntensity = d3.min(this.data, function (d) {
        return +d.NORMALIZED_INTENSITY;
      });
      var maxIntensity = d3.max(this.data, function (d) {
        return +d.NORMALIZED_INTENSITY;
      });
      that.intensityToColor = d3
        .scaleLinear()
        .domain([minIntensity, maxIntensity])
        .interpolate(d3.interpolateRgb)
        .range([lowColor, highColor]);

      var that = this;
      var svg = d3.select(".bodymap").selectAll("svg");

      if (typeof this.selectedOrganism !== "undefined") {
        Object.entries(that.getOrgans()).forEach(function (organ) {
          var organ_name = organ[1];
          var svgOrgan = svg.select("#" + organ_name.toLowerCase());


          svgOrgan
            .attr("fill", "#808080")
            .attr("fill-opacity", 0.2)
            .attr("stroke-width", 1)
            .attr("stroke", "none")
        });
      }

      if (this.data.length > 0) {
        var color_data = [];

        Object.entries(that.getOrgans()).forEach(function (organ) {
          var organ_id = organ[0];
          var organ_name = organ[1];
          var svgOrgan = d3.select("#" + organ_id);

          svgOrgan.style("visibility", "hidden");


          // fill organs with sap_synonym with color
          if (that.data) {
            var related_tissues = that.data.filter(function (element) {
              if (element.SAP_SYNONYM) {
                return (
                  element.SAP_SYNONYM.replace(":", "_").toLowerCase() ==
                  organ_id
                );
              }
              return false;
            });

            if (related_tissues.length > 0) {
              // tissues found that match sap_synonym!
              var max_intensity;
              max_intensity = d3.max(related_tissues, function (d) {
                return d.NORMALIZED_INTENSITY;
              });

              var organ_color = that.intensityToColor(max_intensity);
              color_data.push({
                color: organ_color,
                intensity: max_intensity,
                sap_synonym: organ_name,
              });

              // treat organ with many parts as one
              if (svgOrgan.selectAll("*").nodes().length > 1) {
                svgOrgan = svgOrgan.selectAll("*");
              }

              const tip = d3
                .tip()
                .attr("class", "d3-tip-bodymap")
                .offset([-10, 0])
                .html(() => 
                  `Organ: ${organ_name} <br> Maximum intensity: ${max_intensity.toFixed(2)}`
                );	
              svgOrgan.call(tip);

              svgOrgan
                .attr("fill", organ_color)
                .attr("stroke", "#787878")
                .on("mouseenter", tip.show)
                .on("mouseleave", tip.hide);
            }
          }
        });

        // bind click
        that.data.forEach(function (d) {
          if (d.SAP_SYNONYM) {
            // bind only organs for which the synonyms are in the data
            var svgOrgan = d3.select(
              "#" + d.SAP_SYNONYM.replace(":", "_").toLowerCase()
            );
            if (svgOrgan.selectAll("*").nodes().length > 1) {
              svgOrgan = svgOrgan.selectAll("*");
            }

            svgOrgan.style("visibility", "visible");
            svgOrgan
              .attr("class", "unselected")
              .attr("display", "inherit")
              .attr("fill-opacity", 0.4)
              .attr("stroke", "#787878")
              .on("click", function () {
                that.selectOrgan(d.SAP_SYNONYM);
              });
          }
        });
        color_data.sort(function (a, b) {
          // due to avaraging colors may not be sorted
          if (a.intensity > b.intensity) {
            return -1;
          }
          if (a.intensity < b.intensity) {
            return 1;
          }
          return 0;
        });
        that.updateLegend(color_data);
      }
    },
    selectOrgan: function (d) {
      this.toggleOrgan(d);
      this.$emit("organSelected", d);
    },
    toggleOrgan: function (organName) {
      var svgOrgan = d3.select("#" + organName.replace(":", "_").toLowerCase());
      if (svgOrgan.node() !== null) {
        if (svgOrgan.selectAll("*").nodes().length > 1) {
          svgOrgan = svgOrgan.selectAll("*");
        }
        if (svgOrgan.attr("class") === "selected") {
          svgOrgan
            .attr("class", "unselected")
            .attr("display", "inherit")
            .attr("fill-opacity", 0.2)
            .attr("stroke", "#787878");
          return false;
        }
        svgOrgan
          .attr("class", "selected")
          .attr("fill-opacity", 0.7)
          .attr("stroke", "black");
        return true;
      }
    },
    updateLegend: function (data) {
      var height = 360;
      var margin_top = 35;

      var svg = d3.select("#bodymapLegendDiv").select("svg");
      const tip = d3.tip().attr("class", "d3-tip-bodymap").html((d) => `Intensity: ${d.intensity.toFixed(2)}`);
      tip.offset([-8, 0]);

      svg.call(tip);
      svg.selectAll("g").remove();

      var groups = svg.selectAll("g").data(data).enter().append("g");

      groups
        .append("rect")
        .attr("width", 10)
        .attr("height", height / data.length - 1)
        .attr("y", function (d, i) {
          return i * (height / data.length) + margin_top;
        })
        .attr("x", 7)
        .attr("fill", function (d) {
          return d.color;
        })
        .on("mouseenter", tip.show)
        .on("mouseleave", tip.hide);

      svg
        .append("g")
        .attr("transform", "translate(0,20)")
        .append("text")
        .text("high")
        .attr("font-weight", "bold")
        .attr("font-size", "12px");

      svg
        .append("g")
        .attr("transform", "translate(3,420)")
        .append("text")
        .text("low")
        .attr("font-weight", "bold")
        .attr("font-size", "12px");
    },
    drawBodymapLegend: function () {
      var height = 720;
      d3.select(this.$el)
        .select(".bodymapLegendDiv")
        .append("svg")
        .attr("width", 70)
        .attr("height", height);
    },
    redraw: function () {
      d3.select(".bodymapDiv").selectAll("svg").remove();
      this.drawBodymapLegend();
      this.drawBodymap();
    },
    getSVG: function () {
      return d3.select(this.$el).selectAll("svg").node();
    },
  },
  beforeDestroy () {
    document.querySelectorAll(".d3-tip-bodymap").forEach((e) => e.remove());
  },
};
</script>

<style lang="scss">
.d3-tip-bodymap {
  font-family: sans-serif;
  font-size: 14px;
  line-height: 1;
  font-weight: bold;
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 2px;
  pointer-events: none;
}

/* Creates a small triangle extender for the tooltip */
.d3-tip-bodymap:after {
  box-sizing: border-box;
  display: inline;
  font-size: 10px;
  width: 100%;
  line-height: 1;
  color: rgba(0, 0, 0, 0.8);
  content: "\25BC";
  position: absolute;
  text-align: center;
  pointer-events: none;
}

/* Style northward tooltips differently */
.d3-tip-bodymap.n:after {
  margin: -1px 0 0 0;
  top: 100%;
  left: 0;
  pointer-events: none;
}
.d3-tip-bodymap,
.d3-tip-bodymap n,
.d3-tip-bodymap e,
.d3-tip-bodymap s {
  z-index: 2000;
}
</style>

