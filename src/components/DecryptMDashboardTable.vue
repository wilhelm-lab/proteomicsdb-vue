<template>
    <DxDataGrid
        :ref="dataGridRefName"
        :data-source="dataIn"
        :show-borders="true"
        :repaint-changes-only="false"
        :column-auto-width="true"
        :allow-column-resizing="true"
        column-resizing-mode="widget"
        :allow-column-reordering="true"
        :selection="{ mode: 'multiple', allowSelectAll: false }"
        :column-chooser="{ mode: 'select', height: 400 }"
        :hover-state-enabled="true"
        @initialized="saveGridInstance"
        @selection-changed="onSelectionChanged"
    >
        <DxFilterRow :visible="true"/>
        <DxHeaderFilter
            :visible="true"
            :allow-search="true"
            :width="300"
        />
        <DxColumn
            caption="Curve ID"
            data-field="CURVE_ID"
            :visible="false"
            data-type="number"
            alignment="left"
        /><!-- For Debugging -->
        <DxColumn
            :width="200"
            caption="Experiment Name"
            data-field="EXPERIMENT_NAME"
            data-type="string"
            alignment="left"
        />
        <DxColumn
            :width="250"
            caption="Modified Sequence"
            data-field="MOD_SEQUENCE"
            data-type="string"
            alignment="left"
        />
        <DxColumn
            :width="150"
            caption="Modification Type"
            data-type="string"
            alignment="left"
            :allow-search="true"
            :allow-filtering="true"
            :calculate-cell-value="d => calculateModificationType(d.MOD_SEQUENCE)"
        />
        <DxColumn
            :width="150"
            caption="PhosphoSitePlus®"
            :calculate-cell-value="generatePSPTuples"
            cell-template="pspTemplate"
            data-type="string"
            :allow-sorting="true"
            :allow-filtering="true"
            :calculate-sort-value="calculatePhosphoSortValue"
            :calculate-filter-expression="calculatePhosphoFilterExpression"
            data-field="MOD_RSD"
            alignment="left"
        >
            <DxHeaderFilter
                :data-source="pspHeaderFilterData"
            />
        </DxColumn>
        <template #pspTemplate="{ data }">
            <div style="display: flex">
                <div
                    v-for="(psite, i) in data.value"
                    :key="psite.ACC_ID + '-' + psite.MOD_RSD + '-' + i + '-div'"
                >
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-chip
                                link
                                small
                                class="dataChip"
                                :color="
                  psite.LT_LIT > 0
                    ? 'light-green'
                    : psite.HT_LIT > 0
                      ? 'orange lighten-2'
                      : 'red lighten-4'
                "
                                v-bind="attrs"
                                v-on="on"
                            >
                                <a
                                    :href="createPSPLink(psite.ACC_ID)"
                                    target="_blank"
                                >{{
                                        psite.MOD_RSD
                                    }}</a>
                            </v-chip>
                        </template>
                        <span>UniprotID: {{ psite.ACC_ID }}<br>
              Low-Throughput References: {{ psite.LT_LIT }}<br>
              High-Throughput References: {{ psite.HT_LIT }}</span>
                    </v-tooltip>
                </div>
            </div>
        </template>
        <DxColumn
            :width="100"
            caption="Gene Name"
            :calculate-cell-value="(d) => d.GENE_NAMES ? d.GENE_NAMES.split(';')[0] : ''"
            :allow-sorting="true"
            :allow-filtering="true"
        />
        <DxColumn
            :width="100"
            caption="Uniprot ID"
            :calculate-cell-value="(d) => d.UNIPROT_ACCS ? d.UNIPROT_ACCS.split(';')[0] : ''"
            :allow-sorting="true"
            :allow-filtering="true"
        />
        <DxColumn
            :width="100"
            caption="Regulation"
            data-field="REGULATION"
            data-type="string"
            cell-template="regulationTemplate"
            alignment="left"
        />
        <template #regulationTemplate="{ data }">
            <v-icon
                v-if="data.value === 'up'"
                color="#ea0000"
            >
                mdi-arrow-up-bold
            </v-icon>
            <v-icon
                v-else-if="data.value === 'down'"
                color="#252bff"
            >
                mdi-arrow-down-bold
            </v-icon>
            <v-icon
                v-else-if="data.value === '-'"
                color="#000000"
            >
                mdi-minus
            </v-icon>
        </template>
        <!--TODO: Put duration in the backend-->
        <!--    <DxColumn-->
        <!--        :width="100"-->
        <!--        caption="Duration"-->
        <!--        data-type="string"-->
        <!--        :allow-sorting="true"-->
        <!--        :allow-filtering="true"-->
        <!--        :calculate-cell-value="createDurationString"-->
        <!--        alignment="left"-->
        <!--    />-->
        <DxColumn
            :width="125"
            alignment="left"
            caption="-Log10(EC50)"
            data-field="pEC50"
            sort-order="desc"
            :allow-header-filtering="false"
            selected-filter-operation="<="
            data-type="number"
        >
            <DxFormat
                type="fixedPoint"
                :precision="2"
            />
        </DxColumn>
        <DxColumn
            :width="100"
            alignment="left"
            caption="Fold Change"
            data-field="Fold change"
            :calculate-cell-value="d => getFoldChange(d)"
            :allow-header-filtering="false"
            selected-filter-operation=">="
            data-type="number"
        >
            <DxFormat
                type="fixedPoint"
                :precision="2"
            />
        </DxColumn>
        <DxColumn
            :width="100"
            alignment="left"
            caption="R²"
            data-field="R2"
            :allow-header-filtering="false"
            selected-filter-operation=">="
            :filter-value="0.0"
            data-type="number"
        >
            <DxFormat
                type="fixedPoint"
                :precision="2"
            />
        </DxColumn>
        <DxColumn
            :width="200"
            caption="Alternative Gene Names"
            :calculate-cell-value="d => getAlternativeNames(d.GENE_NAMES)"
            :allow-sorting="true"
            :allow-filtering="true"
        />
        <DxColumn
            :width="200"
            caption="Alternative Uniprot IDs"
            :calculate-cell-value="d => getAlternativeNames(d.UNIPROT_ACCS)"
            :allow-sorting="true"
            :allow-filtering="true"
        />
        <DxPaging :page-size="10"/>
        <DxPager
            :show-page-size-selector="true"
            :allowed-page-sizes="[5, 10, 25]"
        />
    </DxDataGrid>
</template>

<script>
import {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxFormat,
    DxHeaderFilter
} from 'devextreme-vue/data-grid'

import downloadUtils from '@/utils/downloadUtils'

export default {
    name: 'DecryptMDashboardTable',
    components: {
        DxDataGrid,
        DxColumn,
        DxPaging,
        DxPager,
        DxFilterRow,
        DxFormat,
        DxHeaderFilter
    },
    props: {
        dataGridRefName: {
            type: String,
            default: 'assayGrid'
        },
        dataIn: {
            type: Array,
            default: () => []
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        toggleColumnChooser: {
            type: Boolean,
            default: false
        },
        filterForRegulated: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        dataGridInstance: null
    }),
    computed: {
        pspHeaderFilterData: function () {
            const pspSet = [...new Set(this.dataIn.filter(d => d.MOD_RSD).map(d => d.MOD_RSD.split('|')).flat())]
            return pspSet.map(psp => {
                return {text: psp, value: psp}
            })
        }
    },
    watch: {
        toggleColumnChooser() {
            const dataGrid = this.$refs[this.dataGridRefName].instance
            dataGrid.showColumnChooser()
        },
        isLoading: {
            immediate: true,
            handler(newValue) {
                if (this.dataGridInstance) {
                    if (newValue) {
                        this.dataGridInstance.beginCustomLoading()
                    } else {
                        this.dataGridInstance.endCustomLoading()
                        // Clear filter and selected rows after new data has been loaded
                        this.dataGridInstance.clearFilter()
                        this.onSelectionChanged([])
                    }
                }
            }
        }
    },
    methods: {
        saveGridInstance: function (e) {
            this.dataGridInstance = e.component
            // The isLoading watcher is triggered before we arrive here, but the loading indicator cannot be shown
            // before this function has been run. So we need to check again whether we are in a loading state
            if (this.isLoading) {
                this.dataGridInstance.beginCustomLoading()
            }
        },
        onSelectionChanged({selectedRowsData}) {
            this.$emit('selected-rows-changed', selectedRowsData)
        },
        onExporting(datasetName) {
            downloadUtils.downloadDxDataGridCSV(
                datasetName + '_ddPTM.csv',
                this.$refs[this.dataGridRefName],
                {
                    MOD_RSD: (data) => data.MOD_RSD
                }
            )
        },
        calculateModificationType: function (modifiedSequence) {
            if (!modifiedSequence) return ''
            // The cryptic '(?!^)' ignores N-terminal modifications, which we do not consider biological
            const modlist = modifiedSequence.match(/(?!^)\([a-z]+\)/g)
            if (modlist) {
                return [...new Set(
                    modlist.map(mod => {
                        switch (mod) {
                            case '(ph)':
                                return 'Phospho'
                            case '(ac)':
                                return 'Acetyl'
                            case '(ub)':
                                return 'Ubi'
                            default:
                                return 'Unknown'
                        }
                    })
                )]
                    .join(', ')
            } else {
                return 'Unmodified'
            }
        },
        generatePSPTuples: function (rowData) {
            if (rowData.ACC_ID) {
                // Turn the concatenated entries into individual objects
                const accIds = rowData.ACC_ID.split('|')
                const ltLits = rowData.LT_LIT.split('|')
                const htLits = rowData.HT_LIT.split('|')
                const modRsds = rowData.MOD_RSD.split('|')

                return [...new Set(
                    // Make it a unique list by stringifying them, turning the strings into a set, and parsing them back
                    accIds.map(function (accId, i) {
                        return JSON.stringify({
                            LT_LIT: ltLits[i],
                            HT_LIT: htLits[i],
                            MOD_RSD: modRsds[i],
                            ACC_ID: accId
                        })
                    }))]
                    .map((s) => JSON.parse(s))
                    // Sort and return
                    .sort((a, b) =>
                        (a.LT_LIT < b.LT_LIT)
                            ? 1
                            : ((a.LT_LIT === b.LT_LIT)
                                ? ((a.HT_LIT < b.HT_LIT)
                                    ? 1
                                    : -1)
                                : -1)
                    )
            } else {
                return []
            }
        },
        createPSPLink: function (accId) {
            return 'http://www.phosphosite.org/uniprotAccAction?id=' + accId
        },
        calculatePhosphoSortValue: function (rowData) {
            // MOD_RSD contains a ;-separated list of p-sites, each looking like this: Y123-p
            // Extract the position from each p-site and return the smallest of those
            return rowData.MOD_RSD
                ? Math.min(...rowData.MOD_RSD.split(';')
                    .map(s => s.substring(1).split('-')[0]))
                : Number.MAX_VALUE
        },
        calculatePhosphoFilterExpression: function (filterValue, selectedFilterOperation, target) {
            // We are searching in an array, so the header filter will not work - it would compare strings to arrays
            // Therefore, if the target of the filter is the header, we convert the '=' into a 'contains' filter
            if (target === 'headerFilter' && selectedFilterOperation === '=') {
                selectedFilterOperation = 'contains'
            }
            // The filter expression is a triple: The first value is a callback that generates the data source from the row,
            // the second is the filter Operation (e.g. 'contains') and the third is the value to filter by
            return [
                (rowData) => {
                    return rowData.MOD_RSD ? rowData.MOD_RSD.split('|') : ''
                },
                selectedFilterOperation,
                filterValue
            ]
        },
        getAlternativeNames(names) {
            if (!names) return ''
            const namesArr = names.split(';')
            // Get all unique names from the second to last element
            const alternativeNamesSet = new Set(namesArr.slice(1))
            // Make sure the first element (the original name) is not contained in this set
            alternativeNamesSet.delete(namesArr[0])
            // Return it as a formatted string
            return [...alternativeNamesSet].join(', ')
        },
        getFoldChange(rowData) {
            return rowData.FOLD_CHANGE || rowData.foldchange
        }
        // getInitialRegulationFilterValue () {
        //   return this.filterForRegulated ? '-' : null
        // }
    }
}
</script>

<style lang="scss">
.dx-data-row.dx-state-hover {
    cursor: pointer;
}

.dx-datagrid-rowsview .dx-scrollable-content {
    padding-bottom: 15px;
}
</style>
