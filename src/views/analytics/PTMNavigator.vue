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
        <v-expansion-panels
          v-if="pathwaygraphApplicationMode==='viewing'"
          v-model="leftExpansionPanel"
          multiple
        >
          <v-expansion-panel>
            <v-expansion-panel-header>
              <h2 class="text-h6">
                Data Selection
              </h2>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <v-col cols="12">
                  <v-card
                    flat
                    class="mb-1"
                  >
                    <v-tabs
                      v-model="dataTabs"
                      class="px-1"
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
                        <v-btn
                          :disabled="selectedExperimentDesigns.length === 0"
                          color="info"
                          class="mr-4"
                          style="text-transform: none"
                          @click="clearPrdbData"
                        >
                          Clear Data
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
                        <v-btn
                          :disabled="selectedUserDatasets.length === 0"
                          color="info"
                          class="mr-4"
                          style="text-transform: none"
                          @click="clearUserData"
                        >
                          Clear Data
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
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <h2 class="text-h6">
                Experiment Filter
              </h2>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row v-if="ptmInputList || fpInputList">
                <v-col cols="12">
                  <v-card flat>
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
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header v-slot="{ open }">
              <div>
                <h2 class="text-h6">
                  Pathway Selection
                </h2>
                <v-fade-transition>
                  <span v-if="!open && !!selectedCanonicalPathway">{{ selectedCanonicalPathway.text }}</span>
                </v-fade-transition>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-card>
                <v-tabs
                  v-model="pathwayViewCanonicalOrCustom"
                  class="px-1"
                  fixed-tabs
                  dark
                  background-color="primary"
                >
                  <v-tab>
                    Canonical Pathways
                  </v-tab>

                  <v-tab>
                    Custom<br>Pathways
                  </v-tab>
                </v-tabs>
                <v-tabs-items v-model="pathwayViewCanonicalOrCustom">
                  <v-tab-item>
                    <v-card
                      flat
                    >
                      <v-card-text>
                        <v-combobox
                          v-model="selectedOrganism"
                          return-object
                          :disabled="!organismList || ptmInputList.length > 0 || fpInputList.length > 0"
                          :items="organismList"
                          label="Organism:"
                          @change="onOrganismSelectionChange"
                        />
                      </v-card-text>
                      <v-card-text>
                        <v-combobox
                          v-model="selectedCanonicalPathway"
                          :disabled="!pathwayListFiltered"
                          clearable
                          :items="pathwayListFiltered"
                          :label="pathwaySelectionLabel"
                          @change="onCanonicalPathwaySelectionChange"
                        />
                      </v-card-text>
                      <v-card-text style="margin-top: -50px; margin-left: 10px">
                        <v-switch
                          v-model="proteinFilterEnabled"
                        >
                          <template #label>
                            <span style="font-size: 10pt">Filter Pathways by Protein List</span>
                          </template>
                        </v-switch>
                        <v-combobox
                          v-show="proteinFilterEnabled"
                          ref="protein-list-filter-combobox"
                          :disabled="!pathwayListFiltered || !existsReferenceProteomeInPrDB"
                          hint="Enter gene names or Uniprot accession numbers to show only the pathways that contain them."
                          prepend-inner-icon="mdi-filter-outline"
                          persistent-hint
                          deletable-chips
                          chips
                          clearable
                          multiple
                          style=" margin-top: -20px; margin-left: 10px; margin-right: 15px"
                          @change="filterPathways"
                        />
                        <v-alert
                          color="blue-grey"
                          text
                          icon="mdi-exclamation"
                          class="mt-4 mr-4 pa-4"
                          prominent
                        >
                          <div
                            v-if="enrichmentResponses['gcr'].length > 0"
                            style="padding-left: 1px"
                          >
                            Pathways are sorted by their Gene-Centric-Redundant Enrichment Score.
                          </div>
                          <div
                            v-else
                            style="padding-left: 1px"
                          >
                            Pathways are not sorted (no enrichment score available or no dataset loaded).
                          </div>
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-tab-item>
                  <v-tab-item class="ma-4">
                    <v-combobox
                      v-model="selectedCustomPathway"
                      :disabled="!customPathwayList"
                      clearable
                      :items="customPathwayList"
                      :label="customPathwaySelectionLabel"
                      @change="onCustomPathwaySelectionChange"
                    />
                  </v-tab-item>
                </v-tabs-items>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <h2 class="text-h6">
                Currently Selected:
              </h2>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <v-col cols="12">
                  <v-card flat>
                    <v-card-text
                      v-if="infoboxContent"
                      style="overflow-x: scroll"
                    >
                      <!-- eslint-disable vue/no-v-html -->
                      <span
                        style="color:black; font-size: 12pt"
                        v-html="infoboxContent"
                      />
                      <!-- eslint-enable vue/no-v-html -->
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
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <template v-else>
          <v-card>
            <v-card-title>
              <div>
                <h2 class="text-h6">
                  Choose a Pathway to Start From:
                </h2>
              </div>
            </v-card-title>
            <v-card>
              <v-tabs
                v-model="pathwayEditTemplateCanonicalOrCustom"
                class="px-1"
                fixed-tabs
                dark
                background-color="primary"
              >
                <v-tab>
                  Canonical Pathways
                </v-tab>

                <v-tab>
                  Custom<br>Pathways
                </v-tab>
              </v-tabs>
              <v-tabs-items v-model="pathwayEditTemplateCanonicalOrCustom">
                <v-tab-item class="ma-4">
                  <v-combobox
                    v-model="selectedOrganism"
                    return-object
                    :disabled="!organismList || ptmInputList.length > 0 || fpInputList.length > 0"
                    :items="organismList"
                    label="Organism:"
                    @change="onOrganismSelectionChange"
                  />
                  <v-combobox
                    v-model="selectedCanonicalPathway"
                    :disabled="!pathwayListFiltered"
                    clearable
                    :items="pathwayListFiltered"
                    :label="pathwaySelectionLabel"
                    @change="onCanonicalPathwaySelectionChange"
                  />
                  <v-switch
                    v-model="proteinFilterEnabled"
                  >
                    <template #label>
                      <span style="font-size: 10pt">Filter Pathways by Protein List</span>
                    </template>
                  </v-switch>
                  <v-combobox
                    v-show="proteinFilterEnabled"
                    ref="protein-list-filter-combobox"
                    :disabled="!pathwayListFiltered || !existsReferenceProteomeInPrDB"
                    hint="Enter gene names or Uniprot accession numbers to show only the pathways that contain them."
                    prepend-inner-icon="mdi-filter-outline"
                    persistent-hint
                    deletable-chips
                    chips
                    clearable
                    multiple
                    style=" margin-top: -20px; margin-left: 10px; margin-right: 15px"
                    @change="filterPathways"
                  />
                </v-tab-item>
                <v-tab-item class="ma-4">
                  <v-combobox
                    v-model="selectedCustomPathway"
                    :disabled="!customPathwayList"
                    clearable
                    :items="customPathwayList"
                    :label="customPathwaySelectionLabel"
                    @change="onCustomPathwaySelectionChange"
                  />
                </v-tab-item>
              </v-tabs-items>
            </v-card>
          </v-card>
          <v-card class="my-2">
            <v-card-title>
              <h2 class="text-h6">
                Save to ProteomicsDB:
              </h2>
            </v-card-title>
            <v-text-field
              v-model="customPathwayName"
              class="pa-4"
              label="Pathway Name"
            />
            <v-btn
              :disabled="!editorContainsUnsavedChanges || !customPathwayName"
              color="info"
              class="ma-4"
              style="text-transform: none"
              @click="saveCustomPathway"
            >
              Save Diagram
            </v-btn>
            <v-btn
              color="warning"
              class="ma-4"
              style="text-transform: none"
              @click="editSaveOrDiscard();editResetDialogReturnVal=null"
            >
              Clear Canvas
            </v-btn>
          </v-card>
        </template>
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
        >
          <v-col
            cols="2"
            align-self="end"
          >
            <v-btn-toggle
              v-model="pathwaygraphApplicationMode"
              mandatory
            >
              <v-tooltip
                bottom
                color="#4d4b4d"
              >
                <template #activator="{ on, attrs }">
                  <v-btn
                    value="viewing"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span class="hidden-sm-and-down">Viewing Mode</span>

                    <v-icon right>
                      mdi-eye
                    </v-icon>
                  </v-btn>
                </template>
                <span>Project your data onto pathways and study the results of enrichment analyses</span>
              </v-tooltip>
              <v-tooltip
                bottom
                color="#4d4b4d"
              >
                <template #activator="{ on, attrs }">
                  <v-btn
                    value="editing"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span class="hidden-sm-and-down">Editing Mode</span>
                    <v-icon right>
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                </template>
                <span>Modify existing pathway diagrams or create your own</span>
              </v-tooltip>
            </v-btn-toggle>
          </v-col>
          <v-spacer />
          <v-col
            v-if="pathwaygraphApplicationMode === 'viewing'"
            cols="1"
            align-self="end"
            class="text-right"
          >
            <downloader
              :disabled="!graphdataSkeleton"
              direction="left"
              svg
              csv
              :loading="downloadPathwayLoading"
              @svg="downloadPathwaySvg()"
              @csv="downloadMappedPeptidesCsv()"
            />
          </v-col>
          <template
            v-else
          >
            <v-col
              cols="1"
              align-self="end"
              class="text-right"
            >
              <v-speed-dial>
                <template #activator>
                  <v-btn
                    color="primary"
                    fab
                    @click="onUploadClick"
                  >
                    <v-icon>
                      mdi mdi-upload
                    </v-icon>
                    <input
                      id="skeleton-file-input"
                      type="file"
                      accept=".json,.JSON"
                      hidden
                      @change="uploadSkeletonJSON"
                    >
                  </v-btn>
                </template>
              </v-speed-dial>
            </v-col>
            <v-col
              cols="1"
              align-self="end"
              class="text-right"
            >
              <downloader
                :disabled="!graphdataSkeleton"
                direction="bottom"
                json
                :loading="downloadPathwayLoading"
                @json="downloadPathwaySkeletonJSON()"
              />
            </v-col>
          </template>
        </v-row>
        <v-row v-if="graphdataSkeleton">
          <v-col
            cols="12"
          >
            <biowc-pathwaygraph
              id="biowc-pathwaygraph"
              class="biowc-pathwaygraph"
              :graph-width.prop="graphWidth"
              :pathway-meta-data.prop="pathwayMetaData"
              :graphdata-skeleton.prop="graphdataSkeleton"
              :ptm-input-list.prop="ptmInputListFiltered"
              :full-proteome-input-list.prop="fpInputListFiltered"
              :application-mode.prop="pathwaygraphApplicationMode"
              :perturbed-nodes.prop="kseaRokaiPerturbedNodes"
              @selectionDetails="onSelectionChanged"
              @selectedNodeTooltip="onInfoboxUpdated"
              @mousedown="pathwayGraphChanged"
              @click="pathwayGraphChanged"
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
                    <li>
                      Make sure to also check out the 'Custom Pathways'!<br>You will find your own pathway diagrams there,<br>
                      as well as the data-driven networks that were auto-generated by PHONEMeS.
                    </li>
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
                    use this Session ID: <b>{{ defaultSessionId }}</b>
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
              v-if="selectedCanonicalPathway"
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
        <template v-if="pathwaygraphApplicationMode==='viewing' && selectedOrganism && selectedOrganism.value === 9606 && isUserDataMode">
          <v-row>
            <v-col
              cols="11"
              style="position:relative"
            >
              <h2
                class="text-h6"
                style="position: absolute; bottom: 0"
              >
                Enrichment Analyses:
              </h2>
            </v-col>
            <v-spacer />
            <v-col
              cols="1"
              align-self="end"
              class="text-right"
            >
              <downloader
                :disabled="ptmInputList.length === 0 && fpInputList.length === 0"
                class="mr-2 mt-4"
                direction="left"
                csv
                :loading="downloadEnrichmentCsvLoading"
                @csv="downloadEnrichmentCSV"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <the-pathway-enrichment-tables
                v-if="ptmInputList.length > 0 || fpInputList.length > 0"
                ref="pathwayEnrichmentTable"
                data-grid-ref-name="pathwayenrichmenttables"
                :data-in="enrichmentResponses"
              />
              <v-card
                v-else
                id="enrichment-placeholder"
                flat
              >
                <v-card-text class=" d-flex justify-center align-center">
                  <v-alert
                    color="blue-grey"
                    text
                    icon="mdi-exclamation"
                    class="mt-8 pa-8"
                    prominent
                  >
                    <div style="padding-left: 8px">
                      After you've uploaded a dataset, ProteomicsDB runs multiple enrichment
                      analysis algorithms on it (e.g. KSEA, PTM-SEA).<br>
                      When you load the dataset into PTMNavigator,
                      the enrichment results will be displayed here.<br>
                      Note that for now, this feature is only implemented for <i>Homo sapiens</i> datasets.<br>
                      If you select multiple datasets, only the enrichments of the first are displayed
                      (for the sake of clarity).
                    </div>
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
        <v-row>
          <v-col cols="12">
            <v-card
              flat
              class="mt-8"
            >
              <v-card-title tag="h3">
                Usage notes:
              </v-card-title>
              <v-card-text v-if="pathwaygraphApplicationMode==='viewing'">
                <ul>
                  <li>Use <code>mousewheel</code> to zoom.</li>
                  <li>
                    Use <code>click + drag</code> on a node to move it around. Use <code>click +
                      drag</code> on the canvas to move the whole graph.
                  </li>
                  <li>
                    Use <code>click</code> on a node to select it. <code>ctrl + click</code> will
                    add to the current selection. Use <code>right-click</code> and select "Clear Selection" to deselect everything.
                  </li>
                  <li>
                    Use <code>click</code> on a summary PTM node (large numbers) to expand it.
                    Use <code>doubleclick</code> on expanded PTM nodes to collapse them again.
                  </li>
                  <li>
                    Use the Download button on the top right to download either the current pathway diagram in SVG format,
                    or a table of the experimental data that was mapped to the current pathway diagram in CSV format.
                  </li>
                  <li>
                    Use <code>right-click</code> to display the context menu with many additional options.
                  </li>
                </ul>
                <br>
                *The resource for the 'Phosphosite Functional Scores' is Supplementary Table 3 from the following publication:<br>
                Ochoa, D. et al.: The functional landscape of the human phosphoproteome. <i>Nature Biotechnology</i> (2020)<br><br>
                The following enrichment analysis algorithms are used:
                <ul>
                  <li>
                    PTM-SEA & PEA Gene-Centric (Redundant):  <a
                      style="color:#666666"
                      target="_blank"
                      href="https://www.mcponline.org/article/S1535-9476(20)31860-0/fulltext"
                    >Krug et al. <i>MCP (2019)</i></a>;
                    <a
                      target="_blank"
                      href="https://github.com/broadinstitute/ssGSEA2.0"
                    >https://github.com/broadinstitute/ssGSEA2.0</a>
                  </li>
                  <li>
                    KSEA:  <a
                      style="color:#666666"
                      target="_blank"
                      href="https://www.science.org/doi/10.1126/scisignal.2003573"
                    >Casado et al. <i>Science Signaling (2013)</i></a>;
                    <a
                      target="_blank"
                      href="https://github.com/saezlab/kinact"
                    >https://github.com/saezlab/kinact</a>
                  </li>
                  <li>
                    RoKAI:  <a
                      style="color:#666666"
                      target="_blank"
                      href="https://www.nature.com/articles/s41467-021-21211-6"
                    >Yılmaz et al. <i>Nature Communications (2021)</i></a>;
                    <a
                      target="_blank"
                      href="https://github.com/serhan-yilmaz/RokaiApp"
                    >https://github.com/serhan-yilmaz/RokaiApp</a>
                  </li>

                  <li>
                    PHONEMeS:  <a
                      style="color:#666666"
                      target="_blank"
                      href="https://pubs.acs.org/doi/full/10.1021/acs.jproteome.0c00958"
                    >Gjerga et al. <i>J. Proteome Res. (2021)</i></a>;
                    <a
                      target="_blank"
                      href="https://github.com/saezlab/PHONEMeS"
                    >https://github.com/saezlab/PHONEMeS</a>
                  </li>

                  <li>
                    Motif Enrichment:  <a
                      style="color:#666666"
                      target="_blank"
                      href="https://www.nature.com/articles/s41586-022-05575-3"
                    >Johnson et al. <i>Nature (2023)</i></a>;
                    <a
                      target="_blank"
                      href="https://kinase-library.phosphosite.org"
                    >https://kinase-library.phosphosite.org</a>
                  </li>

                  <li>
                    KEA3:  <a
                      style="color:#666666"
                      target="_blank"
                      href="https://academic.oup.com/nar/article/49/W1/W304/6279841"
                    >Kuleshov et al. <i>Nucleic Acids Research (2021)</i></a>;
                    <a
                      target="_blank"
                      href="https://maayanlab.cloud/kea3/templates/api.jsp"
                    >https://maayanlab.cloud/kea3/templates/api.jsp</a>
                  </li>

                  <li>
                    KSTAR:  <a
                      style="color:#666666"
                      target="_blank"
                      href="https://www.nature.com/articles/s41467-022-32017-5"
                    >Crowl et al. <i>Nature Communications (2022)</i></a>;
                    <a
                      target="_blank"
                      href="https://github.com/NaegleLab/KSTAR"
                    >https://github.com/NaegleLab/KSTAR</a>
                  </li>
                </ul>
              </v-card-text>
              <v-card-text v-else>
                <ul>
                  <li>You can start drawing from a blank canvas or you can choose one of the existing canonical or custom pathways.</li>
                  <li>If you start from an existing custom diagram, you can always either modify it directly, or use a copy so that the old version is preserved. Make sure to give the diagram a new name so you recognize it later.</li>
                  <li>Use <code>right-click</code> on the canvas to add or delete nodes, edges, and groups.</li>
                  <li>Use <code>right-click</code> on nodes and edges to modify their types and annotations.</li>
                  <li>Same as in Viewing Mode, click and drag nodes to rearrange the diagram and customize your layout.</li>
                  <li>You can also download diagrams to your PC in JSON format as well as upload them for editing and saving. Use the buttons on the top right.</li>
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
    <v-dialog
      v-model="showEditResetConfirmationDialog"
      persistent
      max-width="350"
    >
      <v-card>
        <v-card-title>
          Save changes?
        </v-card-title>
        <v-card-text>You have unsaved changes in the editor. What do you want to do?</v-card-text>
        <v-card-actions class="align-center">
          <v-btn
            :disabled="!editorContainsUnsavedChanges || !customPathwayName"
            color="success"
            class="ma-4"
            style="text-transform: none"
            @click="editResetDialogReturnVal = 'save'"
          >
            Save
          </v-btn>
          <v-btn
            color="warning"
            class="ma-4"
            style="text-transform: none"
            @click="editResetDialogReturnVal = 'discard'"
          >
            Discard
          </v-btn>
          <v-btn
            color="info"
            class="ma-4"
            style="text-transform: none"
            @click="editResetDialogReturnVal = 'cancel'"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="showCustomPathwayEditCopyQuestionDialog"
      persistent
      max-width="350"
    >
      <v-card>
        <v-card-title>
          Work with Copy?
        </v-card-title>
        <v-card-text>Do you want to modify your custom pathway directly or create a copy?</v-card-text>
        <v-card-actions class="align-center">
          <v-btn
            color="success"
            class="ma-4"
            style="text-transform: none"
            @click="editCopyQuestionDialogReturnVal = 'useCopy'"
          >
            Use Copy
          </v-btn>
          <v-btn
            color="warning"
            class="ma-4"
            style="text-transform: none"
            @click="editCopyQuestionDialogReturnVal = 'modify'"
          >
            Modify Directly
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { BiowcPathwaygraph } from '@biowc/pathwaygraph'
import axios from 'axios'
import responsecurve from '@/vue-d3-component-wrappers/ResponseCurve'
import downloader from '@/components/DownloadSpeedDial'
import utils from '@/utils/downloadUtils'
import uploadUtils from '@/plugins/CustomUploadUtils'
import router from '@/router'
import ThePathwayEnrichmentTables from '../../components/partials/pathways/ThePathwayEnrichmentTables'

if (window.customElements.get('biowc-pathwaygraph') === undefined) {
  window.customElements.define('biowc-pathwaygraph', BiowcPathwaygraph)
}

export default {
  name: 'Pathway',
  components: {
    ThePathwayEnrichmentTables,
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
      selectedCanonicalPathway: undefined,
      selectedCurveIDs: [],
      selectedDrugNames: [],
      selectedCurvesFullProteome: false,
      // graphdataSkeleton holds just the information from KEGG/Wikipathway, plus potential FullProteome Information
      graphdataSkeleton: undefined,
      infoboxContent: undefined,
      downloadCurveLoading: false,
      downloadPathwayLoading: false,
      downloadEnrichmentCsvLoading: false,
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
      proteinFilterEnabled: false,
      sessionIDRules: [
        (sessionID) =>
          !!sessionID.match(/^[A-F0-9]{32}$/i) ||
                    'Session ID must have a length of 32 characters and only contain "0-9, A-F".'
      ],
      lineplotCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')],
      refreshColumnWidthKey: 0,
      pathwayMetaData: {},
      ptmInputList: [],
      ptmInputListFiltered: [],
      fpInputList: [],
      fpInputListFiltered: [],
      graphWidth: null,
      ptmNavigatorLogo: require('@/assets/ptmnavigatorlogo.png'),
      leftExpansionPanel: [],
      enrichmentResponses: {
        ptmsea: [],
        gc: [],
        gcr: [],
        ksea: [],
        ksea_rokai: [],
        motif: [],
        kea3: [],
        kstar: []
      },
      pathwaygraphApplicationMode: 'viewing',
      pathwayEditTemplateCanonicalOrCustom: 0,
      pathwayViewCanonicalOrCustom: 0,
      customPathwayList: [],
      selectedCustomPathway: undefined,
      selectedPathway: undefined,
      currentlyEditedPathwayId: undefined,
      showEditResetConfirmationDialog: false,
      editorContainsUnsavedChanges: false,
      customPathwayName: undefined,
      showCustomPathwayEditCopyQuestionDialog: false,
      editResetDialogReturnVal: undefined,
      editCopyQuestionDialogReturnVal: undefined,
      enrichmentTypeMap: {
        'PTM-SEA': 'ptmsea',
        'GC-PEA': 'gc',
        'GCR-PEA': 'gcr',
        KSEA: 'ksea',
        'RoKAI+KSEA': 'ksea_rokai',
        MOTIF: 'motif',
        KEA3: 'kea3',
        KSTAR: 'kstar'
      },
      kseaRokaiPerturbedNodes: { up: [], down: [] },
      defaultSessionId: '0123456789ABCDEF0123456789ABCDEF'

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
      return this.selectedCanonicalPathway.link.startsWith('wikipathways')
        ? `https://www.wikipathways.org/index.php/Pathway:${this.selectedCanonicalPathway.value}`
        : `https://www.kegg.jp/pathway/${this.selectedCanonicalPathway.value}`
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
    customPathwaySelectionLabel () {
      return `Custom Pathways (n=${this.customPathwayList.length}):`
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
            if (this.uuid !== this.defaultSessionId) {
              this.$cookie.set('analyticsUploadSessionID', this.uuid, { expires: d })
            }
            this.userDatasets = response.data.datasets.filter(d => d.omicsType.startsWith('decryptM') || d.omicsType.startsWith('FoldChange'))
            this.selectedUserDatasets = []
            await this.getCustomPathwayList()
          }
        }
      }
    },
    selectedCanonicalPathway: {
      handler (newVal) {
        this.selectedPathway = newVal
        if (newVal) { this.selectedCustomPathway = undefined }
      }
    },
    selectedCustomPathway: {
      handler (newVal) {
        this.selectedPathway = newVal
        if (newVal) { this.selectedCanonicalPathway = undefined }
      }
    },
    pathwaygraphApplicationMode: {
      async handler (newVal) {
        if (newVal === 'editing') {
          if (!this.graphdataSkeleton) {
            // Initialize editor with empty pathway
            this.graphdataSkeleton = { nodes: [], links: [] }
          } else if (this.selectedCustomPathway) {
            await this.useCopyOrModify()
          }
        }
        if (newVal === 'viewing') {
          await this.editSaveOrDiscard()
          if (this.editResetDialogReturnVal === 'cancel') {
            this.pathwaygraphApplicationMode = 'editing'
          } else {
            this.graphdataSkeleton = undefined
            this.selectedCanonicalPathway = undefined
            this.selectedCustomPathway = undefined
          }
          this.editResetDialogReturnVal = null
        }
        const pathwayGraphObject = document.getElementById('biowc-pathwaygraph')
        pathwayGraphObject?.switchApplicationMode(newVal)
      }
    }
  },
  created () {
    window.scrollTo(0, 0)

    // TODO: Check if this is still invoked twice
    this.loadProjects().then(() => {
      this.loadExperimentDesigns()
    })

    this.uuid = this.$cookie.get('analyticsUploadSessionID') || this.defaultSessionId
  },
  async mounted () {
    this.graphWidth = document.querySelector('#spacereservedforgraph').clientWidth - 35
    window.addEventListener('resize', this.onResize)
    await this.loadOrganisms()
    await this.getPathwayList()
    await this.getCustomPathwayList()
    // Expand the accordion on the left side (all tabs except the 'currently selected', bc there is nothing selected initially)
    // This is done by adding the indices of the open items to the array modeling the panel
    // (https://v2.vuetifyjs.com/en/components/expansion-panels/#model)
    this.leftExpansionPanel.push(0, 1, 2)
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
      // Online version
      const organismResponse = await axios.get(
        this.$store.state.host +
                '/proteomicsdb/logic/pathwaycentric/getAllOrganismsWithPathways.xsjs')

      this.organismList = organismResponse.data.map(datum => {
        return { text: datum.name, value: datum.taxcode }
      })
      this.selectedOrganism = this.organismList.filter(org => org.value === 9606)[0]
      this.previouslySelectedOrganism = this.selectedOrganism
    },

    // Online Version
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

    async getCustomPathwayList () {
      // Online Version
      const customPathwayListResponse = await axios.get(this.$store.state.host + '/proteomicsdb/logic/customUserData/getUserCustomPathways.xsjs',
        {
          params: {
            uuid: this.uuid
          }
        })

      this.customPathwayList = customPathwayListResponse.data.map(pw => {
        return {
          text: pw.pathwayName,
          value: pw.pathwayId,
          json: pw.pathwayJSON
        }
      })
      this.selectedCustomPathway = null
      this.onCustomPathwaySelectionChange()
    },

    async getPathwayList () {
      // Online Version
      const pathwayListResponse = await axios.get(this.$store.state.host + '/proteomicsdb/logic/pathwaycentric/getAllPathways.xsjs/',
        {
          params: {
            taxcode: this.selectedOrganism.value
          }
        })

      this.pathwayList = pathwayListResponse.data.map(pw => {
        return {
          text: `${pw.title} (${pw.name})`,
          title: pw.title,
          value: pw.name,
          link: pw.link
        }
      })
      this.pathwayListFiltered = this.pathwayList
    },

    async getGCRSortedPathwayList () {
      await this.getPathwayList()
      const gcrScoresMap = {}

      this.enrichmentResponses.gcr.forEach(entry => {
        // Map each signature to the sum of scores over all loaded datasets
        gcrScoresMap[entry['Signature ID']] =
                  Object.keys(entry).map(k => k.startsWith('Score') ? Math.abs(entry[k]) : 0).reduce((a, b) => a + b, 0)
      })

      this.pathwayList.forEach(pathway => {
        const pathwayPrefix = pathway.value.startsWith('WP') ? 'WP' : 'KEGG'
        const pathwayTitleReformatted = pathway.title
          .toUpperCase()
          .replaceAll(' ', '_')
          .replaceAll('-', '_')
          .replaceAll(':', '_')
          .replaceAll('(', '')
          .replaceAll(')', '')
        pathway.score = gcrScoresMap[
                  `${pathwayPrefix}_${pathwayTitleReformatted}`]
      })

      this.pathwayList.sort((a, b) => {
        if (!a.score) return 1
        if (!b.score) return -1
        return (a.score < b.score) ? 1 : (a.score > b.score) ? -1 : 0
      })

      this.pathwayList.forEach(pw => {
        pw.text += ` ${pw.score > 0 ? `[Score=${pw.score.toFixed(2)}]` : ''}`
      })

      this.pathwayListFiltered = this.pathwayList
    },

    onOrganismSelectionChange (selectedOrganism) {
      if (!selectedOrganism.value) {
        this.selectedOrganism = this.previouslySelectedOrganism
      } else {
        this.previouslySelectedOrganism = this.selectedOrganism
        this.clearPathwayGraph()
        if (!!this.selectedUserDatasets && this.selectedUserDatasets.length > 0 && this.selectedOrganism.value === 9606) { this.getGCRSortedPathwayList() } else { this.getPathwayList() }
      }
    },

    constructPathwaySkeleton: function (pathwaydata) {
      this.graphdataSkeleton = { nodes: null, links: null }
      this.pathwayMetaData = {
        identifier: pathwaydata.pathway.name,
        org: pathwaydata.pathway.org,
        pathwaytitle: pathwaydata.pathway.title
      }

      // Filter out groupnodes that have no members, or only 'null' members
      // Hotfix 2024-04-24: Some groups do not have the component property, we can't filter them here so we will just assume they are not empty.
      pathwaydata.nodes = pathwaydata.nodes
        .filter(node => node.type !== 'group' || !node.components || node.components.some(elem => !!elem))

      // Bring the nodes into the format that the PathwayGraph expects
      this.graphdataSkeleton.nodes = pathwaydata.nodes.map(datum => {
        return {
          nodeId: String(datum.id),
          type: datum.type,
          geneNames: datum.geneNames || null,
          uniprotAccs: datum.uniprotAccs || null,
          x: datum.x,
          y: datum.y,
          label: datum.label,
          defaultName: datum.defaultName,
          groupId: datum.groupId,
          details: {
            Uniprot: [...new Set(datum.uniprotAccs)].filter(Boolean).map(
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
        const allNodeAndLinkIds = new Set([...pathwaydata.nodes.map(n => n.id), ...pathwaydata.links.map(n => n.id)])
        pathwaydata.links = pathwaydata.links.filter(
          link => {
            const keepLink = allNodeAndLinkIds.has(link.sourceId) && allNodeAndLinkIds.has(link.targetId)
            if (!keepLink) hasLinksChanged = true
            return keepLink
          })
      }
      // Bring the links into the format that the PathwayGraph expects
      this.graphdataSkeleton.links = pathwaydata.links.map(datum => {
        return {
          linkId: datum.id,
          sourceId: String(datum.sourceId),
          targetId: String(datum.targetId),
          types: datum.types,
          label: datum.label
        }
      })
    },
    pathwayGraphChanged: function () {
      if (this.pathwaygraphApplicationMode === 'editing') {
        this.editorContainsUnsavedChanges = true
      }
    },

    onCustomPathwaySelectionChange: async function () {
      if (this.pathwaygraphApplicationMode === 'viewing') {
        this.graphdataSkeleton = undefined
        this.selectedCurveIDs = []
        if (!this.isUserDataMode) {
          this.selectedDrugNames = []
        }
        if (this.selectedCustomPathway && this.selectedCustomPathway.json) {
          this.customPathwayName = this.selectedCustomPathway.text
          this.constructPathwaySkeleton(JSON.parse(this.selectedCustomPathway.json))
        }
      } else if (this.pathwaygraphApplicationMode === 'editing') {
        await this.editSaveOrDiscard()
        if (this.editResetDialogReturnVal === 'cancel') {
          this.selectedCustomPathway = undefined
          return
        }
        this.editResetDialogReturnVal = null
        this.graphdataSkeleton = undefined

        if (!!this.selectedCustomPathway && !!this.selectedCustomPathway.value) {
          await this.useCopyOrModify()
        }
      }
    },

    onCanonicalPathwaySelectionChange: async function () {
      this.currentlyEditedPathwayId = undefined
      if (this.pathwaygraphApplicationMode === 'editing') {
        await this.editSaveOrDiscard()
        if (this.editResetDialogReturnVal === 'cancel') {
          this.selectedCanonicalPathway = undefined
          this.currentlyEditedPathwayId = undefined
          return
        }
        this.editResetDialogReturnVal = null
      }
      this.graphdataSkeleton = undefined

      if (!this.selectedCanonicalPathway || !this.selectedCanonicalPathway.value) {
        return
      }
      this.selectedCurveIDs = []
      if (!this.isUserDataMode) {
        this.selectedDrugNames = []
      }

      // Online Version
      axios.get(`${this.$store.state.host}/proteomicsdb/logic/pathwaycentric/pathway_skeletons/json/${this.selectedOrganism.value}/` +
                this.selectedCanonicalPathway.link).then((resp) => this.constructPathwaySkeleton(resp.data))

      // If we have data loaded already, collapse the pathway menu now (index 2 in the panel)
      if (this.ptmInputList.length + this.fpInputList.length > 0) {
        this.leftExpansionPanel = this.leftExpansionPanel.filter(val => val !== 2)
      }
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
        intermediateSequence = intermediateSequence.replace(/\([a-z.0-9]+\)/, '')
        modIndex = intermediateSequence.indexOf('(')
      }
      return res.map(isoformRes => isoformRes.join(' & '))
    },

    determineFoldChange (datum) {
      // Determine fold change - it can be written in multiple ways
      const foldChange = datum.DETAILS['Fold change']?.toFixed(2) || datum.DETAILS['Fold Change']?.toFixed(2) || datum.DETAILS.foldchange?.toFixed(2)
      const logFoldChange = datum.DETAILS['log Fold change']?.toFixed(2) || datum.DETAILS['Log Fold Change']?.toFixed(2) || datum.DETAILS.logfoldchange?.toFixed(2)

      return [foldChange, logFoldChange]
    },

    createPtmInputFromPeptideDatum (datum) {
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

      const [foldChange, logFoldChange] = this.determineFoldChange(datum)
      const geneNames = [...new Set(datum.GENE_NAMES?.split(';'))]
      const pspLinks = this.createPSPLinks(modifiedResiduesFiltered, uniprotAccsFiltered)
      return {
        geneNames,
        uniprotAccs: uniprotAccsFiltered,
        // Regulation must be 'up'/'down'/'not' - sometimes 'not' comes as '-'
        regulation: (!datum.REGULATION || datum.REGULATION === '-') ? 'not' : datum.REGULATION,
        details: {
          'Modified Sequence': datum.MOD_SEQUENCE,
          'Gene Name(s)': geneNames.join(', '),
          Uniprot: uniprotAccsFiltered.map(
            id => {
              return `<a href="${this.createUniProtLink(
                              id
                          )}" target="_blank">${id}</a>`
            })
            .join(', '),
          'PhosphoSitePlus®': '    ',
          'Site(s)': {
            display: !!pspLinks,
            indentKey: true,
            text: pspLinks
          },
          'Upstream Kinase(s)': { display: !!datum.UPSTREAM_KINASES, indentKey: true, text: datum.UPSTREAM_KINASES || undefined },
          Function: {
            display: !!datum.ON_FUNCTIONS,
            indentKey: true,
            text: datum.ON_FUNCTIONS ? datum.ON_FUNCTIONS.replaceAll('|', ', ') : undefined
          },
          Process: {
            display: !!datum.ON_PROCESSES,
            indentKey: true,
            text: datum.ON_PROCESSES ? datum.ON_PROCESSES.replaceAll('|', ', ') : undefined
          },
          Notes: {
            display: !!datum.NOTESS,
            indentKey: true,
            text: datum.NOTESS ? datum.NOTESS.replaceAll('|', ', ') : undefined
          },
          'Functional Score*': datum.FUNCTIONAL_SCORES ? datum.FUNCTIONAL_SCORES.replaceAll('|', ', ') : undefined,
          'Curve ID': { display: false, text: datum.CURVE_ID },
          Site: { display: false, text: modifiedResiduesFiltered.join(',') },
          Uniprot_Accession_Number: { display: false, text: uniprotAccsFiltered.join(',') },
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
              'Curve',
              'Genes',
              'genes'].some(colnameprefix => {
              return datumKey.startsWith(colnameprefix)
            })
          }))
        }
      }
    },

    createPtmInputFromSiteDatum (datum) {
      const [foldChange, logFoldChange] = this.determineFoldChange(datum)
      const geneNames = [...new Set(datum.GENE_NAMES?.split(';'))]
      const pspLinks = this.createPSPLinks([datum.DETAILS['p-site']], [datum.UNIPROT_ACC_ID])
      return {
        geneNames,
        uniprotAccs: datum.UNIPROT_ACC_ID,
        // Regulation must be 'up'/'down'/'not' - sometimes 'not' comes as '-'
        regulation: (!datum.REGULATION || datum.REGULATION === '-') ? 'not' : datum.REGULATION,
        details: {
          Site: datum.MOD_RSD,
          'Gene Name(s)': geneNames.join(', '),
          Uniprot: `<a href="${this.createUniProtLink(
                      datum.UNIPROT_ACC_ID
                  )}" target="_blank">${datum.UNIPROT_ACC_ID}</a>`,
          'PhosphoSitePlus®': '    ',
          'Site(s)': {
            display: !!pspLinks,
            indentKey: true,
            text: pspLinks
          },
          'Upstream Kinase(s)': { display: !!datum.UPSTREAM_KINASES, indentKey: true, text: datum.UPSTREAM_KINASES || undefined },
          Function: {
            display: !!datum.ON_FUNCTIONS,
            indentKey: true,
            text: datum.ON_FUNCTIONS ? datum.ON_FUNCTIONS.replaceAll('|', ', ') : undefined
          },
          Process: {
            display: !!datum.ON_PROCESSES,
            indentKey: true,
            text: datum.ON_PROCESSES ? datum.ON_PROCESSES.replaceAll('|', ', ') : undefined
          },
          Notes: {
            display: !!datum.NOTESS,
            indentKey: true,
            text: datum.NOTESS ? datum.NOTESS.replaceAll('|', ', ') : undefined
          },
          'Functional Score*': datum.FUNCTIONAL_SCORES ? datum.FUNCTIONAL_SCORES.replaceAll('|', ', ') : undefined,
          'Curve ID': { display: false, text: datum.CURVE_ID },
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
    },

    loadUserData: async function () {
      this.ptmInputList = []
      this.enrichmentResponses = {
        ptmsea: [],
        gc: [],
        gcr: [],
        ksea: [],
        ksea_rokai: [],
        motif: [],
        kea3: [],
        kstar: []
      }
      this.userDataLoading = true
      this.dataLoadingSnackbar = true

      const userProteomicsDataResponse = await
      axios.get(this.$store.state.host + '/proteomicsdb/logic/customUserData/getUserProteomicsData.xsjs/',
        { params: { sessionId: this.uuid, userDatasetIds: this.selectedUserDatasets.map(dataset => dataset.datasetId).join(';') } })
      this.ptmInputList = (userProteomicsDataResponse.data.peptideData.map(this.createPtmInputFromPeptideDatum))
        .concat(userProteomicsDataResponse.data.siteData.map(this.createPtmInputFromSiteDatum))

      // Load enrichment results from the server
      const userEnrichmentResponse = await
      axios.get(this.$store.state.host + '/proteomicsdb/logic/customUserData/getUserDatasetEnrichmentResults.xsjs',
        { params: { sessionId: this.uuid, datasetId: this.selectedUserDatasets[0].datasetId } })

      userEnrichmentResponse.data.forEach(enrichment => {
        try {
          // Since version 0.1.1, the enrichment server returns the output wrapped in 'Result' in order to also send metadata
          // For legacy reasons we still support the old format
          const result = JSON.parse(JSON.parse(enrichment.enrichmentJSON)).Result || JSON.parse(JSON.parse(enrichment.enrichmentJSON))
          this.enrichmentResponses[this.enrichmentTypeMap[enrichment.enrichmentType]] = result
        } catch (e) {
          this.enrichmentResponses[this.enrichmentTypeMap[enrichment.enrichmentType]] = []
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

      await this.getGCRSortedPathwayList()

      // Hand perturbed kinases over to the biowc-pathwaygraph component
      this.kseaRokaiPerturbedNodes = { up: [], down: [] }
      // Obtain the summed scores for each gene
      this.enrichmentResponses.ksea_rokai.map(entry => {
        return {
          Gene: entry.Gene,
          Score: Object.keys(entry).filter(key => key.startsWith('Score')).reduce((res, key) => res + entry[key], 0)
        }
        // Filter for those where the absolute score surpasses a threshold - for now, 0.5
      }).forEach(entry => {
        if (Math.abs(entry.Score) > 0.5) {
          if (entry.Score > 0) { this.kseaRokaiPerturbedNodes.up.push(entry.Gene) } else { this.kseaRokaiPerturbedNodes.down.push(entry.Gene) }
        }
      })
      // kseaRokaiPerturbedNodes is passed as a property to biowc-pathwaygraph, so it will know about this.

      this.doneSnackbar = true

      this.dataLoadingSnackbar = false
      this.userDataLoading = false
      this.clearPathwayGraph()
      this.renewSession()
      this.selectAllExperiments()

      // Collapse the dataset and experiment menus (indices 0 and 1)
      this.leftExpansionPanel = this.leftExpansionPanel.filter(val => ![0, 1].includes(val))
      // Expand the pathway selection menu (index 2)
      this.leftExpansionPanel.push(2)
    },
    clearPathwayGraph: function () {
      this.graphdataSkeleton = undefined
      this.selectedCanonicalPathway = null
      this.selectedCustomPathway = null
      this.selectedCurveIDs = []
      if (!this.isUserDataMode) {
        this.selectedDrugNames = []
      }
      if (this.$refs['protein-list-filter-combobox']) { this.$refs['protein-list-filter-combobox'].reset() }
    },
    clearUserData () {
      this.selectedCurveIDs = []
      this.ptmInputList = []
      this.ptmInputListFiltered = []
      this.fpInputList = []
      this.fpInputListFiltered = []
      this.selectedUserDatasets = []
      this.getPathwayList()
    },
    clearPrdbData () {
      this.selectedCurveIDs = []
      this.ptmInputList = []
      this.ptmInputListFiltered = []
      this.fpInputList = []
      this.fpInputListFiltered = []
      this.selectedDrugNames = []
      this.selectedExperimentDesigns = []
      this.getPathwayList()
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
        const pspLinks = this.createPSPLinks(modifiedResiduesFiltered, uniprotAccsFiltered)
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
            'PhosphoSitePlus®': '    ',
            'Site(s)': {
              display: !!pspLinks,
              indentKey: true,
              text: pspLinks
            },
            'Upstream Kinase(s)': { display: !!datum.UPSTREAM_KINASES, indentKey: true, text: datum.UPSTREAM_KINASES || undefined },
            Function: {
              display: !!datum.ON_FUNCTIONS,
              indentKey: true,
              text: datum.ON_FUNCTIONS ? datum.ON_FUNCTIONS.replaceAll('|', ', ') : undefined
            },
            Process: {
              display: !!datum.ON_PROCESSES,
              indentKey: true,
              text: datum.ON_PROCESSES ? datum.ON_PROCESSES.replaceAll('|', ', ') : undefined
            },
            Notes: {
              display: !!datum.NOTESS,
              indentKey: true,
              text: datum.NOTESS ? datum.NOTESS.replaceAll('|', ', ') : undefined
            },
            'Functional Score*': datum.FUNCTIONAL_SCORES ? datum.FUNCTIONAL_SCORES.replaceAll('|', ', ') : undefined,
            'Curve ID': { display: false, text: datum.CURVE_ID },
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
      // Set organism to Homo sapiens - all the data that you can load as of now is Homo sapiens
      this.selectedOrganism = this.organismList.filter(org => org.value === 9606)[0]

      await this.getPathwayList()
      this.doneSnackbar = true
      this.dataLoadingSnackbar = false
      this.prdbDataLoading = false
      this.clearPathwayGraph()
      this.selectAllExperiments()

      // Collapse the dataset and experiment menus (indices 0 and 1)
      this.leftExpansionPanel = this.leftExpansionPanel.filter(val => ![0, 1].includes(val))
    },
    async saveCustomPathway () {
      const exportedSkeleton = document.getElementById('biowc-pathwaygraph').exportSkeleton()

      // If the user does not have a session ID yet, create it
      if (!this.$cookie.get('analyticsUploadSessionID')) {
        const sessionIdResponse = await axios.get(
          this.$store.state.host +
                '/proteomicsdb/logic/secure/checkSessionId.xsjs'
        )
        this.uuid = sessionIdResponse.data.uuid
      }

      const response = await axios
        .put(this.$store.state.host + '/proteomicsdb/logic/secure/storeCustomPathway.xsjs', exportedSkeleton,
          {
            params: {
              uuid: this.uuid,
              pathwayName: this.customPathwayName,
              customPathwayId: this.currentlyEditedPathwayId
            },
            headers: { 'X-CSRF-Token': 'unsafe', 'Content-Type': 'application/json' }
          })

      this.currentlyEditedPathwayId = response.data

      await this.getCustomPathwayList()

      this.editorContainsUnsavedChanges = false
    },

    async editSaveOrDiscard () {
      if (this.editorContainsUnsavedChanges) {
        this.showEditResetConfirmationDialog = true
        await new Promise(resolve => {
          this.$watch('editResetDialogReturnVal', (val) => {
            this.showEditResetConfirmationDialog = false
            switch (val) {
              case 'save':
                this.saveCustomPathway()
                this.editorContainsUnsavedChanges = false
                break
              case 'discard':
                this.graphdataSkeleton = { nodes: [], links: [] }
                this.editorContainsUnsavedChanges = false
                this.customPathwayName = undefined
                break
              case 'cancel':
                break
              default:
                break
            }
            resolve()
          })
        })
      } else {
        this.graphdataSkeleton = { nodes: [], links: [] }
        this.customPathwayName = undefined
      }
    },

    async useCopyOrModify () {
      this.showCustomPathwayEditCopyQuestionDialog = true
      await new Promise(resolve => {
        this.$watch('editCopyQuestionDialogReturnVal', (val) => {
          this.showCustomPathwayEditCopyQuestionDialog = false
          switch (val) {
            case 'useCopy':
              this.customPathwayName = `${this.selectedCustomPathway.text} (COPY)`
              this.currentlyEditedPathwayId = undefined
              break
            case 'modify':
              this.customPathwayName = this.selectedCustomPathway.text
              this.currentlyEditedPathwayId = this.selectedCustomPathway.value
              break
            default:
              break
          }
          this.selectedCurveIDs = []
          if (!this.isUserDataMode) {
            this.selectedDrugNames = []
          }
          this.constructPathwaySkeleton(JSON.parse(this.selectedCustomPathway.json))
          // Reset value so watcher can be triggered again next time
          this.editCopyQuestionDialogReturnVal = undefined
          resolve()
        })
      })
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
    onInfoboxUpdated: function (newInfoboxContent) {
      this.infoboxContent = newInfoboxContent.detail
      // Expand the box if there is content, collapse it if there isn't
      // The box is index 3 in the panel
      if (this.infoboxContent) {
        this.leftExpansionPanel.push(3)
      } else {
        this.leftExpansionPanel = this.leftExpansionPanel.filter(val => val !== 3)
      }
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
    downloadPathwaySkeletonJSON: function () {
      const exportedSkeleton = document.getElementById('biowc-pathwaygraph').exportSkeleton()
      const blob = new Blob([exportedSkeleton], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.download = 'pathway_diagram.json'
      a.href = url
      a.click()
    },
    downloadPathwaySvg: function () {
      this.downloadPathwayLoading = true
      document.getElementById('biowc-pathwaygraph').downloadSvg()
      this.downloadPathwayLoading = false
    },
    downloadMappedPeptidesCsv: function () {
      this.downloadPathwayLoading = true
      document.getElementById('biowc-pathwaygraph').downloadPeptidesCSV()
      this.downloadPathwayLoading = false
    },

    downloadEnrichmentCSV: function () {
      this.downloadEnrichmentCsvLoading = true
      this.$refs.pathwayEnrichmentTable.onExporting()
      this.downloadEnrichmentCsvLoading = false
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

      // Filter for selected experiments
      // TODO: Filter for experimental design id instead of text, but this requires backend work.
      if (this.isUserDataMode) {
        this.ptmInputListFiltered = this.ptmInputList.filter(datum => this.userExperimentFilter.includes(datum.details['Experiment Name']))
        this.fpInputListFiltered = this.fpInputList.filter(datum => this.userExperimentFilter.includes(datum.details['Experiment Name']))
      } else {
        this.selectedDrugNames = []
        this.ptmInputListFiltered = this.ptmInputList.filter(datum => this.prdbExperimentDesignFilter.map(d => d.text).includes(datum.details['Experiment Design']))
        this.fpInputListFiltered = this.fpInputList.filter(datum => this.prdbExperimentDesignFilter.map(d => d.text).includes(datum.details['Experiment Design']))
      }
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
    },
    onUploadClick () {
      document.getElementById('skeleton-file-input').click()
    },
    async uploadSkeletonJSON (e) {
      const file = e.target.files[0]
      if (file.size > 1048576) {
        alert('Input JSON file is too big (>1MB)!')
        return
      }
      const blob = new Blob([file], { type: 'text/plain' })
      const fileContent = await blob.text()
      this.constructPathwaySkeleton(JSON.parse(fileContent))
      this.customPathwayName = 'Custom Pathway from User Upload'
      this.editorContainsUnsavedChanges = true
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

.v-expansion-panel-header {
    padding: 1em;
}

.v-expansion-panel-content>>> .v-expansion-panel-content__wrap {
    padding: 0;
}

li {
    margin: 10px 0;
}
</style>
