<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card elevation="0">
          <v-card-title>Data Upload</v-card-title>
          <v-card-subtitle>Maximal file size is 200MB. If you have larger files, please split them up.</v-card-subtitle>
          <v-tabs
            v-model="activeTab"
            fixed-tabs
            dark
            background-color="primary"
          >
            <v-tab key="expressionTab">
              Expression Data
            </v-tab>
            <v-tab key="peptideTab">
              Peptide Data
            </v-tab>
            <v-tab key="fullProteomeTab">
              Full Proteome Data
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="activeTab">
            <v-tab-item key="expressionTabItem">
              <v-card elevation="0">
                <v-card-title>Proteomics or Transcriptomics Expression Data Upload</v-card-title>
                <v-card-text>
                  <v-form
                    ref="expressionDataForm"
                    v-model="expressionDatasetFormValid"
                    lazy-validation
                  >
                    <!-- dataset related stuff -->
                    <v-text-field
                      v-model="datasetName"
                      :counter="50"
                      :rules="datasetNameRules"
                      label="Name your dataset"
                      outlined
                      required
                    />

                    <v-select
                      v-model="omicsType"
                      :items="omicsTypes"
                      :rules="omicsTypeRules"
                      label="Select your Omics type"
                      outlined
                      required
                    />

                    <!-- File related stuff -->
                    <v-file-input
                      v-model="expressionCsvFile"
                      accept="text/csv"
                      label="Select your file"
                      outlined
                      :rules="fileUploadRules"
                    />
                  </v-form>
                </v-card-text>
                <v-card-title>Normalize Your Data</v-card-title>
                <v-card-text>
                  <v-checkbox
                    v-model="mComBatActive"
                    :disabled="true"
                    label="Apply MComBat Normalization (coming soon)"
                    @click="onMComBatClick"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    :disabled="
                      !expressionDatasetFormValid || (progress >= 0 && progress < 100)
                    "
                    color="success"
                    class="mr-4"
                    @click="validate('expressionDataForm')"
                  >
                    Upload File
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-tab-item>
            <v-tab-item key="peptideTabItem">
              <v-card elevation="0">
                <v-card-title>Peptide Data Upload</v-card-title>
                <v-card-text>
                  <v-form
                    ref="peptideDataForm"
                    v-model="peptideDatasetFormValid"
                    lazy-validation
                  >
                    <!-- dataset related stuff -->
                    <v-text-field
                      v-model="datasetName"
                      :counter="50"
                      :rules="datasetNameRules"
                      label="Name your dataset"
                      outlined
                      required
                    />

                    <v-select
                      v-model="selectedOrganism"
                      :items="organismList"
                      item-text="text"
                      label="Select Organism"
                      outlined
                      required
                      return-object
                    />

                    <v-select
                      v-model="peptideDatasetType"
                      :items="peptideOrFullProteomeDatasetTypes"
                      item-text="text"
                      :rules="peptideOrFullProteomeDatasetTypeRules"
                      label="Select your Dataset type"
                      outlined
                      required
                      return-object
                    />

                    <!-- File related stuff -->
                    <v-radio-group
                      v-model="csvFileSeparator"
                      row
                      mandatory
                      class="mb-n6"
                    >
                      <v-radio value="tab">
                        <template #label>
                          <span style="font-size: 14px">Tab Separated Values</span>
                        </template>
                      </v-radio>
                      <v-radio value="comma">
                        <template #label>
                          <span style="font-size: 14px">Comma Separated Values</span>
                        </template>
                      </v-radio>
                    </v-radio-group>
                    <v-file-input
                      v-model="peptideCsvFile"
                      class="ma-2"
                      accept="text/csv,.txt,.tsv"
                      label="Select .csv/.txt file (containing fold changes or curve data)"
                      outlined
                      :rules="fileUploadRules"
                    />
                    <v-file-input
                      v-if="peptideDatasetType.needsToml"
                      v-model="peptideTomlFile"
                      class="ma-2"
                      accept=".toml"
                      label="Select .toml file"
                      outlined
                      :rules="fileUploadRules"
                    />
                    <v-switch
                      v-if="peptideDatasetType.needsToml"
                      v-model="hasFoldChangeColumn"
                      style="font-size: 8pt"
                    >
                      <template #label>
                        <span style="font-size: 14px">Curve File contains 'Fold Change' column.<br>(Otherwise, the intensity ratio between the highest dose and the control is interpreted as Fold Change).</span>
                      </template>
                    </v-switch>
                  </v-form>
                </v-card-text>
                <v-row justify="end">
                  <v-col
                    cols="12"
                    align-self="end"
                  >
                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        :disabled="
                          !peptideDatasetFormValid || (progress >= 0 && progress < 100)
                        "
                        color="success"
                        class="mr-4"
                        :loading="isUploading"
                        @click="validate('peptideDataForm')"
                      >
                        Upload File(s)
                      </v-btn>
                      <v-btn
                        fab
                        class="mr-6"
                        elevation="2"
                        color="#e9f1f5"
                        @click="showUploadHelpDialog = !showUploadHelpDialog"
                      >
                        <v-icon>mdi-help</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
                <v-dialog
                  v-model="showUploadHelpDialog"
                  max-width="500px"
                >
                  <v-card>
                    <v-card-actions>
                      <v-alert
                        class="pa-4 mt-3"
                        color="blue-grey"
                        text
                        icon="mdi-help"
                        prominent
                      >
                        <v-row align="center">
                          <v-col class="grow">
                            Don't know what the input should look like?
                          </v-col>
                          <v-col class="shrink">
                            <v-btn :href="$store.state.host + '/proteomicsdb/logic/customUserData/examples/examples.zip'">
                              Download Examples
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-alert>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card>
            </v-tab-item>
            <v-tab-item key="fullProteomeTabItem">
              <v-card elevation="0">
                <v-card-title>Full Proteome Data Upload</v-card-title>
                <v-card-text>
                  <v-form
                    ref="fullProteomeDataForm"
                    v-model="fullProteomeDatasetFormValid"
                    lazy-validation
                  >
                    <!-- dataset related stuff -->
                    <v-text-field
                      v-model="datasetName"
                      :counter="50"
                      :rules="datasetNameRules"
                      label="Name your dataset"
                      outlined
                      required
                    />
                    <v-select
                      v-model="selectedOrganism"
                      :items="organismList"
                      item-text="text"
                      label="Select Organism"
                      outlined
                      required
                      return-object
                    />

                    <v-select
                      v-model="fullProteomeDatasetType"
                      :items="peptideOrFullProteomeDatasetTypes"
                      item-text="text"
                      :rules="peptideOrFullProteomeDatasetTypeRules"
                      label="Select your Dataset type"
                      outlined
                      required
                      return-object
                    />

                    <!-- File related stuff -->
                    <v-radio-group
                      v-model="csvFileSeparator"
                      row
                      mandatory
                      class="mb-n6"
                    >
                      <v-radio value="tab">
                        <template #label>
                          <span style="font-size: 14px">Tab Separated Values</span>
                        </template>
                      </v-radio>
                      <v-radio value="comma">
                        <template #label>
                          <span style="font-size: 14px">Comma Separated Values</span>
                        </template>
                      </v-radio>
                    </v-radio-group>
                    <v-file-input
                      v-model="fullProteomeCsvFile"
                      class="ma-2"
                      accept="text/csv,.txt,.tsv"
                      label="Select .csv/.txt file (containing fold changes or curve data)"
                      outlined
                      :rules="fileUploadRules"
                    />
                    <v-file-input
                      v-if="fullProteomeDatasetType.needsToml"
                      v-model="fullProteomeTomlFile"
                      accept=".toml"
                      label="Select .toml file"
                      outlined
                      :rules="fileUploadRules"
                    />
                    <v-switch
                      v-if="fullProteomeDatasetType.needsToml"
                      v-model="hasFoldChangeColumn"
                      style="font-size: 8pt"
                    >
                      <template #label>
                        <span style="font-size: 14px">Curve File contains 'Fold Change' column.<br>(Otherwise, the intensity ratio between the highest dose and the control is interpreted as Fold Change).</span>
                      </template>
                    </v-switch>
                  </v-form>
                </v-card-text>
                <v-row justify="end">
                  <v-col
                    cols="12"
                    align-self="end"
                  >
                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        :disabled="
                          !fullProteomeDatasetFormValid || (progress >= 0 && progress < 100)
                        "
                        color="success"
                        class="mr-4"
                        :loading="isUploading"
                        @click="validate('fullProteomeDataForm')"
                      >
                        Upload File(s)
                      </v-btn>
                      <v-btn
                        fab
                        class="mr-6"
                        elevation="2"
                        color="#e9f1f5"
                        @click="showUploadHelpDialog = !showUploadHelpDialog"
                      >
                        <v-icon>mdi-help</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card elevation="0">
          <v-card-title>Current Session Information</v-card-title>
          <v-card-text>
            A session is initiated when you upload a dataset and is live for
            14 days. In case you do not have a session ID yet, leave this
            field empty - a new session ID will be generated. If you want to
            load another session, please copy the session ID in the field
            below and select Change Session ID.
          </v-card-text>
          <v-card-text>
            <v-form
              ref="sessionForm"
              v-model="sessionFormValid"
              lazy-validation
            >
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="expiry_days"
                    :disabled="true"
                    label="Days till Expiration"
                    outlined
                  />
                </v-col>
                <v-col>
                  <v-btn
                    :right="true"
                    :absolute="true"
                    :disabled="!uuid"
                    label="Renew Session"
                    class="mr-4"
                    color="success"
                    @click="renewSession"
                  >
                    Renew Session
                  </v-btn>
                </v-col>
              </v-row>
              <v-text-field
                v-model="n_datasets"
                :disabled="true"
                label="Number of Datasets"
                outlined
              />
              <v-text-field
                v-model="new_uuid"
                label="Session ID"
                :counter="32"
                :rules="sessionIDRules"
                outlined
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              v-model="changeSessionID"
              :disabled="!sessionFormValid"
              label="Change session ID"
              class="mr-4"
              color="success"
              @click="sessionIDDialog = true"
            >
              Change Session ID
            </v-btn>
          </v-card-actions>
          <v-card-text>
            <v-select
              v-model="selectedDataset"
              return-object
              outlined
              :items="datasets"
              item-text="datasetName"
              item-value="datasetId"
              label="Uploaded Datasets"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              :disabled="!uuid"
              color="primary"
              @click="deletionDialog = true"
            >
              <v-icon left>
                mdi-delete
              </v-icon>
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card elevation="0">
          <v-card-title>Data Upload Table</v-card-title>
          <custom-data-upload-table
            :uuid="uuid"
            :dataset-id="selectedDataset ? selectedDataset.datasetId : -1"
          />
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="mComBatDialog"
      width="600"
    >
      <v-card>
        <v-card-title>
          Warning - Users must be careful when using this option.
        </v-card-title>
        <v-card-text>
          Protein expression values that can not be normalized, because of
          absence in ProteomicsDB, will be excluded from the uploaded user
          dataset.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="mComBatDialog = false"
          >
            OK
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="
              mComBatActive = false;
              mComBatDialog = false;
            "
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="sessionIDDialog"
      width="600"
    >
      <v-card>
        <v-card-title>
          Warning - Please save your previous session ID
        </v-card-title>
        <v-card-text>
          Make sure you saved your previous Session ID, if there was one. There
          is no way to retrieve a lost Session ID, as your data is stored only
          temporarily in ProteomicsDB.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="
              sessionIDDialog = false;
              checkSessionId();
            "
          >
            Continue
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="sessionIDDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deletionDialog"
      width="600"
    >
      <v-card>
        <v-card-title>Warning - This will delete data.</v-card-title>
        <v-card-text>
          Selected dataset: {{ selectedDataset.datasetName }} <br>
          Are you sure?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="
              deletionDialog = false;
              deleteDataset();
            "
          >
            Continue
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="deletionDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="cookieExpiredDialog"
      width="600"
    >
      <v-card>
        <v-card-title>Error - Session could not be loaded.</v-card-title>
        <v-card-text>
          The session ID you have entered is either expired or does not exist.
          Please try again with the correct session ID or leave it empty when
          uploading data to generate a new one.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="
              cookieExpiredDialog = false;
              new_uuid = uuid;
            "
          >
            Dismiss
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="checkEqualSessionDialog"
      width="600"
    >
      <v-card>
        <v-card-title>Error - Session unchanged.</v-card-title>
        <v-card-text>
          Your current Session ID is different to the one you have entered in
          the Session ID field. If you want to upload data to another existing
          session, please press the "Change Session ID" button prior to
          uploading data.<br>
          Current session ID: {{ uuid }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="
              checkEqualSessionDialog = false;
              new_uuid = uuid;
            "
          >
            Dismiss
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="loadingSnackbar"
      :timeout="snackbarTimeout"
      color="primary"
      width="500"
    >
      Please wait. Your data is being uploaded...
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="loadingSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
      v-model="uploadSnackbar"
      :timeout="snackbarTimeout"
      color="primary"
      width="500"
    >
      {{ uploadedDatasetMessage }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="uploadSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!--    <v-snackbar
        :timeout=snackbarTimeout-->
    <!--      v-model="uploadSnackbar"-->
    <!--      width="500"-->
    <!--    >-->
    <!--      File upload {{ progressText }}: {{ progress }} %-->
    <!--      <v-progress-linear-->
    <!--        absolute-->
    <!--        bottom-->
    <!--        :value="progress"-->
    <!--      />-->

    <!--      <v-btn-->
    <!--        v-if="progress < 100"-->
    <!--        color="primary"-->
    <!--        text-->
    <!--        @click="stopUpload()"-->
    <!--      >-->
    <!--        Cancel-->
    <!--      </v-btn>-->
    <!--      <template v-slot:action="{ attrs }">-->
    <!--        <v-btn-->
    <!--          color="primary"-->
    <!--          text-->
    <!--          v-bind="attrs"-->
    <!--          @click="uploadSnackbar = false"-->
    <!--        >-->
    <!--          Close-->
    <!--        </v-btn>-->
    <!--      </template>-->
    <!--    </v-snackbar>-->
    <v-snackbar
      v-model="uploadErrorSnackbar"
      color="red accent-2"
    >
      {{ uploadError }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="uploadErrorSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
      v-model="deletedDatasetSnackbar"
      :timeout="snackbarTimeout"
      color="primary"
    >
      {{ deletedDatasetMessage }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="deletedDatasetSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios'
import CustomDataUploadTable from '@/components/CustomDataUploadTable'
import utils from '../../plugins/CustomUploadUtils'

export default {
  name: 'CustomDataUpload',
  components: { CustomDataUploadTable },
  data: () => ({
    uuid: '',
    new_uuid: '',
    expressionDatasetFormValid: true,
    peptideDatasetFormValid: true,
    fullProteomeDatasetFormValid: true,
    sessionFormValid: true,
    datasetName: '',
    datasetNameRules: [
      (v) => !!v || 'Name is required.',
      (v) => (v && v.length >= 5) || 'Name must be longer than 5 characters.',
      (v) =>
        (v && !!v.match(/^[a-zA-Z0-9_-]+$/i)) ||
                'Name can only contain the following characters: a-z, A-Z, 0-9, - , _ .'
    ],
    omicsType: '',
    omicsTypes: ['Proteomics', 'Transcriptomics'],
    omicsTypeRules: [(omics) => !!omics || 'Omics type is required.'],
    peptideDatasetType: -1,
    fullProteomeDatasetType: -1,
    peptideOrFullProteomeDatasetTypes: [
      {
        id: 1,
        text: "Quantitative Proteomics ('Fold Change Data')",
        needsToml: false
      }, {
        id: 2,
        text: 'decryptM / CurveCurator',
        needsToml: true
      }],
    peptideOrFullProteomeDatasetTypeRules: [(t) => !!t || 'Dataset type is required.'],
    expressionCsvFile: null,
    peptideCsvFile: null,
    fullProteomeCsvFile: null,
    peptideTomlFile: null,
    fullProteomeTomlFile: null,
    hasFoldChangeColumn: false,
    fileUploadRules: [
      (value) => typeof value !== 'undefined' || 'Please choose a file.',
      (value) =>
        (value && value.size < 1000000000) ||
                'File size should be less than 1 GB!'
    ],
    progress: -1,
    requesttoken: axios.CancelToken.source(),
    mComBatActive: false,
    mComBatDialog: false,
    sessionId: '',
    changeSessionID: false,
    sessionIDDialog: false,
    n_datasets: 0,
    expiry_days: 0,
    datasets: [],
    uploadSnackbar: false,
    uploadErrorSnackbar: false,
    uploadError: '',
    selectedDataset: {},
    cookieExpiredDialog: false,
    checkEqualSessionDialog: false,
    deletedDatasetSnackbar: false,
    deletedDatasetMessage: '',
    uploadedDatasetMessage: '',
    deletionDialog: false,
    activeTab: 1, // For some reason this does not work by key...
    isUploading: false,
    loadingSnackbar: false,
    csvFileSeparator: null,
    snackbarTimeout: 4000,
    selectedOrganism: undefined,
    organismList: undefined,
    exampleSessionId: '0123456789ABCDEF0123456789ABCDEF',
    showUploadHelpDialog: false
  }),
  computed: {
    /** @returns {string} */
    progressText () {
      return this.progress < 100 ? 'in progress' : 'done'
    },
    sessionIDRules () {
      return [
        (sessionID) =>
          (sessionID !== this.exampleSessionId &&
                    !!sessionID.match(/^[A-F0-9]{32}$/i)) ||
                    'Session ID must have a length of 32 characters and only contain "0-9, A-F".'
      ]
    }
  },
  mounted () {
    this.loadOrganisms()
    this.uuid = this.$cookie.get('analyticsUploadSessionID') || ''
    this.new_uuid = this.uuid
    if (this.uuid.length > 0) {
      this.checkSessionId()
    }
  },
  methods: {
    validate (formName) {
      if (this.$refs[formName].validate()) {
        this.submit(formName)
      }
    },
    onMComBatClick () {
      this.mComBatDialog = this.mComBatActive
    },
    async submit (formName) {
      if (!this.uuid) {
        const response = await axios.get(
          this.$store.state.host +
                    '/proteomicsdb/logic/secure/checkSessionId.xsjs'
        )
        this.uuid = response.data.uuid
        this.new_uuid = this.uuid
        this.setCookie('analyticsUploadSessionID', this.uuid, 14)
      }
      this.uploadFile(formName)
    },
    setCookie (cname, cvalue, exdays) {
      const d = new Date()
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
      this.$cookie.set(cname, cvalue, { expires: d })
    },
    async checkSessionId () {
      const response = await axios.get(
        this.$store.state.host +
                '/proteomicsdb/logic/secure/checkSessionId.xsjs',
        { params: { uuid: this.new_uuid } }
      )

      if (response.data.cookieStatus === 0) {
        this.uuid = this.new_uuid
        this.setCookie('analyticsUploadSessionID', this.uuid, 14)
        this.n_datasets = response.data.noDatasets
        this.expiry_days = response.data.expireDate
        this.datasets = response.data.datasets
        this.selectedDataset = {}
        if (this.datasets.length > 0) {
          this.selectedDataset = this.datasets[this.datasets.length - 1]
        }
      } else {
        // new_uuid does not exist or is expired
        this.cookieExpiredDialog = 'true'
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
    },
    uploadFile (formName) {
      const url =
                this.$store.state.host + '/proteomicsdb/logic/secure/customUpload.xsjs'
      if (this.uuid !== this.new_uuid) {
        // user has changed the session ID field without changing the session via button
        this.checkEqualSessionDialog = true
        return
      }
      if (formName === 'expressionDataForm') {
        const params = {
          uploadType: 'expressionData',
          file: this.expressionCsvFile.name,
          datasetName: this.datasetName,
          omicstype: this.omicsType,
          uuid: this.uuid,
          norm: this.mComBatActive ? 'combat' : ''
        }
        this.sendUploadRequest(url, this.expressionCsvFile, params) // , filesData, table, tableIndex);
      } else if (formName === 'peptideDataForm') {
        const formData = new FormData()
        formData.append('tomlFile', this.peptideTomlFile)
        formData.append('peptideCsvFile', this.peptideCsvFile)
        const params = {
          uploadType: 'peptideData',
          csvFileName: this.peptideCsvFile.name,
          tomlFileName: this.peptideDatasetType.needsToml ? this.peptideTomlFile.name : null,
          datasetName: this.datasetName,
          datasetType: this.peptideDatasetType.needsToml ? 'decryptM' : 'FoldChange',
          hasFoldChangeColumn: (this.hasFoldChangeColumn || !this.peptideDatasetType.needsToml) ? 1 : 0,
          csvFileSeparator: this.csvFileSeparator,
          taxcode: this.selectedOrganism.value,
          uuid: this.uuid
        }
        this.sendUploadRequest(url, formData, params)
      } else if (formName === 'fullProteomeDataForm') {
        const formData = new FormData()
        formData.append('tomlFile', this.fullProteomeTomlFile)
        formData.append('fullProteomeCsvFile', this.fullProteomeCsvFile)
        const params = {
          uploadType: 'fullproteomeData',
          csvFileName: this.fullProteomeCsvFile.name,
          tomlFileName: this.fullProteomeDatasetType.needsToml ? this.fullProteomeTomlFile.name : null,
          datasetName: this.datasetName,
          datasetType: this.fullProteomeDatasetType.needsToml ? 'decryptM' : 'FoldChange',
          hasFoldChangeColumn: (this.hasFoldChangeColumn || !this.fullProteomeDatasetType.needsToml) ? 1 : 0,
          csvFileSeparator: this.csvFileSeparator,
          taxcode: this.selectedOrganism.value,
          uuid: this.uuid
        }
        this.sendUploadRequest(url, formData, params)
      }
    },
    async sendUploadRequest (url, file, params) {
      this.requesttoken.cancel()
      this.requesttoken = axios.CancelToken.source()
      this.loadingSnackbar = true
      this.isUploading = true
      try {
        const response = await axios
          .put(url, file, {
            params,
            headers: { 'Content-Type': file.type, 'X-CSRF-Token': await this.getCSRF() },
            cancelToken: this.requesttoken.token
          })
        this.loadingSnackbar = false
        this.isUploading = false
        this.uploadedDatasetMessage = response.data
        this.uploadSnackbar = true

        await this.checkSessionId()
      } catch (error) {
        this.isUploading = false
        this.uploadError = error.response.data
        this.uploadSnackbar = false
        this.uploadErrorSnackbar = true
      }
    },
    async getCSRF () {
      const token = 'unsafe' // Currently, the endpoint does not return a CSRF token, i.e. returned value is "unsafe".
      // const response = await axios.get(this.$store.state.host + '/sap/hana/xs/formLogin/token.xsjs', { headers: { 'X-CSRF-Token': 'Fetch' } })
      // return response.data.token
      return token
    },
    stopUpload () {
      this.uploadSnackbar = false
      this.progress = -1
      this.requesttoken.cancel()
    },
    async deleteDataset () {
      const response = await axios.get(
        this.$store.state.host +
                '/proteomicsdb/logic/secure/removeDatasetByIdAndUUID.xsjs',
        {
          params: {
            uuid: this.uuid,
            datasetId: this.selectedDataset.datasetId
          }
        }
      )
      this.deletedDatasetSnackbar = true
      this.deletedDatasetMessage = response.data
      await this.checkSessionId()
    },
    renewSession () {
      utils.renewSession(this.$store.state.host, this.new_uuid)
    }
  }
}
</script>

<style scoped>
</style>
