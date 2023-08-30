<template>
  <v-form
    class="form-custom"
    lazy-validation
  >
    <div v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li
          v-for="error in errors"
          :key="error"
        >
          {{ error }}
        </li>
      </ul>
    </div>
    <v-stepper
      v-model="activeStep"
      class="stepper-main"
    >
      <v-stepper-header>
        <v-stepper-step
          :complete="activeStep > 1"
          step="1"
          editable
        >
          Data
        </v-stepper-step>

        <v-divider />

        <v-stepper-step
          :complete="activeStep > 2"
          step="2"
          :editable="formValues.tableName !== ''"
        >
          Chart
        </v-stepper-step>

        <v-divider />

        <v-stepper-step
          :complete="activeStep > 3"
          step="3"
          :editable="formValues.selectedChart !== 0"
        >
          Axis
        </v-stepper-step>

        <v-divider />

        <v-stepper-step
          :complete="activeStep > 4"
          step="4"
          :editable="formValues.xAxis !== '' || formValues.yAxis !== ''"
        >
          Conditions
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-container
            fluid
            class="form-section"
          >
            <div class="section-title">
              <span class="font-small"><b>DATA</b> </span>
              <tooltip-icon-info
                tooltip-text="Pick one of the available types of data<br>that you would like to visualize."
                color="blue"
              />
              <v-divider />
            </div>
            <v-select
              v-model="formValues.tableName"
              class="font-small"
              :items="calculationViews.map((entry) => entry.name)"
              label="Data of Interest*"
              solo
              placeholder="e.g. Identification"
              @change="populateColumns()"
            />
          </v-container>
          <v-btn
            class="continue-button-step-one"
            color="primary"
            :disabled="formValues.tableName === ''"
            @click="activeStep = 2"
          >
            Continue
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-container class="form-section">
            <div class="section-title">
              <span class="font-small"><b>CHART TYPES</b></span>
              <tooltip-icon-info
                tooltip-text="After you submit, the chart which you<br>have picked will be rendered on the right side."
                color="blue"
              />
              <v-divider />
            </div>
            <v-container class="chart-container grey lighten-5">
              <chart-card-options
                :form-values="formValues"
                :is-in-form="true"
              />
            </v-container>
          </v-container>

          <v-btn
            color="primary"
            :disabled="formValues.selectedChart === 0"
            @click="activeStep = 3"
          >
            Continue
          </v-btn>

          <v-btn
            text
            @click="activeStep = 1"
          >
            Go Back
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-container class="form-section pb-0">
            <div class="section-title">
              <span class="font-small"><b>X-AXIS</b></span>
              <tooltip-icon-info
                tooltip-text="The type of the chosen x-axis determines<br>the available transformations and aggregations."
                color="blue"
              />
              <v-divider />
            </div>
            <v-container
              class="flex-container"
              fluid
            >
              <!-- Maybe the v-selects can be separated into another component -->
              <v-select
                v-model="formValues.xAxis"
                class="font-small"
                :items="columns"
                label="x-axis*"
                solo
                chips
                item-text="Name"
                return-object
                @change="$emit('update-axis', 'xAxis', $event)"
              >
                <template v-slot:item="{ item }">
                  <div class="d-flex">
                    <div class="pr-1 option-entry-additional">
                      <span class="font-weight-medium">{{ item["Type"] }}</span>
                    </div>
                    <div class="pl-1">
                      <span>{{ item["Name"] }}</span>
                    </div>
                  </div>
                </template>
                <template v-slot:selection="{ item }">
                  <v-chip
                    v-if="item['Type'] !== ''"
                    text-color="black"
                    small
                  >
                    {{
                      item["Type"]
                    }}
                  </v-chip>
                  <div>
                    <b>{{ item["Name"] }}</b>
                  </div>
                </template>
              </v-select>
              <v-select
                v-model="formValues.xTransformation"
                class="font-small"
                :items="transformationOptionsXAxis"
                label="x-transformation"
                solo
                :disabled="
                  typeof formValues.xAxis === 'undefined' ||
                    formValues.xAxis === ''
                "
                item-text="name"
                @change="$emit('update-submit', false)"
              />
              <tooltip-icon-reset-input
                v-if="formValues.xTransformation !== ''"
                input="xTransformation"
                @reset-value="resetInput($event)"
              />
              <v-select
                v-model="formValues.xAggregation"
                class="font-small"
                :items="aggregationOptionsXAxis"
                :disabled="
                  typeof formValues.xAxis === 'undefined' ||
                    formValues.xAxis === ''
                "
                label="x-aggregation"
                item-text="name"
                solo
                @change="$emit('update-submit', false)"
              />
              <tooltip-icon-reset-input
                v-if="formValues.xAggregation !== ''"
                input="xAggregation"
                @reset-value="resetInput($event)"
              />
            </v-container>
          </v-container>
          <v-container class="form-section pt-0">
            <div class="section-title">
              <span class="font-small"><b>Y-AXIS</b></span>
              <tooltip-icon-info
                tooltip-text="The type of the chosen y-axis determines<br>the available transformations and aggregations."
                color="blue"
              />
              <v-divider />
            </div>
            <v-container
              class="flex-container pb-0"
              fluid
            >
              <v-select
                v-model="formValues.yAxis"
                class="font-small"
                :items="columns"
                label="y-axis*"
                solo
                chips
                item-text="Name"
                return-object
                @change="$emit('update-axis', 'yAxis', $event)"
              >
                <template v-slot:item="{ item }">
                  <div class="d-flex">
                    <div class="pr-1 option-entry-additional">
                      <span class="font-weight-medium">{{ item["Type"] }}</span>
                    </div>
                    <div class="pl-1">
                      <span>{{ item["Name"] }}</span>
                    </div>
                  </div>
                </template>
                <template v-slot:selection="{ item }">
                  <v-chip
                    v-if="item['Type'] !== ''"
                    text-color="black"
                    small
                  >
                    {{
                      item["Type"]
                    }}
                  </v-chip>
                  <div>
                    <b>{{ item["Name"] }}</b>
                  </div>
                </template>
              </v-select>
              <v-select
                v-model="formValues.yTransformation"
                class="font-small"
                :items="transformationOptionsYAxis"
                :disabled="
                  typeof formValues.yAxis === 'undefined' ||
                    formValues.yAxis === ''
                "
                item-text="name"
                label="y-transformation"
                solo
                @change="$emit('update-submit', false)"
              />
              <tooltip-icon-reset-input
                v-if="formValues.yTransformation !== ''"
                input="yTransformation"
                @reset-value="resetInput($event)"
              />
              <v-select
                v-model="formValues.yAggregation"
                class="font-small"
                :items="aggregationOptionsYAxis"
                :disabled="
                  typeof formValues.yAxis === 'undefined' ||
                    formValues.yAxis === ''
                "
                item-text="name"
                label="y-aggregation"
                solo
                @change="$emit('update-submit', false)"
              />
              <tooltip-icon-reset-input
                v-if="formValues.yAggregation !== ''"
                input="yAggregation"
                @reset-value="resetInput($event)"
              />
            </v-container>
          </v-container>
          <v-container
            v-if="
              formValues.selectedChart === 'Bubble' ||
                formValues.selectedChart === 'Radar'
            "
            class="form-section pb-0"
            fluid
          >
            <div class="section-title">
              <span class="font-small"><b>Z-AXIS</b></span>
              <v-divider />
            </div>
            <v-container
              class="flex-container"
              fluid
            >
              <v-select
                v-model="formValues.z1Axis"
                class="font-small"
                :items="columns"
                label="z1-axis"
                solo
                chips
                item-text="Name"
                return-object
                @change="$emit('update-axis', 'z1Axis', $event)"
              >
                <template v-slot:item="{ item }">
                  <div class="d-flex">
                    <div class="pr-1 option-entry-additional">
                      <span class="font-weight-medium">{{ item["Type"] }}</span>
                    </div>
                    <div class="pl-1">
                      <span>{{ item["Name"] }}</span>
                    </div>
                  </div>
                </template>
                <template v-slot:selection="{ item }">
                  <v-chip
                    v-if="item['Type'] !== ''"
                    text-color="black"
                    small
                  >
                    {{
                      item["Type"]
                    }}
                  </v-chip>
                  <div>
                    <b>{{ item["Name"] }}</b>
                  </div>
                </template>
              </v-select>
              <v-select
                v-model="formValues.z1Transformation"
                class="font-small"
                :items="transformationOptionsZ1Axis"
                item-text="name"
                label="z1-transformation"
                :disabled="
                  typeof formValues.z1Axis === 'undefined' ||
                    formValues.z1Axis === ''
                "
                solo
                @change="
                  $emit('update-ztransformations', 'z1Transformation', $event)
                "
              />
              <tooltip-icon-reset-input
                v-if="formValues.z1Transformation !== ''"
                input="z1Transformation"
                @reset-value="resetInput($event)"
              />
              <v-select
                v-model="formValues.z1Aggregation"
                class="font-small"
                :items="aggregationOptionsZ1Axis"
                :disabled="
                  typeof formValues.z1Axis === 'undefined' ||
                    formValues.z1Axis === ''
                "
                item-text="name"
                label="z1-aggregation"
                solo
                @change="$emit('update-zaggregations', 'z1Aggregation', $event)"
              />
              <tooltip-icon-reset-input
                v-if="formValues.z1Aggregation !== ''"
                input="z1Aggregation"
                @reset-value="resetInput($event)"
              />
            </v-container>
          </v-container>
          <v-container
            v-if="formValues.selectedChart === 'Bubble'"
            class="form-section pb-0"
            fluid
          >
            <v-container
              class="flex-container pb-0"
              fluid
            >
              <v-select
                v-model="formValues.z2Axis"
                class="font-small"
                :items="columns"
                label="z2-axis"
                solo
                chips
                item-text="Name"
                return-object
                @change="$emit('update-axis', 'z2Axis', $event)"
              >
                <template v-slot:item="{ item }">
                  <div class="d-flex">
                    <div class="pr-1 option-entry-additional">
                      <span class="font-weight-medium">{{ item["Type"] }}</span>
                    </div>
                    <div class="pl-1">
                      <span>{{ item["Name"] }}</span>
                    </div>
                  </div>
                </template>
                <template v-slot:selection="{ item }">
                  <v-chip
                    v-if="item['Type'] !== ''"
                    text-color="black"
                    small
                  >
                    {{
                      item["Type"]
                    }}
                  </v-chip>
                  <div>
                    <b>{{ item["Name"] }}</b>
                  </div>
                </template>
              </v-select>
              <v-select
                v-model="formValues.z2Transformation"
                class="font-small"
                :items="transformationOptionsZ2Axis"
                :disabled="typeof formValues.z2Axis === 'undefined'"
                item-text="name"
                label="z2-transformation"
                solo
                @change="
                  $emit('update-ztransformations', 'z2Transformation', $event)
                "
              />
              <tooltip-icon-reset-input
                v-if="formValues.z2Transformation !== ''"
                input="z2Transformation"
                @reset-value="resetInput($event)"
              />
              <v-select
                v-model="formValues.z2Aggregation"
                class="font-small"
                :disabled="typeof formValues.z2Axis === 'undefined'"
                :items="aggregationOptionsZ2Axis"
                item-text="name"
                label="z2-aggregation"
                solo
                @change="$emit('update-zaggregations', 'z2Aggregation', $event)"
              />
              <tooltip-icon-reset-input
                v-if="formValues.z2Aggregation !== ''"
                input="z2Aggregation"
                @reset-values="resetInput($event)"
              />
            </v-container>
          </v-container>

          <v-btn
            color="primary"
            :disabled="formValues.xAxis.Name === '' || formValues.yAxis.Name === ''"
            @click="activeStep = 4"
          >
            Continue
          </v-btn>

          <v-btn
            text
            @click="activeStep = 2"
          >
            Go Back
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="4">
          <v-container v-if="formValues.submitted">
            <v-btn
              color="orange"
              class="ma-2 white--text"
              @click="resetState"
            >
              Clear all fields
              <v-icon
                right
                dark
              >
                mdi-close-circle
              </v-icon>
            </v-btn>
          </v-container>
          <v-container class="form-section">
            <div class="section-title">
              <span class="font-small"><b>GROUPS</b></span>
              <tooltip-icon-info
                tooltip-text="You can group by a selected column.<br>If the column is your x-, y- or z-axis,<br>you can additionally specify whether to apply<br>transformations and aggregations."
                color="blue"
              />
              <v-divider />
            </div>
            <v-container fluid>
              <v-combobox
                v-model="formValues.groupByAdditional"
                :items="groupByItems"
                :search-input.sync="searchGroupBy"
                hint="You can pick more than one"
                label="Choose data to group by"
                hide-selected
                multiple
                solo
                persistent-hint
                small-chips
              >
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        No results matching "<strong>{{ searchGroupBy }}</strong>".
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <template v-slot:item="{ index, item }">
                  <v-chip
                    dark
                    label
                    small
                  >
                    {{ item }}
                  </v-chip>
                  <v-spacer />
                  <v-list-item-action
                    v-if="
                      item === formValues.xAxis['Name'] ||
                        item === formValues.yAxis['Name'] ||
                        item === formValues.z1Axis['Name'] ||
                        item === formValues.z2Axis['Name']
                    "
                    @click.stop
                  >
                    <v-checkbox
                      v-model="formValues.groupByMain"
                      :value="item"
                      label="Transformations applied"
                    />
                  </v-list-item-action>
                </template>
              </v-combobox>
            </v-container>
          </v-container>
          <v-container class="form-section">
            <div class="section-title">
              <span class="font-small"><b>CONDITIONS</b></span>
              <tooltip-icon-info
                tooltip-text="You can optionally add conditions<br>to reduce the size of the result set."
                color="blue"
              />
              <v-divider />
            </div>
            <v-card
              v-if="formValues.conditions.length > 0"
              max-width="450"
              class="mx-auto my-4"
            >
              <v-list>
                <template v-for="(item, index) in formValues.conditions">
                  <v-divider
                    v-if="index > 0"
                    :key="index + '0'"
                  />
                  <v-list-item :key="index">
                    <v-list-item-content>
                      <v-list-item-subtitle>
                        {{ item.transformation !== ''
                          ? `${item.transformation}(${item.column['Name']}) ${item.operator} ${item.value}`
                          : `${item.column['Name']} ${item.operator} ${item.value}` }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-btn
                      class="mx-2"
                      fab
                      dark
                      color="red"
                      x-small
                      @click="removeCondition(index)"
                    >
                      <v-icon dark>
                        mdi-minus-circle
                      </v-icon>
                    </v-btn>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
            <v-container
              class="flex-container"
              fluid
            >
              <v-select
                v-model="conditionColumn"
                class="font-small"
                :items="columns"
                label="Column"
                solo
                chips
                item-text="Name"
                return-object
              >
                <template v-slot:item="{ item }">
                  <div class="d-flex">
                    <div class="pr-1 option-entry-additional">
                      <span class="font-weight-medium">{{ item["Type"] }}</span>
                    </div>
                    <div class="pl-1">
                      <span>{{ item["Name"] }}</span>
                    </div>
                  </div>
                </template>
                <template v-slot:selection="{ item }">
                  <v-chip
                    v-if="item['Type'] !== ''"
                    text-color="white"
                    color="#184f24"
                    small
                  >
                    {{
                      item["Type"]
                    }}
                  </v-chip>
                  <div>
                    <span>{{ item["Name"] }}</span>
                  </div>
                </template>
              </v-select>
              <v-select
                v-model="conditionTransformation"
                class="font-small"
                :items="conditionTransformationOptions"
                label="Transformation"
                item-text="name"
                solo
              />
              <v-select
                v-model="conditionOperator"
                class="font-small"
                :items="conditionOperators"
                label="Operator"
                solo
              />
              <v-text-field
                v-model="conditionValue"
                solo
                label="Value"
                clearable
              />
              <v-btn
                class="mx-2"
                fab
                dark
                small
                color="indigo"
                @click="addCondition"
              >
                <v-icon dark>
                  mdi-plus
                </v-icon>
              </v-btn>
            </v-container>
          </v-container>
          <v-btn
            depressed
            color="primary"
            :disabled="!isValid || (isValid && formValues.submitted)"
            @click="checkForm"
          >
            Submit
          </v-btn>
          <div
            v-if="!formValues.submitted && dialog"
            class="text-center"
          >
            <v-dialog
              :value="dialog"
              width="500"
            >
              <v-card v-if="responseStatus === 200">
                <v-card-title class="text-h5 grey lighten-2">
                  {{ resultsSize > 1000 ? "Warning" : "Info" }}
                </v-card-title>

                <v-card-text v-if="resultsSize > 1000">
                  You are attempting to retrieve {{ resultsSize }} results. The
                  application can process at most around 4000 results, but the
                  recommended size for fast visualization time is 1000 entries
                  or fewer.
                </v-card-text>
                <v-card-text v-else>
                  You are attempting to retrieve {{ resultsSize }} results.
                </v-card-text>

                <v-card
                  v-if="resultsSize > 500"
                  class="px-5"
                >
                  <v-card-title class="text-h6 lighten-2">
                    Limit your results
                  </v-card-title>
                  <v-card-text>
                    <v-slider
                      v-model="limitSize"
                      step="5"
                      thumb-label
                      ticks
                    />
                  </v-card-text>
                </v-card>

                <v-divider />

                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    v-if="resultsSize > 500"
                    color="secondary"
                    text
                    @click="closeDialogAndLimitResults()"
                  >
                    Limit and submit
                  </v-btn>
                  <v-btn
                    color="primary"
                    :disabled="resultsSize > 4000"
                    text
                    @click="closeDialogAndProcessResults()"
                  >
                    Confirm
                  </v-btn>
                </v-card-actions>
              </v-card>
              <v-card
                v-else-if="responseStatus === 400 || responseStatus === 500"
              >
                <v-card-title class="text-h5 red lighten-2">
                  Error
                </v-card-title>

                <v-card-text>
                  Please provide different data. This one cannot be processed.
                </v-card-text>

                <v-divider />

                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    color="primary"
                    text
                    @click="closeDialog()"
                  >
                    Retry
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
          <v-btn
            text
            @click="activeStep = 3"
          >
            Go Back
          </v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-form>
</template>

<script>
import { COLUMN_TYPES } from '../../utils/dataExplorer/maps'
import { checkIsValidField } from '../../utils/dataExplorer/formValidation'
import ChartCardOptions from './elements/ChartCardOptions.vue'
import TooltipIconInfo from './elements/TooltipIconInfo.vue'
import TooltipIconResetInput from './elements/TooltipIconResetInput.vue'
import { mapState } from 'vuex'

export default {
  name: 'ChartForm',
  components: {
    ChartCardOptions,
    TooltipIconInfo,
    TooltipIconResetInput
  },
  props: {
    formValues: {
      type: Object,
      default () {
        return {
          tableName: '',
          xAxis: '',
          yAxis: '',
          z1Axis: '',
          z2Axis: '',
          xTransformation: '',
          yTransformation: '',
          z1Transformation: '',
          z2Transformation: '',
          xAggregation: '',
          yAggregation: '',
          z1Aggregation: '',
          z2Aggregation: '',
          groupByMain: [],
          groupByAdditional: [],
          conditions: [],
          selectedChart: 0,
          submitted: false
        }
      }
    },
    dialog: Boolean
  },
  data () {
    return {
      activeStep: 1,
      calculationViews: [],
      columns: [],
      transformationOptions: [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ],
      transformationOptionsXAxis: [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ],
      transformationOptionsYAxis: [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ],
      transformationOptionsZ1Axis: [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ],
      transformationOptionsZ2Axis: [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ],
      aggregationOptions: [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ],
      aggregationOptionsXAxis: [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ],
      aggregationOptionsYAxis: [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ],
      aggregationOptionsZ1Axis: [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ],
      aggregationOptionsZ2Axis: [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ],
      conditionTransformationOptions: [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ],
      errors: [],
      // separate data below ideally in another component
      groupByItems: [],
      searchGroupBy: null,
      // conditions
      conditionOperators: ['<', '<=', '=', '>=', '>'],
      conditionColumn: '',
      conditionTransformation: '',
      conditionOperator: '',
      conditionValue: '',
      limitSize: 0
    }
  },
  computed: {
    isValid: function () {
      const baseRequirment =
        checkIsValidField(this.formValues.tableName) &&
        checkIsValidField(this.formValues.xAxis) &&
        checkIsValidField(this.formValues.yAxis) &&
        this.formValues.selectedChart !== 0 &&
        typeof this.formValues.selectedChart !== 'undefined'
      if (this.formValues.selectedChart === 'Radar') {
        return baseRequirment && checkIsValidField(this.formValues.z1Axis)
      }
      if (this.formValues.selectedChart === 'Bubble') {
        return (
          baseRequirment &&
          checkIsValidField(this.formValues.z1Axis) &&
          checkIsValidField(this.formValues.z2Axis)
        )
      }
      return baseRequirment
    },
    ...mapState('dataExplorer', {
      metadata: 'metadata',
      resultsSize: 'resultsSize',
      responseStatus: 'responseStatus'
    })
  },
  watch: {
    'formValues.groupByAdditional' (val, prev) {
      if (val.length === prev.length) return
      const lastItem = val[val.length - 1]
      const itemExistsInGroupByArrayOptions = this.groupByItems.some(
        (entry) => entry === lastItem
      )
      this.formValues.groupByMain = this.formValues.groupByMain.filter(
        (entry) => entry !== val
      )
      if (!itemExistsInGroupByArrayOptions) {
        this.$nextTick(() => this.formValues.groupByAdditional.pop())
      }
    },
    'formValues.xAxis' (val) {
      this.updateTransfAggrOptions(val, 'xAxis')
    },
    'formValues.yAxis' (val) {
      this.updateTransfAggrOptions(val, 'yAxis')
    },
    'formValues.z1Axis' (val) {
      this.updateTransfAggrOptions(val, 'z1Axis')
    },
    'formValues.z2Axis' (val) {
      this.updateTransfAggrOptions(val, 'z2Axis')
    },
    'formValues.xTransformation' (val, prev) {
      if (val === 'LENGTH') {
        this.changeTypeForAxisTo('xAxis', 'NUMBER')
      } else if (
        prev === 'LENGTH' &&
        this.formValues.xAxis.Type === 'NUMBER'
      ) {
        this.changeTypeForAxisTo('xAxis', 'TEXT')
      }
    },
    'formValues.yTransformation' (val, prev) {
      if (val === 'LENGTH') {
        this.changeTypeForAxisTo('yAxis', 'NUMBER')
      } else if (
        prev === 'LENGTH' &&
        this.formValues.yAxis.Type === 'NUMBER'
      ) {
        this.changeTypeForAxisTo('yAxis', 'TEXT')
      }
    },
    'formValues.z1Transformation' (val, prev) {
      if (val === 'LENGTH') {
        this.changeTypeForAxisTo('z1Axis', 'NUMBER')
      } else if (
        prev === 'LENGTH' &&
        this.formValues.z1Axis.Type === 'NUMBER'
      ) {
        this.changeTypeForAxisTo('z1Axis', 'TEXT')
      }
    },
    'formValues.z2Transformation' (val, prev) {
      if (val === 'LENGTH') {
        this.changeTypeForAxisTo('z2Axis', 'NUMBER')
      } else if (
        prev === 'LENGTH' &&
        this.formValues.z2Axis.Type === 'NUMBER'
      ) {
        this.changeTypeForAxisTo('z2Axis', 'TEXT')
      }
    },
    'formValues.submitted' (val, prev) {
      // used to reset limitSize for now
      if (val !== prev) this.limitSize = 0
    },
    conditionColumn (val) {
      this.updateTransfAggrOptions(val, 'conditionColumn')
    }
  },
  beforeCreate () {
    this.$store.dispatch('dataExplorer/getMetadata')
  },
  mounted () {
    let unsubscribe = null
    unsubscribe = this.$store.subscribe(({ type }) => {
      if (type === 'dataExplorer/setMetadata') {
        this.populateCalculationViews()
        if (Object.keys(this.$route.query).length > 0) {
          this.formValues.tableName = this.$route.query.tableName
          this.populateColumns()
          this.formValues.selectedChart = this.$route.query.selectedChart
          this.formValues.xAxis = this.columns.find(
            (entry) => entry.Name === this.$route.query.xAxis
          )
          this.formValues.yAxis = this.columns.find(
            (entry) => entry.Name === this.$route.query.yAxis
          )
          this.formValues.xTransformation = this.$route.query.xTransformation
          this.formValues.xAggregation = this.$route.query.xAggregation
          this.formValues.yTransformation = this.$route.query.yTransformation
          this.formValues.yAggregation = this.$route.query.yAggregation
          // need to fix groupby => logic based on pure in front of string etc.
          // groupBy we can pass directly to the generateChart function but to fill in the input field with the checkbox we need the logic below
          // groupByMain is for whether the checkboxes in the dropdown are checked - filter by xAxis and yAxis
          this.formValues.groupByMain = typeof this.$route.query.groupBy !== 'undefined'
            ? this.$route.query.groupBy.split(';')
              .filter(
                (entry) =>
                  entry === this.$route.query.xAxis ||
                entry === this.$route.query.yAxis
              )
            : []
          // for groupByAdditional we have our selections which are basically all the elements  without pure, so we need a map
          this.formValues.groupByAdditional = typeof this.$route.query.groupBy !== 'undefined'
            ? this.$route.query.groupBy
              .split(';')
              .map((entry) =>
                entry.substring(0, 4) === 'pure'
                  ? entry.substring(4, entry.length)
                  : entry
              )
            : []
          // now conditions
          const conditionsArrayInitial =
            typeof this.$route.query.conditions !== 'undefined' ? typeof this.$route.query.conditions.split(';') : []
          // now we have an array of strings ['DECOY,,eq,1', 'Q_VALUE,LOG,gt,0'] => we need to make it an array of objects
          // we first make sure that the structure is right to avoid errors
          const conditionsArrayProcessed = conditionsArrayInitial
            .filter((entry) => entry.split(',').length === 4)
            .map((entry) => ({
              column: this.columns.find(
                (entryCol) => entryCol.Name === entry.split(',')[0]
              ),
              transformation: entry.split(',')[1],
              operator: entry.split(',')[2],
              value: entry.split(',')[3]
            }))
          this.formValues.conditions = conditionsArrayProcessed

          if (
            this.formValues.xAxis !== '' &&
            this.formValues.yAxis !== '' &&
            this.formValues.selectedChart
          ) {
            this.$emit('submit-form', true)
            this.$emit('generate-chart')
          }
          // now simply generate the chart as usual
        }
        unsubscribe() // So it only reacts once.
      }
    })
  },
  methods: {
    populateCalculationViews () {
      const isArray = Array.isArray(this.metadata)
      // the name property is shown to the user and submitted to the backend
      // the type property is used to retrieve the columns later from the same metadata
      const calculationViews = isArray
        ? this.metadata.map((entry) => ({
          name: entry.Name.substring(0, entry.Name.length - 4),
          type: entry.Name
        }))
        : typeof this.metadata.Name !== 'undefined'
          ? [
              {
                name: this.metadata.Name.substring(
                  0,
                  this.metadata.Name.length - 4
                ),
                type: this.metadata.Name
              }
            ]
          : []
      this.calculationViews = calculationViews
    },
    populateColumns () {
      const chosenCalculationView = this.calculationViews.find(
        (entry) => entry.name === this.formValues.tableName
      )
      const isArray = Array.isArray(this.metadata)
      const calculationViewColumns = isArray
        ? this.metadata.find(
          (entry) => entry.Name === chosenCalculationView.type
        ).Property
        : this.metadata.Name === chosenCalculationView.type
          ? this.metadata.Property
          : {}
      const calculationViewColumnsNames = calculationViewColumns
        .map((entry) => ({
          Type: COLUMN_TYPES.get(entry.Type),
          Name: entry.Name
        }))
        .sort((entryOne, entryTwo) =>
          entryOne.Name.localeCompare(entryTwo.Name)
        )
      this.columns = calculationViewColumnsNames
      this.groupByItems = calculationViewColumnsNames.map(
        (entry) => entry.Name
      )
    },
    checkForm (e) {
      e.preventDefault()
      if (
        this.formValues.xAxis !== '' &&
        this.formValues.yAxis !== '' &&
        this.formValues.selectedChart
      ) {
        this.$emit('generate-chart', this.limitSize)
      }

      this.errors = []

      if (!this.formValues.xAxis || !this.formValues.yAxis) {
        this.errors.push('You must have an x- and a y-axis!')
      }
    },
    clearCondition () {
      this.conditionColumn = ''
      this.conditionTransformation = ''
      this.conditionOperator = ''
      this.conditionValue = ''
    },
    addCondition () {
      if (
        this.conditionColumn !== '' &&
        this.conditionOperator !== '' &&
        this.conditionValue !== ''
      ) {
        this.formValues.conditions.push({
          column: this.conditionColumn,
          transformation: this.conditionTransformation,
          operator: this.conditionOperator,
          value: this.conditionValue
        })
        this.clearCondition()
      }
    },
    removeCondition (index) {
      this.formValues.conditions.splice(index, 1)
    },
    resetTransfAggrOptions () {
      this.transformationOptionsXAxis = this.transformationOptions
      this.aggregationOptionsXAxis = this.aggregationOptions
      this.transformationOptionsYAxis = this.transformationOptions
      this.aggregationOptionsYAxis = this.aggregationOptions
      this.transformationOptionsZ1Axis = this.transformationOptions
      this.aggregationOptionsZ1Axis = this.aggregationOptions
      this.transformationOptionsZ2Axis = this.transformationOptions
      this.aggregationOptionsZ2Axis = this.aggregationOptions
      this.conditionTransformationOptions = this.transformationOptions
    },
    updateTransfAggrOptions (val, axis) {
      if (val === '') return
      switch (axis) {
        case 'xAxis':
          this.transformationOptionsXAxis = this.transformationOptions.filter(
            (entry) => entry.allowedTypes.includes(val.Type)
          )
          this.aggregationOptionsXAxis = this.aggregationOptions.filter(
            (entry) => entry.allowedTypes.includes(val.Type)
          )
          break
        case 'yAxis':
          this.transformationOptionsYAxis = this.transformationOptions.filter(
            (entry) => entry.allowedTypes.includes(val.Type)
          )
          this.aggregationOptionsYAxis = this.aggregationOptions.filter(
            (entry) => entry.allowedTypes.includes(val.Type)
          )
          break
        case 'z1Axis':
          this.transformationOptionsZ1Axis = this.transformationOptions.filter(
            (entry) => entry.allowedTypes.includes(val.Type)
          )
          this.aggregationOptionsZ1Axis = this.aggregationOptions.filter(
            (entry) => entry.allowedTypes.includes(val.Type)
          )
          break
        case 'z2Axis':
          this.transformationOptionsZ2Axis = this.transformationOptions.filter(
            (entry) => entry.allowedTypes.includes(val.Type)
          )
          this.aggregationOptionsZ2Axis = this.aggregationOptions.filter(
            (entry) => entry.allowedTypes.includes(val.Type)
          )
          break
        case 'conditionColumn':
          this.conditionTransformationOptions =
            this.transformationOptions.filter((entry) =>
              entry.allowedTypes.includes(val.Type)
            )
          break
        default:
          this.resetTransfAggrOptions()
      }
    },
    changeTypeForAxisTo (axis, type) {
      switch (axis) {
        case 'xAxis':
          // change type
          this.formValues.xAxis.Type = type
          // update aggregations
          this.aggregationOptionsXAxis = this.aggregationOptions.filter(
            (entry) => entry.allowedTypes.includes(type)
          )
          break
        case 'yAxis':
          this.formValues.yAxis.Type = type
          this.aggregationOptionsYAxis = this.aggregationOptions.filter(
            (entry) => entry.allowedTypes.includes(type)
          )
          break
        case 'z1Axis':
          this.formValues.z1Axis.Type = type
          this.aggregationOptionsZ1Axis = this.aggregationOptions.filter(
            (entry) => entry.allowedTypes.includes(type)
          )
          break
        case 'z2Axis':
          this.formValues.z2Axis.Type = type
          this.aggregationOptionsZ2Axis = this.aggregationOptions.filter(
            (entry) => entry.allowedTypes.includes(type)
          )
          break
      }
    },
    resetInput (input) {
      console.log('Input...', input)
      this.populateColumns()
      this.formValues[input] = ''
    },
    resetState () {
      this.activeStep = 1
      this.$store.dispatch('dataExplorer/clearState')
      this.transformationOptions = [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ]
      this.transformationOptionsXAxis = [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ]
      this.transformationOptionsYAxis = [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ]
      this.transformationOptionsZ1Axis = [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ]
      this.transformationOptionsZ2Axis = [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ]
      this.aggregationOptions = [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ]
      this.aggregationOptionsXAxis = [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ]
      this.aggregationOptionsYAxis = [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ]
      this.aggregationOptionsZ1Axis = [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ]
      this.aggregationOptionsZ2Axis = [
        { allowedTypes: ['NUMBER'], name: 'MIN' },
        { allowedTypes: ['NUMBER'], name: 'MAX' },
        { allowedTypes: ['TEXT', 'NUMBER'], name: 'COUNT' },
        { allowedTypes: ['NUMBER'], name: 'ROUND' },
        { allowedTypes: ['NUMBER'], name: 'AVG' },
        { allowedTypes: ['NUMBER'], name: 'MEDIAN' }
      ]
      this.conditionTransformationOptions = [
        { allowedTypes: ['NUMBER'], name: 'LOG' },
        { allowedTypes: ['TEXT'], name: 'LENGTH' },
        { allowedTypes: ['NUMBER', 'TEXT'], name: 'DISTINCT' }
      ]
      this.errors = []
      this.groupByItems = []
      this.searchGroupBy = null
      this.conditionOperators = ['<', '<=', '=', '>=', '>']
      this.conditionColumn = ''
      this.conditionTransformation = ''
      this.conditionOperator = ''
      this.conditionValue = ''
      this.limitSize = 0
    },
    closeDialogAndProcessResults () {
      this.closeDialog()
      this.$emit('process-results', this.results)
    },
    closeDialogAndLimitResults () {
      this.closeDialog()
      this.$emit('generate-chart', this.limitSize)
    },
    closeDialog () {
      this.$emit('close-dialog', false)
    }
  }
}
</script>

<style>
.form-custom {
  flex-direction: column;
  align-items: center;
  margin-left: 0.25em;
  margin-right: 2em;
  padding-right: 1em;
  min-width: 41%;
  min-height: 75vh;
}

.stepper-main {
  min-height: 75vh;
}

.form-section {
  margin: 0px;
}

.font-small label {
  font-size: 12px;
}

.font-small {
  font-size: 12px;
}

.flex-container {
  display: flex;
  justify-content: space-around;
  flex-direction: row;
}

.flex-container > div {
  margin-left: 3px !important;
}

.flex-container > *:not(:last-child) {
  margin-right: 10px !important;
}

.flex-container > div {
  width: 80%;
}

.chart-container {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.option-entry-additional {
  box-shadow: 0.5px 0px grey;
}

.continue-button-step-one {
  margin-top: 46.85%;
}

.continue-button-step-three {
  margin-top: 16%;
}
</style>
