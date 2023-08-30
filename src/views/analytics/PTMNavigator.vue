<template>
  <v-container
    class="grey lighten-3 pa-4"
    fluid
  >
    <v-row>
      <v-col
        ref="leftColumn"
        sm="12"
        md="12"
        lg="3"
      >
        <v-row>
          <v-col cols="12">
            <v-img
              :src="ptmNavigatorLogo"
              max-width="600"
              class="mx-2 my-4"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card
              flat
              class="mb-1"
            >
              <v-tabs
                v-model="dataTabs"
                fixed-tabs
                dark
                background-color="primary"
              >
                <v-tab>
                  ProteomicsDB Data
                </v-tab>
                <v-tab>
                  User Data
                </v-tab>
              </v-tabs>
              <v-tabs-items v-model="dataTabs">
                <v-tab-item class="ma-4">
                  <h3>Project Selection</h3>
                  <v-combobox
                    v-if="projects"
                    v-model="selectedProject"
                    :items="projects"
                    label="Project:"
                    @change="
                      loadExperimentDesigns();
                      selectedExperimentDesigns=[];"
                  />
                  <h3>Experiment Selection</h3>
                  <h5 v-if="experimentDesigns" />
                  <v-autocomplete
                    v-model="selectedExperimentDesigns"
                    return-object
                    :items="experimentDesigns"
                    label="Experiments"
                    clearable
                    multiple
                    deletable-chips
                  />
                  <v-btn
                    :disabled="selectedExperimentDesigns.length === 0"
                    color="success"
                    class="mr-4"
                    style="text-transform: none"
                    :loading="prdbDataLoading"
                    @click="loadPrdbData"
                  >
                    Load Dataset(s)
                  </v-btn>
                </v-tab-item>
                <v-tab-item class="ma-4">
                  <v-text-field
                    v-model="uuid"
                    label="Session ID"
                    :counter="32"
                    :rules="sessionIDRules"
                  />
                  <v-autocomplete
                    v-model="selectedUserDatasets"
                    return-object
                    :items="userDatasets"
                    item-text="datasetName"
                    item-value="datasetId"
                    label="Uploaded Datasets"
                    clearable
                    multiple
                    chips
                    deletable-chips
                    @change="selectedDatasetChangedAfterLoad = true"
                  />
                  <v-btn
                    :disabled="selectedUserDatasets.length === 0"
                    color="success"
                    class="mr-4"
                    style="text-transform: none"
                    :loading="userDataLoading"
                    @click="loadUserData"
                  >
                    Load Dataset(s)
                  </v-btn>
                </v-tab-item>
              </v-tabs-items>
            </v-card>
            <v-snackbar
              v-model="dataLoadingSnackbar"
              color="primary"
              timeout="-1"
            >
              Retrieving Data{{ isUserDataMode ? ' and Sorting Pathways by Relevance...' : '...' }}
            </v-snackbar>
            <v-snackbar
              v-model="doneSnackbar"
              color="success"
              timeout="3000"
              :max-width="10"
            >
              Done!
              <template #action="{ attrs }">
                <v-btn
                  color="white"
                  text
                  v-bind="attrs"
                  @click="doneSnackbar = false"
                >
                  Close
                </v-btn>
              </template>
            </v-snackbar>
            <v-snackbar
              v-model="pathwaySortingFailedSnackbar"
              timeout="2000"
              :max-width="10"
            >
              Sorting by relevance returned an empty list. Displaying all pathways in alphabetical order
              instead.
              <template #action="{ attrs }">
                <v-btn
                  color="white"
                  text
                  v-bind="attrs"
                  @click="pathwaySortingFailedSnackbar = false"
                >
                  Close
                </v-btn>
              </template>
            </v-snackbar>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card
              flat
            >
              <v-card-title>Pathway Selection</v-card-title>
              <v-card-text>
                <v-combobox
                  v-model="selectedOrganism"
                  return-object
                  :disabled="!organismList"
                  :items="organismList"
                  label="Organism:"
                  @change="onOrganismSelectionChange"
                />
              </v-card-text>

              <v-card-text>
                <v-combobox
                  v-model="selectedPathway"
                  :disabled="!pathwayListFiltered"
                  clearable
                  :items="pathwayListFiltered"
                  :label="pathwaySelectionLabel"
                  @change="onPathwaySelectionChange"
                />
              </v-card-text>
              <v-card-text>
                <v-combobox
                  ref="protein-list-filter-combobox"
                  :disabled="!pathwayListFiltered || !existsReferenceProteomeInPrDB"
                  label="Filter by Protein List"
                  hint="Enter gene names or Uniprot accession numbers to show only the pathways that contain them."
                  prepend-inner-icon="mdi-filter-outline"
                  persistent-hint
                  deletable-chips
                  chips
                  clearable
                  multiple
                  @change="filterPathways"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="ptmInputList || fpInputList">
          <v-col cols="12">
            <v-card flat>
              <v-card-title>
                Experiment Filter
              </v-card-title>
              <v-card-text>
                <v-autocomplete
                  v-if="isUserDataMode"
                  v-model="userExperimentFilter"
                  chips
                  deletable-chips
                  :items="allExperimentNames"
                  clearable
                  multiple
                  @change="filterInputData"
                />
                <v-autocomplete
                  v-else
                  v-model="prdbExperimentDesignFilter"
                  return-object
                  chips
                  deletable-chips
                  :items="selectedExperimentDesigns"
                  clearable
                  multiple
                  @change="filterInputData"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card flat>
              <v-card-title>Currently Selected:</v-card-title>
              <v-card-text
                v-if="infoboxContent"
                style="overflow-x: scroll"
              >
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span
                  style="color:black; font-size: 12pt"
                  v-html="infoboxContent"
                />
              </v-card-text>
              <v-card-text v-else>
                <v-alert
                  color="blue-grey"
                  text
                >
                  If you select a single node in the graph, detailed information on it will pop up
                  here.
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <div v-if="areSomeSelectedDatasetsDecryptM">
          <v-row>
            <v-spacer />
            <downloader
              class="mr-2 mt-4"
              direction="left"
              svg
              png
              :loading="downloadCurveLoading"
              @svg="downloadCurvesPlot('svg')"
              @png="downloadCurvesPlot('png')"
            />
          </v-row>
          <v-row>
            <v-col
              cols="12"
            >
              <v-card
                flat
              >
                <v-card-title>Dose-Response Curves:</v-card-title>
                <v-card-text>
                  <responsecurve
                    ref="responseCurve"
                    :min-height="500"
                    :min-width="400"
                    :project-id="selectedProject ? selectedProject.value : -1"
                    :model-ids="selectedCurveIDs"
                    :drug-names="selectedDrugNames"
                    :legend-at-bottom="true"
                    :is-user-curve="isUserDataMode"
                    :is-full-proteome="selectedCurvesFullProteome"
                    :container-width="responseCurveContainerWidth"
                    data-type="ptmCurves"
                    :is-time-dependent="areAllSelectedDatasetsTimeDependent"
                    :exponential-x="!areAllSelectedDatasetsTimeDependent"
                    parent-perspective="pathway"
                    style="overflow: visible"
                    @mouseover-event="onMouseOverCurve"
                    @click-event="onClickCurve"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col
        id="spacereservedforgraph"
        sm="12"
        md="12"
        lg="9"
      >
        <v-row
          dense
          justify="end"
        >
          <v-col
            sm="12"
            md="6"
            lg="3"
            align-self="end"
          >
            <v-card
              class="mx-2"
              flat
            >
              <h4 class="ml-1 px-2 pt-2">
                Filter Data:
              </h4>
              <v-card-actions>
                <div>
                  <v-checkbox
                    v-model="showNotregulated"
                    class="mx-2 px-2 mb-n5"
                    label="Show Unregulated"
                    color="#a4a4a4"
                    @change="filterInputData"
                  />

                  <v-checkbox
                    v-model="showUpregulated"
                    class="mx-2 px-2 mb-n5"
                    label="Show Upgoing"
                    color="#ea0000"
                    @change="filterInputData"
                  />
                  <v-checkbox
                    v-model="showDownregulated"
                    class="mx-2 px-2 mb-n2"
                    label="Show Downgoing"
                    color="#2571ff"
                    @change="filterInputData"
                  />
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col
            sm="12"
            md="7"
            lg="3"
            align-self="end"
          >
            <v-card
              class="mx-2"
              flat
            >
              <h4 class="ml-1 px-2 pt-2">
                Color Nodes by...
              </h4>
              <v-card-actions>
                <v-row class="mx-2">
                  <v-radio-group
                    v-model="ptmNodeHue"
                    class="mx-2 px-2"
                    column
                  >
                    <v-radio
                      class="mt-2"
                      label="Direction"
                      value="direction"
                    />
                    <v-radio
                      class="mt-2"
                      label="Fold Change"
                      value="foldchange"
                    />
                    <v-radio
                      v-if="areSomeSelectedDatasetsDecryptM"
                      class="mt-2"
                      label="Potency"
                      value="potency"
                    />
                  </v-radio-group>
                </v-row>
              </v-card-actions>
              <v-row>
                <v-spacer />
                <v-col>
                  <div
                    v-if="ptmNodeHue==='potency' && ptmInputListFiltered.length>0 && !!graphdataSkeleton"
                    class="pa-1"
                    style="background-color: #e6e6e6;width: 250px"
                  >
                    <v-subheader class="mb-2">
                      Color range:
                    </v-subheader>
                    <v-card-text style="display: flex; justify-content: space-between;">
                      <v-text-field
                        v-model="colorRangeLowerValue"
                        type="number"
                        class="mt-0 pt-0"
                        hide-details
                        single-line
                        style="max-width: 80px"
                        @change="onColorRangeChange()"
                      />
                      to
                      <v-text-field
                        v-model="colorRangeUpperValue"
                        type="number"
                        class="mt-0 pt-0"
                        hide-details
                        single-line
                        style="max-width: 80px"
                        @change="onColorRangeChange()"
                      />
                    </v-card-text>
                  </div>
                </v-col>
                <v-spacer />
              </v-row>
            </v-card>
          </v-col>
          <v-col
            sm="12"
            md="6"
            lg="4"
            xl="3"
            align-self="end"
          >
            <v-card
              class="mx-2"
              flat
            >
              <h4 class="ml-1 px-2 pt-2 mb-1">
                Graph Controls:
              </h4>
              <v-card-actions>
                <v-row class="mx-2 pb-2">
                  <v-col cols="12">
                    <v-btn
                      :disabled="!graphdataSkeleton"
                      style="text-transform: none"
                      @click="onSelectDownstreamClick"
                    >
                      Select Downstream Subgraph
                    </v-btn>
                  </v-col>
                  <v-col cols="12">
                    <v-btn
                      :disabled="!(ptmInputListFiltered.length>0) || !graphdataSkeleton"
                      style="text-transform: none"
                      @click="onExpandAllClick"
                    >
                      Expand All PTM Nodes
                    </v-btn>
                  </v-col>
                  <v-col cols="12">
                    <v-btn
                      :disabled="!(ptmInputListFiltered.length>0) || !graphdataSkeleton"
                      style="text-transform: none"
                      @click="onCollapseAllClick"
                    >
                      Collapse All PTM Nodes
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col
            cols="1"
            align-self="end"
            class="text-right"
          >
            <downloader
              :disabled="!graphdataSkeleton"
              direction="left"
              svg
              :loading="downloadPathwayLoading"
              @svg="downloadPathwaySvg()"
            />
          </v-col>
        </v-row>
        <v-row v-if="graphdataSkeleton">
          <v-col
            cols="12"
          >
            <biowc-pathwaygraph
              id="biowc-pathwaygraph"
              class="biowc-pathwaygraph"
              :graph-width.prop="graphWidth"
              :tooltip-vertical-offset.prop="-100"
              :tooltip-horizontal-offset.prop="0"
              :pathway-meta-data.prop="pathwayMetaData"
              :graphdata-skeleton.prop="graphdataSkeleton"
              :ptm-input-list.prop="ptmInputListFiltered"
              :full-proteome-input-list.prop="fpInputListFiltered"
              :hue.prop="ptmNodeHue"
              @selectionDetails="onSelectionChanged"
              @selectedNodeTooltip="onInfoboxUpdated"
              @initializeColorRange="onInitializeColorRange"
            />
          </v-col>
        </v-row>
        <v-row
          v-else
        >
          <v-col cols="12">
            <v-card
              id="graph-placeholder"
              flat
              class="graph-placeholder"
            >
              <v-card-text class=" d-flex justify-center align-center">
                <v-alert
                  color="blue-grey"
                  text
                  icon="mdi-exclamation"
                  class="mt-8 pa-8"
                  prominent
                >
                  <ol style="margin-bottom: 1em">
                    <li>Paste your Session ID into the top field on the left.</li>
                    <li>Select one or several of your datasets, then click 'Load Dataset(s)'.</li>
                    <li>Choose from the list of organisms and pathways to start exploring.</li>
                    <li>Scroll to the bottom of this page to see usage notes for the pathway graph.</li>
                  </ol>
                  <div style="padding-left: 8px; margin-bottom: 1em">
                    You haven't uploaded any data yet? Click <a
                      style="display: inline; cursor: pointer"
                      @click="redirectToCustomDataUpload"
                    >
                      here</a>!<br>
                  </div>
                  <div style="padding-left: 8px; margin-bottom: 1em">
                    It's also possible to browse through PTM datasets from ProteomicsDB<br>by clicking on "PROTEOMICSDB DATA" at the top left.<br>
                  </div>
                  <div style="padding-left: 8px; margin-bottom: 1em">
                    To check out the data used in the PTMNavigator manuscript,<br>
                    use this Session ID: <b>0123456789ABCDEF0123456789ABCDEF</b>
                  </div>
                  <div style="padding-left: 8px; margin-bottom: 1em">
                    <b>If you want to use PTMNavigator in your work:</b> We are still preparing our manuscript and will put a reference here in a few weeks.
                  </div>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col
            cols="12"
            align-self="end"
          >
            <v-btn
              v-if="selectedPathway"
              class="ml-2 mr-3"
              style="text-transform: none"
              :href="canonicalPathwayLink"
              target="_blank"
            >
              Original Pathway: <span
                class="ml-1"
                style="cursor: pointer; color: blue; text-decoration: underline"
              >{{ canonicalPathwayLink }}</span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card
              flat
              class="mt-8"
            >
              <v-card-title tag="h3">
                Usage notes:
              </v-card-title>
              <v-card-text>
                <ul>
                  <li>Use <code>mousewheel</code> to zoom.</li>
                  <li>
                    Use <code>click + drag</code> on a node to move it around. Use <code>click +
                      drag</code> on the canvas to move the whole graph.
                  </li>
                  <li>
                    Use <code>click</code> on a node to select it. <code>ctrl + click</code> will
                    add to the current selection. <code>click</code> the canvas to clear the
                    selection.
                  </li>
                  <li>
                    Use <code>doubleclick</code> on a summary PTM node (large numbers) to expand it.
                    Use <code>doubleclick</code> on expanded PTM nodes to collapse them again.
                  </li>
                  <li>
                    Use <code>right-click</code> on a gene/compound node to select alternative names
                    for it, if available.
                  </li>
                  <li>
                    Click the <code>Select Downstream</code> button to select the subgraph of all
                    nodes
                    that are downstream of the current selection.
                  </li>
                  <li>
                    Click the <code>Expand All</code> button to show all individual PTM nodes and
                    hide all
                    summary PTM nodes.
                  </li>
                  <li>
                    Click the <code>Collapse All</code> button to show all summary PTM nodes and
                    hide all
                    individual PTM nodes.
                  </li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <canvas
      id="canvasId"
      style="display: none"
    />
  </v-container>
</template>

<script>
import { BiowcPathwaygraph } from 'biowc-pathwaygraph'
import axios from 'axios'
import responsecurve from '@/vue-d3-component-wrappers/ResponseCurve'
import downloader from '@/components/DownloadSpeedDial'
import utils from '@/utils/downloadUtils'
import uploadUtils from '@/plugins/CustomUploadUtils'
import router from '@/router'

if (window.customElements.get('biowc-pathwaygraph') === undefined) {
  window.customElements.define('biowc-pathwaygraph', BiowcPathwaygraph)
}

export default {
  name: 'Pathway',
  components: {
    responsecurve,
    downloader
  },
  data () {
    return {
      projects: undefined,
      organismList: undefined,
      pathwayList: undefined,
      pathwayListFiltered: undefined,
      experimentDesigns: undefined,
      selectedProject: undefined,
      selectedExperimentDesigns: [],
      experimentDesignFilter: [],
      selectedOrganism: undefined,
      previouslySelectedOrganism: undefined,
      selectedPathway: undefined,
      previouslySelectedPathway: undefined,
      selectedCurveIDs: [],
      selectedDrugNames: [],
      selectedCurvesFullProteome: false,
      // graphdataSkeleton holds just the information from KEGG/Wikipathway, plus potential FullProteome Information
      graphdataSkeleton: undefined,
      infoboxContent: undefined,
      downloadCurveLoading: false,
      downloadPathwayLoading: false,
      dataTabs: 1, // Initially show userDataMode
      uuid: '',
      selectedUserDatasets: [],
      userDatasets: [],
      userExperimentFilter: [],
      prdbExperimentDesignFilter: [],
      userDataLoading: false,
      prdbDataLoading: false,
      dataLoadingSnackbar: false,
      doneSnackbar: false,
      pathwaySortingFailedSnackbar: false,
      sessionIDRules: [
        (sessionID) =>
          !!sessionID.match(/^[A-F0-9]{32}$/i) ||
                    'Session ID must have a length of 32 characters and only contain "0-9, A-F".'
      ],
      selectedDatasetChangedAfterLoad: true,
      lineplotCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')],
      refreshColumnWidthKey: 0,
      pathwayMetaData: {},
      ptmInputList: [],
      ptmInputListFiltered: [],
      fpInputList: [],
      fpInputListFiltered: [],
      graphWidth: null,
      showNotregulated: true,
      showUpregulated: true,
      showDownregulated: true,
      ptmNodeHue: 'direction',
      ptmNavigatorLogo: require('@/assets/ptmnavigatorlogo.png'),
      colorRangeLowerValue: 0,
      colorRangeUpperValue: 24,
      colorRangeMin: 0,
      colorRangeMax: 24
    }
  },
  computed: {
    responseCurveContainerWidth: function () {
      // Sorry eslint, I need this because the clientWidth is not reactive by itself
      // eslint-disable-next-line no-unused-expressions
      this.refreshColumnWidthKey
      return this.$refs.leftColumn.clientWidth
    },
    isUserDataMode: function () {
      // this.tabs is 0 if we are in 'internal data' mode, and 1 if we are in 'user data mode'
      return this.dataTabs === 1
    },
    areAllSelectedDatasetsTimeDependent () {
      return this.isUserDataMode && this.selectedUserDatasets.every(dataset => dataset.omicsType.startsWith('decryptM_td'))
    },
    areSomeSelectedDatasetsDecryptM () {
      return !this.isUserDataMode || (this.selectedUserDatasets.length > 0 && this.selectedUserDatasets.some(ds => ds.omicsType && ds.omicsType.startsWith('decryptM')))
    },
    canonicalPathwayLink () {
      return this.selectedPathway.link.startsWith('wikipathways')
        ? `https://www.wikipathways.org/index.php/Pathway:${this.selectedPathway.value}`
        : `https://www.kegg.jp/pathway/${this.selectedPathway.value}`
    },
    allExperimentNames () {
      return [...new Set(this.ptmInputList.map(datum => datum.details['Experiment Name']).concat(this.fpInputList.map(datum => datum.details['Experiment Name'])))]
    },
    pathwaySelectionLabel () {
      let res = 'Pathways'
      if (this.pathwayList) {
        res += ' (n='
        if (this.pathwayListFiltered.length < this.pathwayList.length) {
          res += `${this.pathwayListFiltered.length} of `
        }
        res += `${this.pathwayList.length})`
      }
      res += ':'
      return res
    },

    existsReferenceProteomeInPrDB () {
      return !this.selectedOrganism || [3702, 9606, 10090].includes(this.selectedOrganism.value)
    }
  },
  watch: {
    uuid: {
      immediate: true,
      async handler (newVal, oldVal) {
        if (newVal && newVal !== oldVal && newVal.length === 32) {
          const response = await axios.get(
            this.$store.state.host +
                        '/proteomicsdb/logic/secure/checkSessionId.xsjs',
            { params: { uuid: newVal } }
          )
          if (response.data.cookieStatus === 0) {
            const d = new Date()
            d.setTime(d.getTime() + 14 * 24 * 60 * 60 * 1000)
            // Only set the cookie if it is not the one for the default dataset
            if (this.uuid !== '0123456789ABCDEF0123456789ABCDEF') {
              this.$cookie.set('analyticsUploadSessionID', this.uuid, { expires: d })
            }
            this.userDatasets = response.data.datasets.filter(d => d.omicsType.startsWith('decryptM') || d.omicsType.startsWith('FoldChange'))
            this.selectedUserDatasets = []
          }
        }
      }
    },
    ptmNodeHue () {
      // Set to 'direction' if removal of potency option set it to undefined
      if (!this.ptmNodeHue) { this.ptmNodeHue = 'direction' }
    }
  },
  created () {
    window.scrollTo(0, 0)

    // TODO: Check if this is still invoked twice
    this.loadProjects().then(() => {
      this.loadExperimentDesigns()
    })
    this.uuid = this.$cookie.get('analyticsUploadSessionID') || '0123456789ABCDEF0123456789ABCDEF'
  },
  async mounted () {
    this.graphWidth = document.querySelector('#spacereservedforgraph').clientWidth - 35
    window.addEventListener('resize', this.onResize)

    await this.loadOrganisms()
    await this.getPathwayListWithoutEnrichment()
  },
  destroyed () {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize () {
      this.graphWidth = document.querySelector('#spacereservedforgraph').clientWidth - 35

      if (this.$refs.responseCurve) {
        // Sorry, this is a bit ugly. What actually happens here is that the responseCurve must be redrawn with the new width.
        // But the computed responseCurveContainerWidth does not update on its own because it depends on a non-reactive DOM component.
        // The following dummy variable appears in the computed, forcing it to update.
        // See here: https://stackoverflow.com/questions/48700142/vue-js-force-computed-properties-to-recompute
        this.refreshColumnWidthKey++
      }
    },

    async loadOrganisms () {
      const organismResponse = await axios.get(
        this.$store.state.host +
                '/proteomicsdb/logic/pathwaycentric/getAllOrganismsWithPathways.xsjs')
      this.organismList = organismResponse.data.map(datum => {
        return { text: datum.name, value: datum.taxcode }
      })
      this.selectedOrganism = this.organismList.filter(org => org.value === 9606)[0]
      this.previouslySelectedOrganism = this.selectedOrganism
    },
    loadProjects: function () {
      return axios
        .get(
          this.$store.state.host +
                    '/proteomicsdb/logic/ptmCurves/getProjects.xsjs'
        )
        .then((resp) => {
          this.projects = resp.data.map((obj) => {
            return {
              text: obj.projectName,
              value: obj.projectId
            }
          })
          this.selectedProject = this.projects[0]
        })
    },
    async loadExperimentDesigns () {
      if (this.selectedProject) {
        const resp = await axios.get(
          this.$store.state.host +
                    '/proteomicsdb/logic/ptmCurves/getAllExperiments.xsjs',
          {
            params: { projectId: this.selectedProject.value }
          }
        )

        this.experimentDesigns = resp.data.map(obj => {
          return {
            text: obj.experimentDesignName,
            value: obj.experimentDesignId
          }
        })
      }
    },
    async getPathwayListWithEnrichment () {
      const enrichedPathwayListResponse = await axios.get(this.$store.state.host + '/proteomicsdb/logic/pathwaycentric/getPathwaysSortedByGProfilerEnrichmentScore.xsjs/',
        {
          params: {
            userDatasetIds: this.selectedUserDatasets.map(dataset => dataset.datasetId).join(';'),
            taxcode: this.selectedOrganism.value
          }
        })
      this.pathwayList = enrichedPathwayListResponse.data.map(pw => {
        return {
          text: `${pw.title} (${pw.name}) ${pw.score > 0 ? `[Score=${pw.score.toFixed(2)}]` : ''}`,
          value: pw.name,
          link: pw.link
        }
      })
      this.pathwayListFiltered = this.pathwayList
    },

    async getPathwayListWithoutEnrichment () {
      const pathwayListResponse = await axios.get(this.$store.state.host + '/proteomicsdb/logic/pathwaycentric/getAllPathways.xsjs/',
        {
          params: {
            taxcode: this.selectedOrganism.value
          }
        })
      this.pathwayList = pathwayListResponse.data.map(pw => {
        return {
          text: `${pw.title} (${pw.name})`,
          value: pw.name,
          link: pw.link
        }
      })
      this.pathwayListFiltered = this.pathwayList
    },

    onOrganismSelectionChange (selectedOrganism) {
      if (!selectedOrganism.value) {
        this.selectedOrganism = this.previouslySelectedOrganism
      } else {
        this.previouslySelectedOrganism = this.selectedOrganism
        this.clearPathwayGraph()
        if (!!this.selectedUserDatasets && this.selectedUserDatasets.length > 0) { this.getPathwayListWithEnrichment() } else { this.getPathwayListWithoutEnrichment() }
      }
    },

    onPathwaySelectionChange: function (selectedPathway) {
      if (!selectedPathway || !selectedPathway.value) {
        this.selectedPathway = this.previouslySelectedPathway
        return
      } else {
        this.previouslySelectedPathway = this.selectedPathway
      }

      this.graphdataSkeleton = undefined
      this.selectedCurveIDs = []
      if (!this.isUserDataMode) {
        this.selectedDrugNames = []
      }

      axios.get(`${this.$store.state.host}/proteomicsdb/logic/pathwaycentric/pathway_skeletons/json/${this.selectedOrganism.value}/` +
                selectedPathway.link).then((resp) => {
        this.graphdataSkeleton = { nodes: null, links: null }
        this.pathwayMetaData = {
          identifier: resp.data.pathway.name,
          org: resp.data.pathway.org,
          pathwaytitle: resp.data.pathway.title
        }

        // Filter out groupnodes that have no members, or only 'null' members
        resp.data.nodes = resp.data.nodes
          .filter(node => node.type !== 'group' || node.components.some(elem => !!elem))

        // Bring the nodes into the format that the PathwayGraph expects
        this.graphdataSkeleton.nodes = resp.data.nodes.map(datum => {
          return {
            nodeId: datum.id,
            type: datum.type,
            geneNames: datum.geneNames || null,
            uniprotAccs: datum.uniprotAccs || null,
            x: datum.x,
            y: datum.y,
            label: datum.label,
            defaultName: datum.defaultName,
            groupId: datum.groupId,
            details: {
              Uniprot: [...new Set(datum.uniprotAccs)].map(
                id => {
                  return `<a href="${this.createUniProtLink(
                                        id
                                    )}" target="_blank">${id}</a>`
                })
                .join(', ')
            }
          }
        })

        // Some links have sources or targets that are neither nodes nor links, but other miscellaneous objects
        // We need to filter those out to avoid errors
        // Problem is, if we filter out a link that was the source/target of another link, we might miss it.
        // So we need to repeat this process until there is no change
        let hasLinksChanged = true
        while (hasLinksChanged) {
          hasLinksChanged = false
          const allNodeAndLinkIds = new Set([...resp.data.nodes.map(n => n.id), ...resp.data.links.map(n => n.id)])
          resp.data.links = resp.data.links.filter(
            link => {
              const keepLink = allNodeAndLinkIds.has(link.sourceId) && allNodeAndLinkIds.has(link.targetId)
              if (!keepLink) hasLinksChanged = true
              return keepLink
            })
        }

        // Bring the links into the format that the PathwayGraph expects
        this.graphdataSkeleton.links = resp.data.links.map(datum => {
          return {
            linkId: datum.id,
            sourceId: datum.sourceId,
            targetId: datum.targetId,
            types: datum.types,
            label: datum.label
          }
        })
      })
    },

    createUniProtLink (accId) {
      return accId.includes('-')
        ? `https://www.uniprot.org/uniprot/${accId.split('-')[0]}#${accId}`
        : `https://www.uniprot.org/uniprot/${accId}`
    },

    createPSPLinks (modResidues, accessionIds) {
      if (!modResidues || !accessionIds || modResidues.length === 0 || accessionIds.length === 0) return undefined
      const resList = []
      for (let i = 0; i < modResidues.length; i += 1) {
        const linkString = `<a href="http://www.phosphosite.org/uniprotAccAction?id=${accessionIds[i]}" target="_blank">${modResidues[i]}</a>`
        if (!resList.includes(linkString)) resList.push(linkString)
      }
      return resList.join(', ')
    },

    getModifiedResidues (modifiedSequence, startPositions) {
      if (!modifiedSequence) return null
      const startPositionsList = startPositions.split(';')
      // Go through the sequence and get the positions of modifications (relative to the peptide)
      let intermediateSequence = modifiedSequence
      const res = Array.from({ length: startPositionsList.length }, () => [])
      let modIndex = intermediateSequence.indexOf('(')
      while (modIndex !== -1) {
        if (modIndex > 0) {
          const residue = intermediateSequence[modIndex - 1]
          const absolutePositions = startPositionsList.map(pos => Number(pos) + Number(modIndex))
          absolutePositions.forEach((pos, i) => res[i].push(`${residue}${pos}`))
        }
        intermediateSequence = intermediateSequence.replace(/\([a-z]+\)/, '')
        modIndex = intermediateSequence.indexOf('(')
      }
      return res.map(isoformRes => isoformRes.join('&'))
    },

    loadUserData: async function () {
      this.ptmInputList = []
      this.userDataLoading = true
      this.dataLoadingSnackbar = true

      const userProteomicsDataResponse = await
      axios.get(this.$store.state.host + '/proteomicsdb/logic/customUserData/getUserProteomicsData.xsjs/',
        { params: { userDatasetIds: this.selectedUserDatasets.map(dataset => dataset.datasetId).join(';') } })
      this.ptmInputList = userProteomicsDataResponse.data.peptideData.map(datum => {
        // Filter out isoforms, unless there is an isoform-specific peptide
        const uniprotAccs = datum.UNIPROT_ACCS?.split(';')
        const modifiedResidues = this.getModifiedResidues(datum.MOD_SEQUENCE, datum.START_POSITIONS)
        const uniprotAccsFiltered = []
        const modifiedResiduesFiltered = []
        for (let i = 0; i < uniprotAccs.length; i++) {
          // Add all IDs that do not include a hyphen
          // If they do include a hyphen, only add them if their canonical isoform is not in the list
          if (!uniprotAccs[i].includes('-') || !uniprotAccs.includes(uniprotAccs[i].split('-')[0])) {
            uniprotAccsFiltered.push(uniprotAccs[i])
            if (modifiedResidues) {
              modifiedResiduesFiltered.push(modifiedResidues[i])
            }
          }
        }

        // Determine fold change - it can be written in multiple ways
        const foldChange = datum.DETAILS['Fold change']?.toFixed(2) || datum.DETAILS['Fold Change']?.toFixed(2) || datum.DETAILS.foldchange?.toFixed(2)
        const logFoldChange = datum.DETAILS['log Fold change']?.toFixed(2) || datum.DETAILS['Log Fold Change']?.toFixed(2) || datum.DETAILS.logfoldchange?.toFixed(2)

        return {
          geneNames: [...new Set(datum.GENE_NAMES?.split(';'))],
          uniprotAccs: uniprotAccsFiltered,
          // Regulation must be 'up'/'down'/'not' - sometimes 'not' comes as '-'
          regulation: (!datum.REGULATION || datum.REGULATION === '-') ? 'not' : datum.REGULATION,
          details: {
            'Modified Sequence': datum.MOD_SEQUENCE,
            Uniprot: uniprotAccsFiltered.map(
              id => {
                return `<a href="${this.createUniProtLink(
                                    id
                                )}" target="_blank">${id}</a>`
              })
              .join(', '),
            'PhosphoSitePlus®': this.createPSPLinks(modifiedResiduesFiltered, uniprotAccsFiltered),
            'Upstream Kinases': datum.UPSTREAM_KINASES || undefined,
            'Curve ID': { display: false, value: datum.CURVE_ID },
            'Experiment Name': datum.EXPERIMENT_NAME,
            '-log(EC50)': datum.DETAILS.pEC50?.toFixed(2),
            'Fold Change': foldChange,
            'Log Fold Change': logFoldChange,
            R2: (!!datum.DETAILS.R2 && typeof datum.DETAILS.R2 === 'number') ? datum.DETAILS.R2.toFixed(2) : datum.DETAILS.R2,
            'Curve p-value': datum.DETAILS['Curve P_Value Corrected']?.toPrecision(4) || undefined,
            // All remaining values of datum.DETAILS are passed through as is
            ...Object.fromEntries(Object.entries(datum.DETAILS).filter(([datumKey]) => {
              return !['Gene names',
                'Proteins',
                'Protein IDs',
                'Experiment',
                'experiment',
                'fold',
                'Fold',
                'Log Fold',
                'log Fold',
                'R2',
                'pEC50',
                'EC50',
                'curve',
                'Curve'].some(colnameprefix => {
                return datumKey.startsWith(colnameprefix)
              })
            }))
          }
        }
      })

      this.fpInputList = userProteomicsDataResponse.data.fullProteomeData.map(datum => {
        return {
          geneNames: [...new Set(datum.GENE_NAMES?.split(/,|;/))],
          uniprotAccs: [...new Set(datum.UNIPROT_ACCS?.split(/,|;/))],
          regulation: datum.REGULATION === '-' ? 'not' : datum.REGULATION,
          details: {
            Uniprot: [...new Set(datum.UNIPROT_ACCS?.split(';'))].map(
              id => {
                return `<a href="${this.createUniProtLink(
                                    id
                                )}" target="_blank">${id}</a>`
              })
              .join(', '),
            'Curve ID': datum.CURVE_ID,
            'Experiment Name': datum.EXPERIMENT_NAME,
            '-log(EC50)': datum.DETAILS.pEC50?.toFixed(2),
            'Fold Change': datum.DETAILS['Fold change']?.toFixed(2) || datum.DETAILS['Fold Change']?.toFixed(2),
            R2: datum.DETAILS.R2?.toFixed(2),
            // All remaining values of datum.DETAILS are passed through as is
            ...Object.fromEntries(Object.entries(datum.DETAILS).filter(([datumKey]) => {
              return !['Gene names',
                'Proteins',
                'Protein IDs',
                'Experiment',
                'experiment',
                'fold',
                'Fold',
                'R2',
                'pEC50',
                'EC50',
                'curve',
                'Curve'].some(colnameprefix => {
                return datumKey.startsWith(colnameprefix)
              })
            }))
          }
        }
      })

      // Set the organism to the organism of the first loaded dataset (we'll assume that they are all the same)
      // Fallback to homo sapiens (9606) if there is none for some reason
      const organismOfFirstDataset = userProteomicsDataResponse.data.datasetInfo[0].TAXCODE || 9606
      this.selectedOrganism = this.organismList.filter(org => org.value === organismOfFirstDataset)[0]

      await this.getPathwayListWithEnrichment()

      this.doneSnackbar = true

      this.dataLoadingSnackbar = false
      this.userDataLoading = false
      // TODO: This variable has no function anymore?
      this.selectedDatasetChangedAfterLoad = false
      this.clearPathwayGraph()
      this.renewSession()
      this.selectAllExperiments()
    },
    clearPathwayGraph: function () {
      this.graphdataSkeleton = undefined
      this.selectedPathway = null
      this.selectedCurveIDs = []
      if (!this.isUserDataMode) {
        this.selectedDrugNames = []
      }
      if (this.$refs['protein-list-filter-combobox']) { this.$refs['protein-list-filter-combobox'].reset() }
    },
    async loadPrdbData () {
      this.ptmInputList = []
      this.prdbDataLoading = true
      this.dataLoadingSnackbar = true

      const [prdbPTMDataResponse, prdbFPDataResponse] = await Promise.all([
        axios.get(this.$store.state.host + '/proteomicsdb/logic/experimentcentric/getDDPTMExperiment.xsjs/',
          { params: { experimentdesignids: this.selectedExperimentDesigns.map(d => d.value).join(';') } }),
        axios.get(this.$store.state.host + '/proteomicsdb/logic/experimentcentric/getDDFPExperiment.xsjs/',
          { params: { experimentdesignids: this.selectedExperimentDesigns.map(d => d.value).join(';') } })
      ])

      this.ptmInputList = prdbPTMDataResponse.data.map(datum => {
        // Filter out isoforms, unless there is an isoform-specific peptide
        const uniprotAccs = datum.UNIPROT_ACCS?.split(';')
        const modifiedResidues = this.getModifiedResidues(datum.MOD_SEQUENCE, datum.START_POSITIONS)
        const uniprotAccsFiltered = []
        const modifiedResiduesFiltered = []
        for (let i = 0; i < uniprotAccs.length; i++) {
          // Add all IDs that do not include a hyphen
          // If they do include a hyphen, only add them if their canonical isoform is not in the list
          if (!uniprotAccs[i].includes('-') || !uniprotAccs.includes(uniprotAccs[i].split('-')[0])) {
            uniprotAccsFiltered.push(uniprotAccs[i])
            if (modifiedResidues) {
              modifiedResiduesFiltered.push(modifiedResidues[i])
            }
          }
        }

        return {
          geneNames: [...new Set(datum.GENE_NAMES?.split(';'))],
          uniprotAccs: uniprotAccsFiltered,
          // Regulation must be 'up'/'down'/'not' - sometimes 'not' comes as '-'
          regulation: (!datum.REGULATION || datum.REGULATION === '-') ? 'not' : datum.REGULATION,
          details: {
            'Modified Sequence': datum.MOD_SEQUENCE,
            Uniprot: uniprotAccsFiltered.map(
              id => {
                return `<a href="${this.createUniProtLink(
                                    id
                                )}" target="_blank">${id}</a>`
              })
              .join(', '),
            'PhosphoSitePlus®': this.createPSPLinks(modifiedResiduesFiltered, uniprotAccsFiltered),
            'Upstream Kinases': datum.UPSTREAM_KINASES || undefined,
            'Curve ID': { display: false, value: datum.CURVE_ID },
            'Experiment Name': datum.EXPERIMENT_NAME,
            'Drug Name': datum.DRUG_NAME,
            'Experiment Design': datum.EXPERIMENT_DESIGN_NAME,
            '-log(EC50)': datum.LOG_IC50?.toFixed(2),
            'Fold Change': datum.FOLD_CHANGE?.toFixed(2),
            R2: datum.R2?.toFixed(2)
          }
        }
      })

      this.fpInputList = prdbFPDataResponse.data.map(datum => {
        return {
          geneNames: [...new Set(datum.GENE_NAMES?.split(';'))],
          uniprotAccs: [...new Set(datum.UNIPROT_ACCS?.split(';'))],
          regulation: datum.REGULATION === '-' ? 'not' : datum.REGULATION,
          details: {
            Uniprot: [...new Set(datum.UNIPROT_ACCS?.split(';'))].map(
              id => {
                return `<a href="${this.createUniProtLink(
                                    id
                                )}" target="_blank">${id}</a>`
              })
              .join(', '),
            'Curve ID': datum.CURVE_ID,
            'Experiment Name': datum.EXPERIMENT_NAME,
            'Experiment Design': datum.EXPERIMENT_DESIGN_NAME,
            'Drug Name': datum.DRUG_NAME,
            '-log(EC50)': datum.LOG_IC50?.toFixed(2),
            'Fold Change': datum.FOLD_CHANGE?.toFixed(2),
            R2: datum.R2?.toFixed(2)
          }
        }
      })

      await this.getPathwayListWithoutEnrichment()
      this.doneSnackbar = true
      this.dataLoadingSnackbar = false
      this.prdbDataLoading = false
      this.clearPathwayGraph()
      this.selectAllExperiments()
    },
    onSelectionChanged: function (newSelection) {
      this.selectedCurvesFullProteome = newSelection.detail.isFullProteome
      // If there are curves, display them
      // If the selection contains full proteome data, 'Curve ID' might be a string of comma-separated values
      // So split preventively and flatten into a level one array
      this.selectedCurveIDs = newSelection.detail.selection.flatMap(sel => sel['Curve ID'] ? String(sel['Curve ID']).split(',') : undefined).filter(curveid => !!curveid)
      // For PrDB data, we also need a drug name to show the curves (because of a possible combination treatment)
      if (!this.isUserDataMode) {
        this.selectedDrugNames = newSelection.detail.selection.flatMap(sel => sel['Drug Name'] ? String(sel['Drug Name']).split(',') : undefined).filter(drugname => !!drugname)
      }
    },

    onInitializeColorRange: function (payload) {
      [this.colorRangeLowerValue, this.colorRangeUpperValue] = payload.detail
    },

    onSelectDownstreamClick: function () {
      document.getElementById('biowc-pathwaygraph').selectNodesDownstreamOfSelection()
    },

    onExpandAllClick: function () {
      document.getElementById('biowc-pathwaygraph').expandAllPTMNodes()
    },
    onCollapseAllClick: function () {
      document.getElementById('biowc-pathwaygraph').collapseAllPTMNodes()
    },
    onColorRangeChange: function () {
      this.colorRangeLowerValue = Math.max(this.colorRangeLowerValue, this.colorRangeMin)
      this.colorRangeUpperValue = Math.min(this.colorRangeUpperValue, this.colorRangeMax)
      document.getElementById('biowc-pathwaygraph').setColorRange([this.colorRangeLowerValue, this.colorRangeUpperValue])
    },

    onInfoboxUpdated: function (newInfoboxContent) {
      this.infoboxContent = newInfoboxContent.detail
    },

    onMouseOverCurve: function (curveId) {
      // console.log(`Mouse over curve: ${curveId}`)
    },

    onClickCurve: function (curveId) {
      // console.log(`Curve clicked: ${curveId}`)
    },
    downloadCurvesPlot: function (filetype) {
      this.downloadCurveLoading = true
      const aPlots = []
      aPlots.push(this.$refs.responseCurve.getSVG())

      if (aPlots) {
        utils.downloadSVGs(
          aPlots,
          'curves',
          filetype === 'svg',
          'canvasId',
          this.lineplotCss
        )
      }
      this.downloadCurveLoading = false
    },
    downloadPathwaySvg: function () {
      this.downloadPathwayLoading = true
      document.getElementById('biowc-pathwaygraph').downloadSvg()
      this.downloadPathwayLoading = false
    },
    renewSession () {
      uploadUtils.renewSession(this.$store.state.host, this.uuid)
    },
    selectAllExperiments () {
      if (this.isUserDataMode) {
        this.userExperimentFilter = this.allExperimentNames
      } else {
        this.prdbExperimentDesignFilter = this.selectedExperimentDesigns
      }
      this.filterInputData()
    },
    filterInputData () {
      this.selectedCurveIDs = []

      // 1. Filter for selected experiments
      // TODO: Filter for experimental design id instead of text, but this requires backend work.
      if (this.isUserDataMode) {
        this.ptmInputListFiltered = this.ptmInputList.filter(datum => this.userExperimentFilter.includes(datum.details['Experiment Name']))
        this.fpInputListFiltered = this.fpInputList.filter(datum => this.userExperimentFilter.includes(datum.details['Experiment Name']))
      } else {
        this.selectedDrugNames = []
        this.ptmInputListFiltered = this.ptmInputList.filter(datum => this.prdbExperimentDesignFilter.map(d => d.text).includes(datum.details['Experiment Design']))
        this.fpInputListFiltered = this.fpInputList.filter(datum => this.prdbExperimentDesignFilter.map(d => d.text).includes(datum.details['Experiment Design']))
      }

      // 2. Filter for selected regulation classes
      this.ptmInputListFiltered = this.ptmInputListFiltered.filter(datum => {
        return (this.showUpregulated && datum.regulation === 'up') ||
                    (this.showDownregulated && datum.regulation === 'down') ||
                    (this.showNotregulated && datum.regulation === 'not')
      })

      this.fpInputListFiltered = this.fpInputListFiltered.filter(datum => {
        return (this.showUpregulated && datum.regulation === 'up') ||
                    (this.showDownregulated && datum.regulation === 'down') ||
                    (this.showNotregulated && datum.regulation === 'not')
      })
    },
    async filterPathways (searchStringArray) {
      if (searchStringArray.length > 0) {
        const filteredPathwayIds = await axios.get(
          this.$store.state.host +
                    '/proteomicsdb/logic/pathwaycentric/getPathwaysByProteinSearchString.xsjs/',
          {
            params: {
              searchStrings: searchStringArray.join(';'),
              taxcode: this.selectedOrganism.value
            }
          })
        this.pathwayListFiltered = this.pathwayList.filter(pathway => filteredPathwayIds.data.includes(pathway.value))
      } else {
        this.pathwayListFiltered = this.pathwayList
      }
    },
    redirectToCustomDataUpload () {
      router.push({ name: 'analyticsCustomDataUpload' })
    }
  }
}
</script>

<style scoped>

.graph-placeholder {
    /*TODO: These 1200px are the same as the min-height in the pathwaygraph, one could refactor that.*/
    height: 1200px;
}

::v-deep .pathway-explorer-switch .v-label {
    font-size: 10pt;
}

li {
    margin: 10px 0;
}
</style>
