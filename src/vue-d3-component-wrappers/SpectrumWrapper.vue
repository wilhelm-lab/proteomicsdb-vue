<template>
  <v-row class="spectrum-wrapper">
    <v-col cols="12" lg="4">
      <v-expansion-panels v-model="panel" accordion>
        <v-expansion-panel>
          <v-expansion-panel-header>
            Reference Spectrum
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="d-flex mb-6">
              Origin:
              <v-btn-toggle
                dense
                class="mx-1"
                v-model="mirrorOrigin"
              >
                <v-btn small>Prosit</v-btn>
                <v-btn small>ProteomeTools</v-btn>
              </v-btn-toggle>
            </div>
            <div v-if="mirrorOrigin === 0">
              <v-text-field
                label="Peptide Sequence"
                type="text"
                outlined
                v-model="mirrorSequence"
                :rules="mirrorSequenceRules"
                counter="30"
              ></v-text-field>
              <div class="d-flex">
                <v-text-field
                  justify="left"
                  label="Precursor Charge"
                  outlined
                  class="mr-2"
                  type="number"
                  v-model="mirrorSequencePrecursorCharge"
                  style="max-width: 150px"
                ></v-text-field>
                <v-text-field
                  label="Collision Energy"
                  outlined
                  type="number"
                  v-model="mirrorSequenceCE"
                  style="max-width: 150px"
                ></v-text-field>
              </div>
              <v-combobox
                outlined
                v-model="modObjectBottom.selectedMods"
                :items="modsBottom"
                :item-text="modSelectOption"
                label="Selected modifications"
                multiple
                clear-on-select
                chips
                deletable-chips
                return-object
                :error-messages="prositError"
              ></v-combobox>
              <v-combobox
                  outlined
                  v-model="prositModel"
                  :items="prositModels"
                  label="Selected model"
                  clear-on-select
                  chips
                  deletable-chips
                  return-object
              ></v-combobox>
              <v-btn
              color="primary"
                @click="getMirrorSpectrum"
                >Get mirror spectrum</v-btn
              >
            </div>
            <div v-if="mirrorOrigin === 1">
              <v-select
                outlined
                :items="aAcquisitionModes"
                label="Acquisition Mode"
                v-model="selectedAcquisitionMode"
                @change="triggerFilterReferenceSpectrumList"
              ></v-select>
              <v-divider />
              <v-list dense style="overflow-y: auto; max-height: 400px">
                <v-list-item-group color="primary">
                  <v-list-item
                    v-for="(item, i) in aReferenceSpectrumList"
                    :key="i"
                    @click="getMirrorSpectrum(item)"
                  >
                    <v-tooltip right open-delay="300">
                      <template v-slot:activator="{ on }">
                        <v-list-item-content v-on="on">
                          <v-list-item-title
                            v-text="item.text"
                          ></v-list-item-title>
                        </v-list-item-content>
                      </template>
                      <span v-html="item.tooltip"></span>
                    </v-tooltip>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header> Fragments </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row class="ma-0 pa-0 py-1" justify="end">
              <v-btn
                @click="selectAll"
                small
                class="mx-1"
                >Select all</v-btn
              >
              <v-btn
                @click="deselectAll"
                small
                class="mx-1"
                >Deselect all</v-btn
              >
            </v-row>
            <v-row>
              <v-col>
                <v-row
                  class="ma-0 pa-0 my-1"
                  align="center"
                  v-for="(item, i) in ions.slice(0, 3)"
                  :key="i"
                >
                  {{ item.ion }}:
                  <v-btn-toggle
                    dense
                    multiple
                    class="mx-1"
                    v-model="item.state"
                    @change="setSelectedIonList(true)"
                  >
                    <v-btn
                      v-for="(ch, j) in item.charges"
                      :key="j"
                      small
                      :disabled="!item.enabled[j]"
                    >
                      {{ ch }}
                    </v-btn>
                  </v-btn-toggle>
                </v-row>
              </v-col>
              <v-col>
                <v-row
                  class="ma-0 pa-0 my-1"
                  align="center"
                  v-for="(item, i) in ions.slice(3)"
                  :key="i"
                >
                  {{ item.ion }}:
                  <v-btn-toggle
                    dense
                    multiple
                    class="mx-1"
                    v-model="item.state"
                    @change="setSelectedIonList(true)"
                  >
                    <v-btn
                      v-for="(ch, j) in item.charges"
                      :key="j"
                      small
                      :disabled="!item.enabled[j]"
                    >
                      {{ ch }}
                    </v-btn>
                  </v-btn-toggle>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col v-for="(peak, i) in extraPeaks" :key="i">
                <v-switch
                  dense
                  class="ml-7 mt-0 pt-0"
                  v-model="peak.state"
                  :label="peak.ion"
                  :key="i"
                  :disabled="!peak.enabled"
                  @change="setSelectedExtraPeakList(true)"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row class="my-2">
              <v-label>Neutral loss: </v-label>
            </v-row>
            <v-row>
              <v-switch
                v-for="(item, i) in nl"
                dense
                class="ml-7 mt-0 pt-0"
                v-model="item.state"
                :label="item.name"
                :key="i"
                :disabled="!item.enabled"
                @change="setSelectedNeutralLossList(true)"
              ></v-switch>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header> Configuration </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div>
              <v-text-field
                label="Max neutral loss count"
                class="mx-2 my-0 py-0"
                type="number"
                outlined
                v-model="nlCount"
                @change="nlChange"
                @keydown="nlChange"
                @click="nlChange"
              ></v-text-field>
            </div>
            <div class="d-flex">
              <v-text-field
                label="Fragment Annotation Tolerance (+/-)"
                class="mx-2 my-0 py-0"
                type="number"
                outlined
                v-model="massTolerance[selectedMassTolerance + 0].value"
              ></v-text-field>
              <v-btn
                x-large
                text
                @click="selectedMassTolerance = !selectedMassTolerance"
                >{{ massTolerance[selectedMassTolerance + 0].text }}</v-btn
              >
            </div>
            <div class="d-flex">
              <v-text-field
                label="Peak Matching Tolerance (+/-)"
                class="mx-2 my-0 py-0 text-right"
                type="number"
                outlined
                v-model="matchTolerance[selectedMatchTolerance + 0].value"
              ></v-text-field>
              <v-btn
                x-large
                text
                @click="selectedMatchTolerance = !selectedMatchTolerance"
                >{{
                  matchTolerance[selectedMatchTolerance + 0].text
                }}</v-btn
              >
            </div>
            <div>
              <v-switch
                label="Expert system annotation"
                v-model="expert"
              ></v-switch>
            </div>
              <v-btn
                color="primary"
                @click="getSpectra"
                >Update settings</v-btn
              >
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
    <v-col cols="12" lg="8">
      <v-card class="spectrum-wrapper__spectrum-viewer__card">
        <v-card-text>
          <spectrumViewer
            class="spectrum-wrapper__spectrum-viewer"
            ref="peptideSpectrumViewer"
            :plotdata="topSpec"
            :mirrorplotdata="bottomSpec"
            :peptide="peptide"
            :peptideBottom="peptideBottom"
            :settings="specViewSettings"
            :score="score"
            :scoreTop="scoreTop"
            :scoreBottom="scoreBottom"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import useTransformer from "@/vue-d3-component-wrappers/common-lib/ProteomicsDBTransformer";
import annotationTransformer from "@/vue-d3-component-wrappers/common-lib/AnnotationTransformer";
import axios from "axios";

import binary from "@/vue-d3-component-wrappers/common-lib/binary.js";
import measures from "@/vue-d3-component-wrappers/common-lib/measures.js";
import comparator from "@/vue-d3-component-wrappers/common-lib/Comparator.js";

const d3 = require("d3v3");
import spectrumViewer from "@/vue-d3-components/SpectrumViewer";

import ModificationsTxt from "@/assets/mods/Modifications.txt";

export default {
  name: "spectrum-wrapper",
  components: {
    spectrumViewer,
  },
  props: {
    minWidth: {
      type: Number,
      default: 400,
    },
    minHeight: {
      type: Number,
      default: 400,
    },
    spectrumEntry: {
      type: Object,
      default: null,
    },
    peptideId: {
      type: String,
      default: '',
    },
    peptideSequence: {
      type: String,
      default: '',
    },
    isReferenceSpectrum: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    panel: 0,
    oSpectrumModel: {},
    oReferenceSpectrumModel: {},
    mods: [],
    modsBottom: [],
    prositModels: ["intensity_prosit_publication","Prosit_2020_intensity_hcd",
      "Prosit_2020_intensity_cid","Prosit_TMT_intensity_2021_HCD","Prosit_TMT_intensity_2021_CID"],
    prositModel: "intensity_prosit_publication",
    prositError: [],
    modObject: { selectedMods: [] },
    modObjectBottom: { selectedMods: [] },
    predeterminedMods: [],
    potentialMods: [],
    potentialModsBottom: [],
    topSpec: {
      x: [],
      y: [],
      id: [],
      color: [],
      label: [],
      labelCharge: [],
      neutralLosses: [],
      barwidth: [],
      massError: [],
      theoMz: [],
      percentBasePeak: [],
      TIC: 0,
      massErrorX: [],
      intensityError: [],
      intensityErrorIdsTop: [],
      intensityErrorIdsBottom: [],
    },
    bottomSpec: {
      x: [],
      y: [],
      id: [],
      color: [],
      label: [],
      labelCharge: [],
      neutralLosses: [],
      barwidth: [],
      massError: [],
      theoMz: [],
      percentBasePeak: [],
      TIC: 0,
    },
    peptide: {
      sequence: "TESTPEPTIDE",
      precursorMz: null,
      precursorCharge: null,
      mods: [
        {
          site: -1,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 0,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 1,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 2,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 3,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 4,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 5,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 6,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 7,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 8,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 9,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 10,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 11,
          deltaElement: null,
          deltaMass: 0,
        },
      ],
      origin: "Origin",
    },
    peptideBottom: {
      sequence: "TESTPEPTIDE",
      precursorMz: null,
      precursorCharge: null,
      mods: [
        {
          site: -1,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 0,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 1,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 2,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 3,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 4,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 5,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 6,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 7,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 8,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 9,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 10,
          deltaElement: null,
          deltaMass: 0,
        },
        {
          site: 11,
          deltaElement: null,
          deltaMass: 0,
        },
      ],
      origin: "Origin",
    },
    specViewSettings: {
      toleranceThreshold: 40,
      toleranceType: "ppm",
      ionizationMode: "+",
    },
    score: {
      sa: 0.0,
      corr: 0.0,
    },
    scoreTop: {
      sa: 0.0,
      corr: 0.0,
    },
    scoreBottom: {
      sa: 0.0,
      corr: 0.0,
    },
    oAcquisitionModeSet: [],
    aAcquisitionModes: [],
    topPeaks: {},
    bottomPeaks: {},
    mirrorOrigin: 0,
    mirrorSequenceRules: [(v) => v.length <= 30 || "Max 30 amino acids"],
    mirrorSequence: "",
    mirrorSequencePrecursorCharge: 1,
    mirrorSequenceCE: 30,
    selectedReferenceSpectrum: [],
    selectedAcquisitionMode: "All",
    aReferenceSpectrumList: [],
    ions: [
      {
        ion: "a",
        charges: ["1+", "2+", "3+"],
        state: [],
        enabled: [0, 0, 0],
      },
      {
        ion: "b",
        charges: ["1+", "2+", "3+"],
        state: [],
        enabled: [0, 0, 0],
      },
      {
        ion: "c",
        charges: ["1+", "2+", "3+"],
        state: [],
        enabled: [0, 0, 0],
      },
      {
        ion: "x",
        charges: ["1+", "2+", "3+"],
        state: [],
        enabled: [0, 0, 0],
      },
      {
        ion: "y",
        charges: ["1+", "2+", "3+"],
        state: [],
        enabled: [0, 0, 0],
      },
      {
        ion: "z",
        charges: ["1+", "2+", "3+"],
        state: [],
        enabled: [0, 0, 0],
      },
    ],
    extraPeaks: [
      { ion: "yb", state: 0, enabled: 0 },
      { ion: "IM", state: 0, enabled: 0 },
      { ion: "M[H]", state: 0, enabled: 0 },
    ],
    nl: [
      { name: "H2O", state: 0, enabled: 0 },
      { name: "NH3", state: 0, enabled: 0 },
      { name: "CO", state: 0, enabled: 0 },
      { name: "CO2", state: 0, enabled: 0 },
      { name: "C2H4", state: 0, enabled: 0 },
      { name: "C3H6", state: 0, enabled: 0 },
      { name: "C4H8", state: 0, enabled: 0 },
      { name: "C2H4O2", state: 0, enabled: 0 },
      { name: "C2H5NO", state: 0, enabled: 0 },
      { name: "C3H9N3", state: 0, enabled: 0 },
      { name: "C4H6N2", state: 0, enabled: 0 },
      { name: "CH2N2", state: 0, enabled: 0 },
    ],
    massTolerance: [
      { text: "ppm", value: 20 },
      { text: "Da", value: 0.35 },
    ],
    matchTolerance: [
      { text: "ppm", value: 20 },
      { text: "Da", value: 0.35 },
    ],
    nlCount: 3,
    maxNlCount: 3,
    selectedMassTolerance: false,
    selectedMatchTolerance: false,
    expert: true,
    fragmentTypes: {
      a: {
        selected: false,
        color: "#820cad",
        label: "a",
      },
      b: {
        selected: false,
        color: "#0d75bc",
        label: "b",
      },
      c: {
        selected: false,
        color: "#07a14a",
        label: "c",
      },
      C: {
        selected: false,
        color: "#035729",
        label: "c-1",
      },
      x: {
        selected: false,
        color: "#d1e02d",
        label: "x",
      },
      y: {
        selected: false,
        color: "#be202d",
        label: "y",
      },
      z: {
        selected: false,
        color: "#f79420",
        label: "z•",
      },
      Z: {
        selected: false,
        color: "#A16016",
        label: "z+1",
      },
      yb: {
        selected: false,
        color: "#00ff00",
        label: "yb",
      },
      IM: {
        selected: false,
        color: "#ffff00",
        label: "IM",
      },
      precursor: {
        selected: true,
        color: "#000000",
      },
      unassigned: {
        selected: true,
        color: "#a6a6a6",
      },
    },
  }),
  watch: {
    mirrorSequence: function (newSeq) {
      if (newSeq !== "") {
        this.oReferenceSpectrumModel.data.sequence = newSeq;
        this.mods = [];
        this.modsBottom = [];
        this.modObject = { selectedMods: [] };
        this.modObjectBottom = { selectedMods: [] };
        this.loadMods(false);
      }
    },
    peptideSequence: function (newSeq) {
      this.mirrorSequence = newSeq;
    },
    spectrumEntry: function (newData) {
      if (newData) {
        this.initializeModel();
      }
    },
  },
  methods: {
    setPreselectedMods: function (topSpectrum = true) {
      var sFmods = this.oSpectrumModel.data.fixedModifications;
      var sVmods = this.oSpectrumModel.data.variableModifications;

      var that = this;

      that.$set(that.modObjectBottom, "selectedMods", {});
      var aMods = sFmods.split("; ").concat(sVmods.split("; "));
      var name = "",
        residue = "",
        index = -1;
      if (topSpectrum) {
        // todo
      } else {
        this.modObjectBottom.selectedMods = [];
      }
      aMods.forEach((mod) => {
        if (mod !== "") {
          name = mod.split("@")[0];
          residue = mod.split("@")[1].charAt(0);
          index = mod.split("@")[1].slice(1) || -1;

          if (topSpectrum) {
            // todo
          } else {
            var temp = that.modsBottom.filter((x) => {
              return (
                x.name === name &&
                x.site === residue &&
                ((index !== -1 && x.index === index - 1) || index === -1)
              );
            });
            that.$set(
              that.modObjectBottom,
              "selectedMods",
              that.modObjectBottom.selectedMods.concat(temp)
            );
          }
        }
      });
    },
    contains: function (a, scopeMods) {
      var isIn = false;
      for (var i = 0; i < scopeMods.length; i++) {
        var listMod = scopeMods[i];
        if (a.name === listMod.name) {
          if (a.site === listMod.site) {
            if (a.index === listMod.index) {
              if (a.elementChange && listMod.elementChange) {
                if (a.elementChange == listMod.elementChange) {
                  isIn = true;
                }
              } else if (a.deltaMass && listMod.deltaMass) {
                if (a.deltaMass == listMod.deltaMass) {
                  isIn = true;
                }
              }
            }
          }
        }
      }
      return isIn;
    },
    modSelectOptionValue: function (mod, topSpectrum = true) {
      var returnString = mod.name + ": " + mod.site;

      if (
        (mod.index != -1 &&
          topSpectrum &&
          mod.index != this.oSpectrumModel.data.sequence.length) ||
        (!topSpectrum &&
          mod.index != this.oReferenceSpectrumModel.data.sequence.length)
      ) {
        returnString += mod.index + 1;
      }

      return returnString;
    },
    modSelectOption: function (mod, topSpectrum = true) {
      var returnString = mod.name + ": " + mod.site;

      if (
        (mod.index != -1 &&
          topSpectrum &&
          mod.index != this.oSpectrumModel.data.sequence.length) ||
        (!topSpectrum &&
          mod.index != this.oReferenceSpectrumModel.data.sequence.length)
      ) {
        returnString += mod.index + 1;
      }

      returnString += " (";

      if (mod.deltaMass) {
        if (mod.deltaMass > 0) {
          returnString += "+";
        }
        returnString += mod.deltaMass + ")";
      } else {
        returnString += mod.elementChange + ")";
      }

      return returnString;
    },
    loadMods: function (topSpectrum = true) {
      // get potential mods from text file
      var sSeq = "";
      var aTempPotMods = [];
      var aMods = [];
      var char, i, j, mod, addMod;
      var tempArray = [];
      if (this.predeterminedMods.length === 0) {
        var text = "Mods not yet loaded.";
        var data = ModificationsTxt;
        text = data.split("\n");
        tempArray = [];

        for (i = 0; i < text.length - 1; i++) {
          var line = text[i].split(";");

          tempArray.push({
            name: line[0],
            site: line[1],
            elementChange: line[2],
          });
        }
        this.predeterminedMods = tempArray;

        sSeq = topSpectrum
          ? this.oSpectrumModel.data.sequence
          : this.oReferenceSpectrumModel.data.sequence;

        aTempPotMods = topSpectrum
          ? this.potentialMods
          : this.potentialModsBottom;
        if (topSpectrum) {
          this.potentialMods = this.predeterminedMods;
          this.mods = [];
        } else {
          this.potentialModsBottom = this.predeterminedMods;
          this.modsBottom = [];
        }

        aMods = topSpectrum ? this.mods : this.modsBottom;
        for (i = 0; i < sSeq.length; i++) {
          char = sSeq.charAt(i).toUpperCase();
          for (j = 0; j < aTempPotMods.length; j++) {
            mod = aTempPotMods[j];
            addMod = {};
            if (
              mod.site.charAt(0) == char &&
              mod.site != "N-terminus" &&
              mod.site != "C-terminus"
            ) {
              if (mod.deltaMass) {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: i,
                  deltaMass: mod.deltaMass,
                };
              } else {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: i,
                  elementChange: mod.elementChange,
                };
              }

              if (!this.contains(addMod, aMods)) {
                if (topSpectrum) {
                  this.mods.push(addMod);
                } else {
                  this.modsBottom.push(addMod);
                }
              }
            } else if (mod.site == "N-terminus") {
              if (mod.deltaMass) {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: -1,
                  deltaMass: mod.deltaMass,
                };
              } else {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: -1,
                  elementChange: mod.elementChange,
                };
              }
              if (!this.contains(addMod, aMods)) {
                if (topSpectrum) {
                  this.mods.push(addMod);
                } else {
                  this.modsBottom.push(addMod);
                }
              }
            } else if (mod.site == "C-terminus") {
              if (mod.deltaMass) {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: sSeq.length,
                  deltaMass: mod.deltaMass,
                };
              } else {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: sSeq.length,
                  elementChange: mod.elementChange,
                };
              }
              if (!this.contains(addMod, aMods)) {
                if (topSpectrum) {
                  this.mods.push(addMod);
                } else {
                  this.modsBottom.push(addMod);
                }
              }
            }
          }
        }
      } else {
        if (topSpectrum) {
          this.potentialMods = this.predeterminedMods;
          this.mods = [];
        } else {
          this.potentialModsBottom = this.predeterminedMods;
          this.modsBottom = [];
        }

        sSeq = topSpectrum
          ? this.oSpectrumModel.data.sequence
          : this.oReferenceSpectrumModel.data.sequence;

        aTempPotMods = topSpectrum
          ? this.potentialMods
          : this.potentialModsBottom;
        aMods = topSpectrum ? this.mods : this.modsBottom;
        for (i = 0; i < sSeq.length; i++) {
          char = sSeq.charAt(i).toUpperCase();
          for (j = 0; j < aTempPotMods.length; j++) {
            mod = aTempPotMods[j];
            addMod = {};
            if (
              mod.site.charAt(0) == char &&
              mod.site != "N-terminus" &&
              mod.site != "C-terminus"
            ) {
              if (mod.deltaMass) {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: i,
                  deltaMass: mod.deltaMass,
                };
              } else {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: i,
                  elementChange: mod.elementChange,
                };
              }

              if (!this.contains(addMod, aMods)) {
                if (topSpectrum) {
                  this.mods.push(addMod);
                } else {
                  this.modsBottom.push(addMod);
                }
              }
            } else if (mod.site == "N-terminus") {
              if (mod.deltaMass) {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: -1,
                  deltaMass: mod.deltaMass,
                };
              } else {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: -1,
                  elementChange: mod.elementChange,
                };
              }
              if (!this.contains(addMod, aMods)) {
                if (topSpectrum) {
                  this.mods.push(addMod);
                } else {
                  this.modsBottom.push(addMod);
                }
              }
            } else if (mod.site == "C-terminus") {
              if (mod.deltaMass) {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: sSeq.length,
                  deltaMass: mod.deltaMass,
                };
              } else {
                addMod = {
                  name: mod.name,
                  site: mod.site,
                  index: sSeq.length,
                  elementChange: mod.elementChange,
                };
              }
              if (!this.contains(addMod, aMods)) {
                if (topSpectrum) {
                  this.mods.push(addMod);
                } else {
                  this.modsBottom.push(addMod);
                }
              }
            }
          }
        }
      }

      if (topSpectrum) {
        this.mods = this.mods.sort(this.sortMods);
      } else {
        this.modsBottom = this.modsBottom.sort(this.sortMods);
      }
    },
    sortMods: function (x, y) {
      let xName = x.name.toLowerCase();
      let yName = y.name.toLowerCase();

      let xSite = x.site.toLowerCase();
      let ySite = y.site.toLowerCase();

      if (xName < yName) return -1;
      if (xName > yName) return 1;
      if (xSite < ySite) return -1;
      if (xSite > ySite) return 1;
      if (x.index < y.index) return -1;
      if (x.index > y.index) return 1;
      return 0;
    },
    nlChange: function () {
      if (this.nlCount > this.maxNlCount) {
        this.nlCount = this.maxNlCount;
      }
      if (this.nlCount < 0) {
        this.nlCount = 0;
      }
    },
    selectAll: function () {
      this.setButtonStates(1);
    },
    deselectAll: function () {
      this.setButtonStates(0);
    },
    disableAllButtons: function (bState) {
      this.ions.forEach((x) => {
        x.enabled.fill(bState);
      });
      this.extraPeaks.forEach((x) => {
        x.enabled = bState;
      });
      this.nl.forEach((x) => {
        x.enabled = bState;
      });
    },
    setButtonStates: function (bState) {
      this.ions.forEach((x) => {
        x.state = [];
        x.enabled.forEach((e, i) => {
          if (e * bState) {
            x.state.push(i);
          }
        });
      });
      this.extraPeaks.forEach((x) => {
        x.state = bState * x.enabled;
      });
      this.nl.forEach((x) => {
        x.state = bState * x.enabled;
      });
      this.setSelectedIonList(false);
      this.setSelectedExtraPeakList(false);
      this.setSelectedNeutralLossList(true);
    },
    setSelectedIonList: function (triggerMerge = true) {
      var selected = this.ions.filter((ion) => {
        return ion.state.length > 0;
      });

      if (selected.length > 0) {
        selected = selected.map((x) => {
          var dict = {};
          dict[x.ion] = x.state
            .map((c, i) => {
              return (c + 1) * x.enabled[i];
            })
            .reduce((p, n) => {
              if (n !== 0) {
                return p.concat(n);
              } else {
                return p;
              }
            }, []);
          return dict;
        });
      }
      this.oSpectrumModel.data.selectedIonList = selected;
      this.oSpectrumModel.data.fragmentTypes = this.getFragmentTypes();

      this.oReferenceSpectrumModel.data.selectedIonList = selected;
      this.oReferenceSpectrumModel.data.fragmentTypes = this.getFragmentTypes();
      if (triggerMerge) {
        this.prepareSpectrum();
        this.prepareReferenceSpectrum();
        this.mergeAndCalculateScores();
      }
    },
    setSelectedExtraPeakList: function (triggerMerge = true) {
      var selected = this.extraPeaks.filter((ion) => {
        return ion.state + 0 === 1;
      });

      if (selected.length > 0) {
        selected = selected.map((x) => {
          if (x.ion === "M[H]") {
            return "M";
          } else {
            return x.ion;
          }
        });
      }
      this.oSpectrumModel.data.selectedExtraPeakList = selected;
      this.oSpectrumModel.data.fragmentTypes = this.getFragmentTypes();

      if (triggerMerge) {
        this.prepareSpectrum();
        this.prepareReferenceSpectrum();
        this.mergeAndCalculateScores();
      }
    },
    setSelectedNeutralLossList: function (triggerMerge = true) {
      var selected = this.nl.filter((ion) => {
        return ion.state + 0 === 1;
      });

      if (selected.length > 0) {
        selected = selected.map((x) => {
          return x.name;
        });
      }
      this.oSpectrumModel.data.selectedNeutralLossList = selected;
      this.oSpectrumModel.data.fragmentTypes = this.getFragmentTypes();

      this.oReferenceSpectrumModel.data.selectedNeutralLossList = selected;
      this.oReferenceSpectrumModel.data.fragmentTypes = this.getFragmentTypes();

      if (triggerMerge) {
        this.prepareSpectrum();
        this.prepareReferenceSpectrum();
        this.mergeAndCalculateScores();
      }
    },
    check: function (spectrum) {
      if (typeof spectrum == "undefined") {
        return [
          {
            mz: "",
            intensity: "",
            percentBasePeak: 0,
            sn: null,
            matchedFeatures: [],
          },
        ];
      } else {
        return spectrum;
      }
    },
    mergeSpectra: function (sp1, sp2) {
      var binarySpectrum_1 = binary.binary_search_spectrum(
        sp1,
        sp2,
        this.massTolerance[this.selectedMassTolerance + 0].text,
        this.massTolerance[this.selectedMassTolerance + 0].value
      );
      var binarySpectrum_2 = binary.binary_search_spectrum(
        sp2,
        sp1,
        this.massTolerance[this.selectedMassTolerance + 0].text,
        this.massTolerance[this.selectedMassTolerance + 0].value
      );
      binarySpectrum_1 = binary.selectMostIntensePeak(binarySpectrum_1);
      binarySpectrum_2 = binary.selectMostIntensePeak(binarySpectrum_2);
      var result = binary.full_merge(binarySpectrum_1, binarySpectrum_2);
      return result;
    },
    calculateScores: function (sp1, sp2) {
      var result = this.mergeSpectra(sp1, sp2);
      var binarySpectrum = {};
      binarySpectrum["intensity_1"] = result.map(function (x) {
        return x.intensity_1;
      });
      binarySpectrum["intensity_2"] = result.map(function (x) {
        return x.intensity_2;
      });

      var spectral_angle = measures.ipsa_helper["comparison"]["spectral_angle"](
        binarySpectrum["intensity_1"],
        binarySpectrum["intensity_2"]
      );
      var pearson_correlation = measures.ipsa_helper["comparison"][
        "pearson_correlation"
      ](binarySpectrum["intensity_1"], binarySpectrum["intensity_2"]);

      return {
        sa: Math.round(spectral_angle * 100) / 100,
        corr: Math.round(pearson_correlation * 100) / 100,
      };
    },
    getScores: function (spec1, spec2) {
      var compar = new comparator.Comparator(
        spec1,
        spec2,
        this.matchTolerance[this.selectedMatchTolerance + 0].text,
        this.matchTolerance[this.selectedMatchTolerance + 0].value
      );
      var scoresO = compar.calculate_scores();

      this.scoreBottom = scoresO.spec2;
      this.scoreTop = scoresO.spec1;

      this.score = scoresO.full;
    },
    mergeAndCalculateScores: function () {
      if (this.topPeaks.peaks) {
        if (this.bottomPeaks.peaks) {
          var top = this.check(this.topPeaks.peaks);
          var bottom = this.check(this.bottomPeaks.peaks);

          var mergedForRegression = this.mergeSpectra(top, bottom);
          var originalData = this.mergeSpectra(top, bottom);

          mergedForRegression = mergedForRegression.filter((x) => {
            return x.mz_1 !== -1 && x.mz_2 !== -1;
          });
          var int1 = mergedForRegression.map((x) => {
            return x.intensity_1;
          });
          var int2 = mergedForRegression.map((x) => {
            return x.intensity_2;
          });
          var beta_hat;
          if (int1.length === 0 && int2.length === 0) {
            beta_hat = 1;
          } else {
            beta_hat = measures.regressionThroughZero(int1, int2);
          }

          // data is max scaled if no merged peaks are found
          var int1Scaling = d3.max(
            mergedForRegression.map((x) => {
              return x.intensity_1;
            })
          );
          int1Scaling = isNaN(int1Scaling)
            ? d3.max(originalData, (x) => {
                return x.intensity_1;
              })
            : int1Scaling;
          var int2Scaling = d3.max(
            mergedForRegression.map((x) => {
              return x.intensity_2;
            })
          );
          int2Scaling = isNaN(int2Scaling)
            ? d3.max(originalData, (x) => {
                return x.intensity_2;
              })
            : int2Scaling;

          var intensityerror = originalData.map((x) => {
            if (x.mz_1 === -1 || x.mz_2 === -1) {
              return 0;
            }
            var delta = x.mz_1 - x.mz_2;
            var avg = (x.mz_1 + x.mz_2) / 2;
            return (delta / avg) * Math.pow(10, 6);
          });
          var intensityerrorx = originalData.map((x) => {
            if (x.mz_1 < 0) {
              return x.mz_2;
            } else if (x.mz_2 < 0) {
              return x.mz_1;
            }
            return (x.mz_1 + x.mz_2) / 2;
          });
          // size of bubble
          var intensityDifference = originalData.map((x) => {
            if (x.mz_1 === -1) {
              return Math.abs(x.intensity_2 / int2Scaling);
            }
            if (x.mz_2 === -1) {
              return Math.abs(beta_hat * (x.intensity_1 / int1Scaling));
            }
            // return(Math.abs( beta_hat * (x.intensity_1/int1Scaling) - x.intensity_2/int2Scaling) *100)
            return Math.abs(
              beta_hat * (x.intensity_1 / int1Scaling) -
                x.intensity_2 / int2Scaling
            );
          });
          this.plotData(
            this.topPeaks,
            intensityerror,
            intensityerrorx,
            intensityDifference,
            originalData.map((x) => {
              return x.id_1;
            }),
            originalData.map((x) => {
              return x.id_2;
            })
          );
          this.plotMirrorData(this.bottomPeaks);
          this.getScores(top, bottom);
        } else {
          this.plotData(this.topPeaks);
        }
      }
      this.$emit("plottingFinished", null);
    },
    preInitializeModel: function () {
      this.nl.forEach((n) => {
        this.fragmentTypes[n.name] = { selected: false };
      });

      var oSpectrumData = {
        identificationID: null,
        selectedIonList: [{ y: [1] }, { b: [1] }],
        selectedExtraPeakList: ["M"],
        selectedNeutralLossList: [],
        massTolerance: this.massTolerance[this.selectedMassTolerance + 0].value,
        minX: 0,
        maxY: 0,
        maxYRefSpectrum: 0,
        massToleranceUnit: this.selectedMassTolerance + 1, // default is Dalton
        massToleranceType:
          this.massTolerance[this.selectedMassTolerance + 0].text, // default is Dalton
        isReferenceSpectrum: this.isReferenceSpectrum,
        showReferenceSpectrum: false,
        neutralLossLimit: this.nlCount,
        expertMode: this.expert,
        instrumentId: 0,
        sequence: this.peptideSequence,
        maxX: null,
        peptideId: this.peptideId,
        mz: null,
        massError: null,
        charge: null,
        precursorCharge: null,
        file: null,
        scan: null,
        variableModifications: "",
        fixedModifications: "",
        fragmentTypes: this.getFragmentTypes(),
        matchingType: "% Base Peak",
        cutoff: 0,
        modString: "",
        aMods: [],
      };

      this.mirrorSequence = this.peptideSequence;
      this.mirrorSequencePrecursorCharge = 2;

      // Update model
      this.oSpectrumModel = {
        data: oSpectrumData,
      };

      this.oReferenceSpectrumModel = {
        data: Object.assign({}, oSpectrumData),
      };

      this.oReferenceSpectrumModel.data.sequence = this.mirrorSequence;
      this.oReferenceSpectrumModel.data.precursorCharge =
        this.mirrorSequencePrecursorCharge;

      this.mods = [];
      this.modsBottom = [];
      this.modObject = { selectedMods: [] };
      this.modObjectBottom = { selectedMods: [] };
      this.loadMods();
      this.loadMods(false);
      setTimeout(() => {
        this.setPreselectedMods(false);
      }, 50);
    },
    initializeModel: function () {
      this.nl.forEach((n) => {
        this.fragmentTypes[n.name] = { selected: false };
      });

      let oData = this.spectrumEntry;
      var oSpectrumData = {
        identificationID: this.isReferenceSpectrum
          ? oData.REFERENCE_IDENTIFICATION_ID
          : oData.IDENTIFICATION_ID,
        massTolerance: this.massTolerance[this.selectedMassTolerance + 0].value,
        massToleranceUnit: this.selectedMassTolerance + 1, // default is Dalton
        massToleranceType:
          this.massTolerance[this.selectedMassTolerance + 0].text, // default is Dalton
        neutralLossLimit: this.nlCount,
        expertMode: this.expert,
        sequence: this.isReferenceSpectrum
          ? oData.SEQUENCE
          : oData.PEPTIDE_SEQUENCE,
        maxX: Math.round(oData.MASS * 10000) / 10000 || undefined,
        peptideId: oData.PEPTIDE_ID,
        mz: Math.round(oData.PRECURSOR_MZ * 10000) / 10000 || undefined,
        massError: Math.round(oData.MASS_ERROR_PPM * 100) / 100,
        charge: oData.PRECURSOR_CHARGE,
        precursorCharge: oData.PRECURSOR_CHARGE,
        file: oData.MSFILE_NAME || "",
        scan: oData.SPECTRUM_ID,
        variableModifications: oData.VARIABLE_MODIFICATION_STRING || "",
        fixedModifications: oData.FIXED_MODIFICATION_STRING || "",
        fragmentTypes: this.getFragmentTypes(),
        matchingType: "% Base Peak",
      };

      this.mirrorSequence = this.isReferenceSpectrum
        ? oData.SEQUENCE
        : oData.PEPTIDE_SEQUENCE;
      this.mirrorSequencePrecursorCharge = oData.PRECURSOR_CHARGE;

      oSpectrumData = { ...this.oSpectrumModel.data, ...oSpectrumData };
      // Update model
      this.oSpectrumModel = {
        data: oSpectrumData,
      };

      this.oReferenceSpectrumModel = {
        data: Object.assign({}, oSpectrumData),
      };

      this.oReferenceSpectrumModel.data.sequence = this.mirrorSequence;
      this.oReferenceSpectrumModel.data.precursorCharge =
        this.mirrorSequencePrecursorCharge;

      this.setPreselectedMods(false);
      this.getSpectrumData();
      this.getReferenceSpectra(
        this.spectrumEntry.PEPTIDE_ID,
        this.spectrumEntry.PRECURSOR_CHARGE
      );
    },
    resetBottomMods: function () {
      this.modsBottom = [];
      this.modObjectBottom = { selectedMods: [] };
      this.potentialModsBottom = [];
    },
    resetBottom: function () {
      this.bottomSpec = {
        x: [],
        y: [],
        id: [],
        color: [],
        label: [],
        labelCharge: [],
        neutralLosses: [],
        barwidth: [],
        massError: [],
        theoMz: [],
        percentBasePeak: [],
        TIC: 0,
      };
      this.peptideBottom = {
        sequence: "TESTPEPTIDE",
        precursorMz: null,
        precursorCharge: null,
        mods: [
          {
            site: -1,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 0,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 1,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 2,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 3,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 4,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 5,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 6,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 7,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 8,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 9,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 10,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 11,
            deltaElement: null,
            deltaMass: 0,
          },
        ],
        origin: "Origin",
      };
      this.score = {
        sa: 0.0,
        corr: 0.0,
      };
      this.scoreTop = {
        sa: 0.0,
        corr: 0.0,
      };
      this.scoreBottom = {
        sa: 0.0,
        corr: 0.0,
      };
    },
    resetAll: function () {
      this.panel = 0;
      this.mods = [];
      this.modObject = { selectedMods: [] };
      this.predeterminedMods = [];
      this.potentialMods = [];
      this.topSpec = {
        x: [],
        y: [],
        id: [],
        color: [],
        label: [],
        labelCharge: [],
        neutralLosses: [],
        barwidth: [],
        massError: [],
        theoMz: [],
        percentBasePeak: [],
        TIC: 0,
        massErrorX: [],
        intensityError: [],
        intensityErrorIdsTop: [],
        intensityErrorIdsBottom: [],
      };
      this.peptide = {
        sequence: "TESTPEPTIDE",
        precursorMz: null,
        precursorCharge: null,
        mods: [
          {
            site: -1,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 0,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 1,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 2,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 3,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 4,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 5,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 6,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 7,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 8,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 9,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 10,
            deltaElement: null,
            deltaMass: 0,
          },
          {
            site: 11,
            deltaElement: null,
            deltaMass: 0,
          },
        ],
        origin: "Origin",
      };
      this.specViewSettings = {
        toleranceThreshold: 40,
        toleranceType: "ppm",
        ionizationMode: "+",
      };
      this.oAcquisitionModeSet = [];
      this.aAcquisitionModes = [];
      this.topPeaks = {};
      this.bottomPeaks = {};
      this.mirrorOrigin = 0;
      this.mirrorSequenceRules = [
        (v) => v.length <= 30 || "Max 30 amino acids",
      ];
      this.mirrorSequence = "";
      this.mirrorSequencePrecursorCharge = 1;
      this.mirrorSequenceCE = 30;
      this.selectedReferenceSpectrum = [];
      this.selectedAcquisitionMode = "All";
      this.aReferenceSpectrumList = [];
      this.ions = [
        {
          ion: "a",
          charges: ["1+", "2+", "3+"],
          state: [],
          enabled: [0, 0, 0],
        },
        {
          ion: "b",
          charges: ["1+", "2+", "3+"],
          state: [],
          enabled: [0, 0, 0],
        },
        {
          ion: "c",
          charges: ["1+", "2+", "3+"],
          state: [],
          enabled: [0, 0, 0],
        },
        {
          ion: "x",
          charges: ["1+", "2+", "3+"],
          state: [],
          enabled: [0, 0, 0],
        },
        {
          ion: "y",
          charges: ["1+", "2+", "3+"],
          state: [],
          enabled: [0, 0, 0],
        },
        {
          ion: "z",
          charges: ["1+", "2+", "3+"],
          state: [],
          enabled: [0, 0, 0],
        },
      ];
      this.extraPeaks = [
        { ion: "yb", state: 0, enabled: 0 },
        { ion: "IM", state: 0, enabled: 0 },
        { ion: "M[H]", state: 0, enabled: 0 },
      ];
      this.nl = [
        { name: "H2O", state: 0, enabled: 0 },
        { name: "NH3", state: 0, enabled: 0 },
        { name: "CO", state: 0, enabled: 0 },
        { name: "CO2", state: 0, enabled: 0 },
        { name: "C2H4", state: 0, enabled: 0 },
        { name: "C3H6", state: 0, enabled: 0 },
        { name: "C4H8", state: 0, enabled: 0 },
        { name: "C2H4O2", state: 0, enabled: 0 },
        { name: "C2H5NO", state: 0, enabled: 0 },
        { name: "C3H9N3", state: 0, enabled: 0 },
        { name: "C4H6N2", state: 0, enabled: 0 },
        { name: "CH2N2", state: 0, enabled: 0 },
      ];
      this.massTolerance = [
        { text: "ppm", value: 20 },
        { text: "Da", value: 0.35 },
      ];
      this.matchTolerance = [
        { text: "ppm", value: 20 },
        { text: "Da", value: 0.35 },
      ];
      this.nlCount = 3;
      this.maxNlCount = 3;
      this.selectedMassTolerance = false;
      this.selectedMatchTolerance = false;
      this.expert = true;
      this.fragmentTypes = {
        a: {
          selected: false,
          color: "#820cad",
          label: "a",
        },
        b: {
          selected: false,
          color: "#0d75bc",
          label: "b",
        },
        c: {
          selected: false,
          color: "#07a14a",
          label: "c",
        },
        C: {
          selected: false,
          color: "#035729",
          label: "c-1",
        },
        x: {
          selected: false,
          color: "#d1e02d",
          label: "x",
        },
        y: {
          selected: false,
          color: "#be202d",
          label: "y",
        },
        z: {
          selected: false,
          color: "#f79420",
          label: "z•",
        },
        Z: {
          selected: false,
          color: "#A16016",
          label: "z+1",
        },
        yb: {
          selected: false,
          color: "#00ff00",
          label: "yb",
        },
        IM: {
          selected: false,
          color: "#ffff00",
          label: "IM",
        },
        precursor: {
          selected: true,
          color: "#000000",
        },
        unassigned: {
          selected: true,
          color: "#a6a6a6",
        },
      };
      this.resetBottom();
      this.resetBottomMods();
    },
    resetFragmentTypes: function () {
      var ft = Object.keys(this.fragmentTypes);
      var that = this;
      ft.forEach((ion) => {
        that.fragmentTypes[ion].selected = false;
      });
    },
    getFragmentTypes: function () {
      this.resetFragmentTypes();
      var that = this;
      this.ions
        .filter((ion) => {
          return ion.state.length !== 0;
        })
        .forEach((i) => {
          that.fragmentTypes[i.ion].selected = true;
        });
      this.nl
        .filter((ion) => {
          return ion.state + 0 !== 0;
        })
        .forEach((i) => {
          that.fragmentTypes[i.name].selected = true;
        });
      if (
        this.extraPeaks.filter((ion) => {
          return ion.ion === "M[H]";
        })[0].state === 1
      ) {
        that.fragmentTypes.precursor.selected = true;
      }
      if (
        this.extraPeaks.filter((ion) => {
          return ion.ion === "yb";
        })[0].state === 1
      ) {
        that.fragmentTypes.yb.selected = true;
      }
      if (
        this.extraPeaks.filter((ion) => {
          return ion.ion === "IM";
        })[0].state === 1
      ) {
        that.fragmentTypes.IM.selected = true;
      }
      return this.fragmentTypes;
    },
    updateIonCheckBoxes: function updateIonCheckBoxes() {
      var oSpectrumData = this.oSpectrumModel.data;
      var availableIons = oSpectrumData.rawData
        .map((x) => {
          return { ion: x.ion, charge: x.ch, intensity: x.oii };
        })
        .filter((x) => {
          return x.intensity > 0;
        })
        .reduce((p, n) => {
          if (p.length === 0) {
            return [{ ion: n.ion, charges: [n.charge] }];
          } else {
            var pi = p.filter((x) => {
              return x.ion === n.ion;
            });
            if (pi.length === 0) {
              return p.concat([{ ion: n.ion, charges: [n.charge] }]);
            } else {
              if (pi[0].charges.indexOf(n.charge) !== -1) {
                return p;
              } else {
                p.filter((x) => {
                  return x.ion === n.ion;
                })[0].charges.push(n.charge);
                return p;
              }
            }
          }
        }, [])
        .filter((x) => {
          return x.ion !== undefined;
        });

      this.disableAllButtons(0);
      var that = this;

      //
      // make them enabled or disabled
      //
      availableIons.forEach((x) => {
        var aPos = x.charges.map((e) => {
          return e - 1;
        });

        var t_ion = that.ions.filter((ion) => {
          return ion.ion === x.ion;
        })[0];
        if (t_ion) {
          aPos.forEach((i) => {
            that.ions.filter((ion) => {
              return ion.ion === x.ion;
            })[0].enabled[i] = 1;
          });
        } else {
          if (x.ion === "M") {
            that.extraPeaks.filter((ion) => {
              return ion.ion === "M[H]";
            })[0].enabled = 1;
          } else {
            that.extraPeaks.filter((ion) => {
              return ion.ion === x.ion;
            })[0].enabled = 1;
          }
        }
      });

      var availableNL = oSpectrumData.rawData
        .filter((ion) => {
          return ion.nln !== null;
        })
        .map((x) => {
          return x.nln;
        })
        .reduce((p, n) => {
          if (n !== "Q" && p.indexOf(n) === -1) {
            return p.concat(n);
          } else {
            return p;
          }
        }, []);
      availableNL.forEach((n) => {
        var existing = that.nl.filter((x) => {
          return x.name === n;
        });
        if (existing.length > 0) {
          that.nl.filter((x) => {
            return x.name === n;
          })[0].enabled = 1;
        }
      });

      //
      // make them selected or not
      //
      // TODO select only if state = 1

      oSpectrumData.selectedIonList.forEach((ion) => {
        let ionName = Object.keys(ion)[0];
        let ionNumbers = ion[ionName].map((pos) => {
          return pos - 1;
        });

        that.ions.filter((f) => {
          return f.ion === ionName;
        })[0].state = ionNumbers;
      });
      oSpectrumData.selectedExtraPeakList.forEach((ionName) => {
        if (ionName === "M") {
          that.extraPeaks.filter((f) => {
            return f.ion === "M[H]";
          })[0].state =
            1 *
            that.extraPeaks.filter((f) => {
              return f.ion === "M[H]";
            })[0].enabled;
        } else {
          that.extraPeaks.filter((f) => {
            return f.ion === ionName;
          })[0].state =
            1 *
            that.extraPeaks.filter((f) => {
              return f.ion === ionName;
            })[0].enabled;
        }
      });

      oSpectrumData.selectedNeutralLossList.forEach((n) => {
        that.nl.filter((x) => {
          return x.name === n;
        })[0].state = 1;
      });
    },
    getMirrorSpectrum: function (refId = null, topSpectrum = false) {
      this.prositError = [];
      if (refId !== null) {
        this.selectedReferenceSpectrum = refId;
      }

      var modString = "";
      if (topSpectrum) {
        if (this.modObject.selectedMods != undefined) {
          this.modObject.selectedMods.sort((x, y) => {
            return x.index > y.index;
          });
          this.modObject.selectedMods.forEach(function (mod) {
            if (modString != "") {
              modString += ",";
            }
            modString += mod.name + "@" + mod.site + (mod.index + 1);
          });
        }
      } else {
        if (this.modObjectBottom.selectedMods !== undefined) {
          this.modObjectBottom.selectedMods.sort((x, y) => {
            return x.index > y.index;
          });
          this.modObjectBottom.selectedMods.forEach(function (mod) {
            if (modString != "") {
              modString += ",";
            }
            modString += mod.name + "@" + mod.site + (mod.index + 1);
          });
        }
      }

      var that = this;
      var url;
      var params = {};
      this.oReferenceSpectrumModel.data.sequence = that.mirrorSequence;
      this.oReferenceSpectrumModel.data.charge =
        that.mirrorSequencePrecursorCharge;
      this.oReferenceSpectrumModel.data.precursorCharge =
        that.mirrorSequencePrecursorCharge;

      if (this.mirrorOrigin === 0) {
        url =
          this.$store.state.host +
          "/proteomicsdb/logic/api/getFragmentationPrediction.xsjs";
        params = {
          sequence: [that.mirrorSequence],
          charge: [that.mirrorSequencePrecursorCharge],
          ce: [that.mirrorSequenceCE],
          mods: [modString],
          model: this.prositModel,
        };

        axios
          .post(url, params)
          .then(function (response) {
            that.oReferenceSpectrumModel.data.rawData =
              response.data[0].ions.map((ion) => {
                return {
                  oim: ion.mz,
                  ch: ion.charge,
                  oii: ion.intensity,
                  num: ion.number,
                  ion: ion.ion,
                  nln: null,
                };
              });
            that.oReferenceSpectrumModel.data.fragmentTypes =
              that.getFragmentTypes();
            that.prepareReferenceSpectrum();
            that.mergeAndCalculateScores();
          })
          .catch((error) => {
            that.prositError.push(error.response.data.message);
            that.resetBottom();
          });
      } else {
        var id = that.selectedReferenceSpectrum;
        url =
          this.$store.state.host +
          "/proteomicsdb/logic/getReferenceSpectrumInformation.xsjs";
        params = {
          id: id.key.split("-")[0],
          origin: id.key.split("-")[1],
        };
        axios.get(url, { params: params }).then(function (response) {
          that.oReferenceSpectrumModel.data.rawData = response.data.ions.map(
            (ion) => {
              return {
                mZ: ion.oim,
                intensity: ion.oii,
              };
            }
          );
          that.oReferenceSpectrumModel.data.fragmentTypes =
            that.getFragmentTypes();
          that.prepareReferenceSpectrum();
          that.mergeAndCalculateScores();
        });
      }
    },
    getSpectrumData: function () {
      var that = this;
      var oSpectrumData = this.oSpectrumModel.data;
      var url;

      if (oSpectrumData.isReferenceSpectrum) {
        url =
          this.$store.state.host +
          "/proteomicsdb/logic/getReferenceSpectrumInformationNew.xsjs";
      } else {
        url =
          this.$store.state.host +
          "/proteomicsdb/logic/getSpectrumInformationNew.xsjs";
      }

      axios
        .get(url, {
          params: {
            id: this.oSpectrumModel.data.identificationID,
            tolerance: this.oSpectrumModel.data.massTolerance,
            tolerance_type: this.oSpectrumModel.data.massToleranceUnit,
            instrument_id: this.oSpectrumModel.data.instrumentId,
            max_nl: this.oSpectrumModel.data.neutralLossLimit,
            expert_mode: this.oSpectrumModel.data.expertMode,
          },
        })
        .then(function (response) {
          that.oSpectrumModel.data.rawData = response.data.ions;
          that.disableAllButtons(1);
          that.updateIonCheckBoxes();
          that.oSpectrumModel.data.fragmentTypes = that.getFragmentTypes();
          that.prepareSpectrum();

          that.getMirrorSpectrum();
          that.mergeAndCalculateScores();
        });
    },
    updateConfiguration: function (topSpectrum = true) {
      var oData = topSpectrum
        ? this.oSpectrumModel.data
        : this.oReferenceSpectrumModel.data;
      oData.massTolerance =
        this.massTolerance[this.selectedMassTolerance + 0].value;
      oData.massToleranceUnit = this.selectedMassTolerance + 1; // default is ppm
      oData.massToleranceType =
        this.massTolerance[this.selectedMassTolerance + 0].text; // default is ppm
      oData.neutralLossLimit = this.nlCount;
      oData.expertMode = this.expert;
    },
    getSpectra: function () {
      this.updateConfiguration();
      this.getSpectrumData();
    },
    prepareSpectrum: function () {
      var useT = new useTransformer.Annotation(this.oSpectrumModel.data);
      var returnedDataT = useT.fakeAPI();
      this.topPeaks = returnedDataT;
      //this.plotData(returnedDataT);
    },
    prepareReferenceSpectrum: function () {
      var useB =
        this.mirrorOrigin === 0
          ? new useTransformer.Annotation(this.oReferenceSpectrumModel.data)
          : new annotationTransformer.Annotation(
              this.oReferenceSpectrumModel.data
            );
      var returnedDataB = useB.fakeAPI();
      this.bottomPeaks = returnedDataB;
      //this.plotMirrorData(returnedDataB);
    },
    plotMirrorData: function (returnedData) {
      this.peptideBottom = {
        sequence: returnedData.sequence,
        precursorMz: returnedData.precursorMz,
        precursorCharge: returnedData.precursorCharge,
        mods: returnedData.modifications,
        origin: this.mirrorOrigin === 0 ? "Prosit" : "ProteomeTools",
      };

      this.bottomSpec.x = [];
      this.bottomSpec.y = [];
      this.bottomSpec.color = [];
      this.bottomSpec.label = [];
      this.bottomSpec.labelCharge = [];
      this.bottomSpec.neutralLosses = [];
      this.bottomSpec.barwidth = [];
      this.bottomSpec.massError = [];
      this.bottomSpec.theoMz = [];
      this.bottomSpec.percentBasePeak = [];
      this.bottomSpec.TIC = 0;
      var that = this;
      returnedData.peaks.forEach(function (data, i) {
        that.bottomSpec.x.push(data.mz);
        that.bottomSpec.y.push(data.intensity);
        that.bottomSpec.id.push(i);
        that.bottomSpec.TIC += data.intensity;
        that.bottomSpec.percentBasePeak.push(data.percentBasePeak);
        if (data.matchedFeatures.length == 0) {
          that.bottomSpec.color.push(that.fragmentTypes.unassigned.color);
          that.bottomSpec.label.push("");
          that.bottomSpec.labelCharge.push(0);
          that.bottomSpec.neutralLosses.push("");
          that.bottomSpec.barwidth.push(1);
          that.bottomSpec.massError.push("");
          that.bottomSpec.theoMz.push(0);
        } else {
          var peakData = data.matchedFeatures[0];
          var fragment = peakData.feature;
          if (fragment.type == "a") {
            that.bottomSpec.color.push(that.fragmentTypes.a.color);
          } else if (fragment.type == "b") {
            that.bottomSpec.color.push(that.fragmentTypes.b.color);
          } else if (fragment.type == "c") {
            that.bottomSpec.color.push(that.fragmentTypes.c.color);
          } else if (fragment.type == "C") {
            that.bottomSpec.color.push(that.fragmentTypes.C.color);
          } else if (fragment.type == "x") {
            that.bottomSpec.color.push(that.fragmentTypes.x.color);
          } else if (fragment.type == "y") {
            that.bottomSpec.color.push(that.fragmentTypes.y.color);
          } else if (fragment.type == "z") {
            that.bottomSpec.color.push(that.fragmentTypes.z.color);
          } else if (fragment.type == "Z") {
            that.bottomSpec.color.push(that.fragmentTypes.Z.color);
          } else if (fragment.type == "IM") {
            that.bottomSpec.color.push(that.fragmentTypes.IM.color);
          } else if (fragment.type == "M") {
            that.bottomSpec.color.push(that.fragmentTypes.precursor.color);
          }

          if (fragment.neutralLoss == null) {
            that.bottomSpec.neutralLosses.push("");
          } else {
            that.bottomSpec.neutralLosses.push(fragment.neutralLoss);
          }

          that.bottomSpec.labelCharge.push(fragment.charge);
          // two label types, precursor, or regular label w/wo neutral losses
          if (fragment.isPrecursor) {
            that.bottomSpec.label.push(
              "[" + fragment.type + fragment.number + "]"
            );
          } else {
            that.bottomSpec.label.push(fragment.type + fragment.number);
          }

          that.bottomSpec.barwidth.push(3);
          that.bottomSpec.theoMz.push(fragment.mz);
        }
      });
    },

    plotData: function (
      returnedData,
      returnedError = [],
      returnedErrorX = [],
      intensityError = [],
      intensityErrorIdsTop = [],
      intensityErrorIdsBottom = []
    ) {
      this.peptide = {
        sequence: returnedData.sequence,
        precursorMz: returnedData.precursorMz,
        precursorCharge: returnedData.precursorCharge,
        mods: returnedData.modifications,
        origin: "Experimental",
      };

      this.specViewSettings = {
        toleranceThreshold:
          this.massTolerance[this.selectedMassTolerance + 0].value,
        toleranceType: this.massTolerance[this.selectedMassTolerance + 0].text,
        ionizationMode: "",
      };

      if (returnedData.precursorCharge > 0) {
        this.specViewSettings.ionizationMode = "+";
      } else {
        this.specViewSettings.ionizationMode = "-";
      }

      this.topSpec.x = [];
      this.topSpec.y = [];
      this.topSpec.color = [];
      this.topSpec.label = [];
      this.topSpec.labelCharge = [];
      this.topSpec.neutralLosses = [];
      this.topSpec.barwidth = [];
      this.topSpec.massError = [];
      this.topSpec.theoMz = [];
      this.topSpec.percentBasePeak = [];
      this.topSpec.TIC = 0;
      var that = this;
      returnedData.peaks.forEach(function (data, i) {
        that.topSpec.x.push(data.mz);
        that.topSpec.y.push(data.intensity);
        that.topSpec.id.push(i);
        that.topSpec.TIC += data.intensity;
        that.topSpec.percentBasePeak.push(data.percentBasePeak);
        if (data.matchedFeatures.length == 0) {
          that.topSpec.color.push(that.fragmentTypes.unassigned.color);
          that.topSpec.label.push("");
          that.topSpec.labelCharge.push(0);
          that.topSpec.neutralLosses.push("");
          that.topSpec.barwidth.push(1);
          that.topSpec.massError.push("");
          that.topSpec.theoMz.push(0);
        } else {
          var peakData = data.matchedFeatures[0];
          var fragment = peakData.feature;
          if (fragment.type == "a") {
            that.topSpec.color.push(that.fragmentTypes.a.color);
          } else if (fragment.type === "b") {
            that.topSpec.color.push(that.fragmentTypes.b.color);
          } else if (fragment.type === "c") {
            that.topSpec.color.push(that.fragmentTypes.c.color);
          } else if (fragment.type === "C") {
            that.topSpec.color.push(that.fragmentTypes.C.color);
          } else if (fragment.type === "x") {
            that.topSpec.color.push(that.fragmentTypes.x.color);
          } else if (fragment.type === "y") {
            that.topSpec.color.push(that.fragmentTypes.y.color);
          } else if (fragment.type === "yb") {
            that.topSpec.color.push(that.fragmentTypes.yb.color);
          } else if (fragment.type === "z") {
            that.topSpec.color.push(that.fragmentTypes.z.color);
          } else if (fragment.type === "Z") {
            that.topSpec.color.push(that.fragmentTypes.Z.color);
          } else if (fragment.type === "IM") {
            that.topSpec.color.push(that.fragmentTypes.IM.color);
          } else if (fragment.type === "M") {
            that.topSpec.color.push(that.fragmentTypes.precursor.color);
          }

          if (fragment.neutralLoss == null) {
            that.topSpec.neutralLosses.push("");
          } else {
            that.topSpec.neutralLosses.push(fragment.neutralLoss);
          }

          that.topSpec.labelCharge.push(fragment.charge);
          // two label types, precursor, or regular label w/wo neutral losses
          if (fragment.isPrecursor) {
            that.topSpec.label.push(
              "[" + fragment.type + fragment.number + "]"
            );
          } else {
            that.topSpec.label.push(fragment.type + fragment.number);
          }

          that.topSpec.barwidth.push(3);
          that.topSpec.theoMz.push(fragment.mz);
        }
        that.topSpec.massError = returnedError;
        that.topSpec.massErrorX = returnedErrorX;
        that.topSpec.intensityError = intensityError;
        that.topSpec.intensityErrorIdsTop = intensityErrorIdsTop;
        that.topSpec.intensityErrorIdsBottom = intensityErrorIdsBottom;
      });
    },

    getReferenceSpectra: function (iPeptideId, iCharge) {
      var that = this;

      axios
        .get(
          this.$store.state.host +
            "/proteomicsdb/logic/getReferenceSpectrum.xsjs",
          {
            params: {
              id: iPeptideId,
              charge: iCharge,
            },
          }
        )
        .then(function (response) {
          that.refreshReferenceSpectrumList(
            response.data.filter((x) => x.source_type !== "PREDICTION")
          );
        });
    },
    refreshReferenceSpectrumList: function (oData) {
      var that = this;
      this.oAcquisitionModeSet = {};

      if (oData !== undefined) {
        this.oReferenceSpectra = oData;
      }
      if (this.oReferenceSpectra) {
        // fill aquisition mode dropdown
        this.oReferenceSpectra.forEach(function iterateEachSpectrum(
          oReferenceSpectrum
        ) {
          var oMode = oReferenceSpectrum.mode;
          var aDefinedModes = [];
          if (oMode.fragmentationMethod) {
            aDefinedModes.push("Fragmentation: " + oMode.fragmentationMethod);
          }
          if (oMode.collisionEnergy) {
            aDefinedModes.push("CE: " + oMode.collisionEnergy);
          }
          if (oMode.massAnalyzer) {
            aDefinedModes.push(oMode.massAnalyzer);
          }
          that.oAcquisitionModeSet[aDefinedModes.join(" - ")] = oMode;
        });

        this.aAcquisitionModes = ["All"];

        Object.keys(this.oAcquisitionModeSet).forEach(function iterateSet(key) {
          that.aAcquisitionModes.push(key);
          //TODO add value
        });

        this.filterReferenceSpectrumList(this.oReferenceSpectra, undefined);

        // makes no sense to put this to < 1
        //if (cReferenceSpectrumList.getItems().length <= 1) {
        //  that._Accordion.openSection(that._AccordionFragments.getId());
        //  that._AccordionReferenceSpectrum.setEnabled(false);
        //}
      }
    },
    triggerFilterReferenceSpectrumList: function () {
      this.filterReferenceSpectrumList(
        this.oReferenceSpectra,
        this.oAcquisitionModeSet[this.selectedAcquisitionMode]
      );
    },
    filterReferenceSpectrumList: function (localSpectra, oPeptideMode) {
      var that = this;
      function hasMatchingAquisitionMode(oReferenceSpectrum) {
        let oRefMode = oReferenceSpectrum.mode;
        let bIsSameMode =
          oRefMode.collisionEnergy === oPeptideMode.collisionEnergy &&
          oRefMode.massAnalyzer === oPeptideMode.massAnalyzer &&
          oRefMode.fragmentationMethod === oPeptideMode.fragmentationMethod;
        return bIsSameMode;
      }

      function hasMatchingModifications(oReferenceSpectrum) {
        function sortLexicographically(sModifications) {
          var S_SEPARATOR = "; ";
          return sModifications.split(S_SEPARATOR).sort().join(S_SEPARATOR);
        }
        var oSpectrumData = that.oSpectrumModel.data;
        var sFixedMod = sortLexicographically(
          oSpectrumData.fixedModifications || ""
        );
        var sVariableMod = sortLexicographically(
          oSpectrumData.variableModifications || ""
        );
        var sReferenceFixedMod = sortLexicographically(
          oReferenceSpectrum.fixedModifications || ""
        );
        var sReferenceVariableMod = sortLexicographically(
          oReferenceSpectrum.variableModifications || ""
        );
        return (
          sFixedMod === sReferenceFixedMod &&
          sVariableMod === sReferenceVariableMod
        );
      }

      function hasHighScore(oReferenceSpectrum) {
        var F_SCORE_THRESHOLD = 20.0;
        var F_COUNT_THRESHOLD = 3;
        if (oReferenceSpectrum.mode.origin == "Predicted") {
          return oReferenceSpectrum.score > F_COUNT_THRESHOLD;
        } else if (oReferenceSpectrum.mode.origin == "Measured") {
          return oReferenceSpectrum.score > F_SCORE_THRESHOLD;
        }
        return false;
      }

      function addReferenceSpectrumToList(oReferenceSpectrum) {
        function replaceEmptyString(string) {
          return string ? string : "None";
        }

        var sText =
          oReferenceSpectrum.name +
          " - " +
          oReferenceSpectrum.mode.fragmentationMethod +
          ", " +
          (oReferenceSpectrum.source_type === "PREDICTION" ? "NCE" : "CE") +
          " " +
          oReferenceSpectrum.mode.collisionEnergy;

        var fMods = replaceEmptyString(oReferenceSpectrum.fixedModifications);
        var vMods = replaceEmptyString(
          oReferenceSpectrum.variableModifications
        );
        var sTooltip =
          "charge: " +
          oReferenceSpectrum.p_charge +
          " <br/>" +
          "id: " +
          oReferenceSpectrum.r_id +
          " <br/>" +
          "fixed modifications: " +
          fMods +
          " <br/>" +
          "variable modifications: " +
          vMods +
          " <br/>" +
          "fragmentation method: " +
          oReferenceSpectrum.mode.fragmentationMethod +
          " <br/>" +
          "collision energy: " +
          oReferenceSpectrum.mode.collisionEnergy +
          " <br/>" +
          "mass analyzer: " +
          oReferenceSpectrum.mode.massAnalyzer;
        var sKey = oReferenceSpectrum.r_id;
        that.aReferenceSpectrumList.push({
          text: sText,
          key: sKey + "-" + oReferenceSpectrum.mode.origin,
          tooltip: sTooltip,
        });
      }

      //this.aReferenceSpectrumList = [
      //{
      //  text: 'None',
      //  key: 'None'
      //}
      //];

      if (typeof oPeptideMode !== "undefined") {
        localSpectra
          .filter(hasMatchingAquisitionMode)
          .filter(hasMatchingModifications)
          .filter(hasHighScore)
          .forEach(addReferenceSpectrumToList);
      } else {
        localSpectra
          .filter(hasMatchingModifications)
          .filter(hasHighScore)
          .forEach(addReferenceSpectrumToList);
      }
    },

    getAccessionId: function () {
      var that = this;
      axios
        .get(
          this.$store.state.host +
            "/proteomicsdb/logic/pathways/getAccessionId.xsjs",
          { params: { protein_id: that.proteinId } }
        )
        .then(function (response) {
          that.PlotInformationModel.AccessionId = response.data.AccessionId;
        });
    },
  },
  mounted() {
    this.preInitializeModel();
    if (this.spectrumEntry) {
      this.initializeModel();
    }
  },
};
</script>

<style lang="scss">
.spectrum-wrapper {
  .spectrum-wrapper__spectrum-viewer__card {
    overflow-x: auto;
  }

  .spectrum-wrapper__spectrum-viewer {
    min-width: 900px;
  }
}
</style>