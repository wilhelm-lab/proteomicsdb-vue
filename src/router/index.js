import Vue from 'vue'
import VueRouter from 'vue-router'
import legacyRedirect from './legacy-redirect'
import store from '../store/store'

const Home = () => import('../views/Home.vue')
const About = () => import('../views/AboutUs.vue')
const API = () => import('../views/API.vue')
const API2Documentation = () => import('../views/apiv2documentation/DocuMain.vue')
const FAQ = () => import('../views/FAQ.vue')
const ComingSoon = () => import('../views/ComingSoon.vue')
const Disclaimer = () => import('../views/Disclaimer.vue')
const NotFound = () => import('../views/NotFound.vue')
const CellSensitivity = () => import('../views/analytics/CellSensitivity.vue')
const Analytics = () => import('../views/analytics/AnalyticsWrapper.vue')
const GenericSearch = () => import('../views/search/GenericSearch.vue')
const Protein = () => import('../views/Protein.vue')
const ProteinWrapper = () => import('../views/protein/ProteinWrapper.vue')
const ProteinSummary = () => import('@/views/protein/ProteinSummary.vue')
const Drug = () => import('@/views/Drug')
const DrugWrapper = () => import('../views/drug/DrugWrapper.vue')
const DrugSummary = () => import('@/views/drug/DrugSummary.vue')
const DrugDoseDependentPTM = () => import('@/views/drug/DrugDoseDependentPTM.vue')
const DrugDoseDependentFP = () => import('@/views/drug/DrugDoseDependentFP.vue')
const DrugTargets = () => import('@/views/drug/Targets.vue')
const PeptidesMSMS = () => import('@/views/protein/PeptidesMSMS.vue')
const ReferencePeptides = () => import('@/views/protein/ReferencePeptides.vue')
const FDR = () => import('@/views/protein/FDR.vue')
const ExperimentDesign = () => import('@/views/project/ExperimentDesign.vue')
const Expression = () => import('@/views/protein/Expression.vue')
const InteractionNetwork = () => import('@/views/protein/InteractionNetwork.vue')
const FeatureViewer = () => import('@/views/protein/FeatureViewer.vue')
// const DataExplorer = () => import('@/views/dataExplorer/DataExplorer.vue')
const PeptideDetails = () => import('@/views/protein/PeptideDetails.vue')
const ReferencePeptideDetails = () => import('@/views/protein/ReferencePeptideDetails.vue')
const Proteotypicity = () => import('@/views/protein/Proteotypicity.vue')
const ProteaseMap = () => import('@/views/protein/ProteaseMap.vue')
const ProteinProjects = () => import('@/views/protein/ProteinProjects.vue')
const Inhibitors = () => import('@/views/protein/Inhibitors.vue')
const Meltome = () => import('@/views/protein/Meltome.vue')
const Turnover = () => import('@/views/protein/Turnover.vue')
const ProteinDoseDependentPTMs = () => import('@/views/protein/ProteinDoseDependentPTM.vue')
const ProteinDoseDependentFP = () => import('@/views/protein/ProteinDoseDependentFP.vue')
const ProteinTimeDependentPTMs = () => import('@/views/protein/ProteinTimeDependentPTM.vue')
const ProteinTimeDependentFP = () => import('@/views/protein/ProteinTimeDependentFP.vue')
const DecryptMLandingPage = () => import('../views/DecryptMLandingPage')
const DecryptELandingPage = () => import('../views/DecryptELandingPage')
const SarcomaLandingPage = () => import('../views/SarcomaLandingPage')
const PyInteractionLandingPage = () => import('../views/PyInteractionLandingPage')
const SelectivityView = () => import('../views/analytics/SelectivityView')
const AnalyticsHome = () => import('../views/analytics/AnalyticsHome')
const ExpressionHeatmap = () => import('../views/analytics/ExpressionHeatmap')
const ProteinDrugInteractionView = () => import('../views/analytics/ProteinDrugInteractionView')
// const Community = () => import('../views/community/IdeaOverview.vue')
// const IdeaSubmission = () => import('../views/community/IdeaSubmission.vue')
// const IdeaDetails = () => import('../views/community/IdeaDetails.vue')
const ProjectWrapper = () => import('@/views/project/ProjectWrapper')
const ProjectDetails = () => import('@/views/project/ProjectDetails')
const ExperimentDetails = () => import('@/views/project/ExperimentDetails')
const SampleDetails = () => import('@/views/project/SampleDetails')
const CustomDataUpload = () => import('@/views/analytics/CustomDataUpload')
const PTMNavigator = () => import('@/views/analytics/PTMNavigator')
const DecryptMDashboard = () => import('@/views/analytics/DecryptMDashboard')

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.VUE_APP_ROUTER_BASE || '/',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        helpKey: 'overview'
      }
    },
    {
      path: '/drug',
      name: 'drugHome',
      component: Drug,
      meta: {
        availableOrganisms: [9606],
        redirectOnOrganismSelectTo: 'drugHome'
      },
      children: [
        {
          path: ':drugId',
          name: 'drug',
          component: DrugWrapper,
          meta: {
            helpKey: 'summaryTab'
          },
          children: [
            {
              path: 'summary',
              name: 'drugSummary',
              component: DrugSummary,
              meta: {
                helpKey: 'drugcentric/drugSummary'
              }
            },
            {
              path: 'drugddptm',
              name: 'drugDoseDependentPTMs',
              component: DrugDoseDependentPTM,
              meta: {
                helpKey: 'drugcentric/drugddPTM'
              }
            },
            {
              path: 'drugddfp',
              name: 'drugDoseDependentFP',
              component: DrugDoseDependentFP,
              meta: {
                helpKey: 'drugcentric/drugddFP'
              }
            },
            {
              path: 'targets',
              name: 'drugTargets',
              component: DrugTargets,
              meta: {
                helpKey: '' // TODO: Drug Help
              }
            }
          ]
        }
      ]
    },
    {
      path: '/project',
      name: 'projectHome',
      component: ProjectWrapper,
      children: [
        {
          path: ':projectId',
          name: 'project',
          component: ProjectDetails,
          meta: {
            redirectOnOrganismSelectTo: 'projectHome'
          }
        },
        {
          path: ':projectId/experiment/:experimentId',
          name: 'projectExperiment',
          props: true,
          component: ExperimentDetails,
          meta: {
            redirectOnOrganismSelectTo: 'projectHome'
          }
        },
        {
          path: ':projectId/experiment/:experimentId/sample/:sampleId',
          name: 'projectExperimentSample',
          props: true,
          component: SampleDetails,
          meta: {
            redirectOnOrganismSelectTo: 'projectHome'
          }
        },
        {
          path: ':projectId/experiment/:experimentId/design/:expDesignId',
          name: 'projectExperimentDesign',
          props: true,
          component: ExperimentDesign,
          meta: {
            redirectOnOrganismSelectTo: 'projectHome'
          }
        }
      ]
    },
    {
      path: '/protein/',
      name: 'proteinHome',
      component: Protein,
      meta: {
        redirectOnOrganismSelectTo: 'proteinHome'
      },
      children: [
        {
          path: ':proteinId/',
          name: 'protein',
          component: ProteinWrapper,
          redirect: { name: 'proteinSummary' },
          children: [
            {
              path: 'summary',
              name: 'proteinSummary',
              component: ProteinSummary,
              meta: {
                helpKey: 'summaryTab'
              }
            },
            {
              path: 'featureViewer',
              name: 'proteinFeatureViewer',
              component: FeatureViewer
            },
            {
              path: 'peptides',
              name: 'proteinPeptidesMSMS',
              component: PeptidesMSMS,
              meta: {
                helpKey: 'peptidesTab'
              },
              children: [
                {
                  path: ':peptideId',
                  name: 'proteinPeptidesMSMSDetails',
                  component: PeptideDetails
                }
              ]
            },
            {
              path: 'referencePeptides',
              name: 'proteinReferencePeptides',
              component: ReferencePeptides,
              meta: {
                helpKey: 'referencePeptidesTab'
              },
              children: [
                {
                  path: ':peptideId',
                  name: 'proteinReferencePeptidesDetails',
                  component: ReferencePeptideDetails
                  // TODO: No help exists for this component - and the help modal would not be visible right now, since the popup is placed on top of it
                }
              ]
            },
            {
              path: 'proteotypicity',
              name: 'proteinProteotypicity',
              component: Proteotypicity,
              meta: {
                helpKey: 'proteotypicityTab'
              },
              children: [
                {
                  path: ':peptideId',
                  name: 'proteinProteotypicityPeptidesDetails',
                  component: PeptideDetails
                }
              ]
            },
            {
              path: 'protease-map',
              name: 'proteinProteaseMap',
              component: ProteaseMap,
              meta: {
                helpKey: '' // TODO: Protease Map help
              }
            },
            {
              path: 'projects',
              name: 'proteinProjects',
              component: ProteinProjects,
              meta: {
                helpKey: 'projectsTab'
              }
            },
            {
              path: 'expression',
              name: 'proteinExpression',
              component: Expression,
              meta: {
                helpKey: 'expressionTab'
              }
            },
            {
              path: 'fdr',
              name: 'proteinFDR',
              component: FDR,
              meta: {
                helpKey: 'fdrTab'
              }
            },
            {
              path: 'interactions',
              name: 'proteinInteractionNetwork',
              component: InteractionNetwork,
              meta: {
                helpKey: 'interactionsTab'
              }
            },
            {
              path: 'inhibitors',
              name: 'proteinInhibitors',
              component: Inhibitors,
              meta: {
                helpKey: 'assayTab'
              }
            },
            {
              path: 'meltome',
              name: 'proteinMeltome',
              component: Meltome
            },
            {
              path: 'turnover',
              name: 'proteinTurnover',
              component: Turnover,
              meta: {
                helpKey: 'assayTab'
              }
            },
            {
              path: 'proteinddptm',
              name: 'proteinDoseDependentPTMs',
              component: ProteinDoseDependentPTMs,
              meta: {
                helpKey: 'proteinddPTM'
              }
            },
            {
              path: 'proteinddfp',
              name: 'proteinDoseDependentFP',
              component: ProteinDoseDependentFP,
              meta: {
                helpKey: 'proteinddFP'
              }
            },
            {
              path: 'tdptm',
              name: 'proteinTimeDependentPTMs',
              component: ProteinTimeDependentPTMs,
              meta: {
                helpKey: 'proteintdPTM'
              }
            },
            {
              path: 'tdfp',
              name: 'proteinTimeDependentFP',
              component: ProteinTimeDependentFP,
              meta: {
                helpKey: 'proteintdFP'
              }
            }
          ]
        }
      ]
    },
    {
      path: '/search',
      name: 'genericSearch',
      component: GenericSearch,
      meta: (route) => ({
        helpKey: route.query.type
      })
    },
    {
      path: '/peptide',
      name: 'peptide',
      component: ComingSoon
    },
    {
      path: '/api',
      name: 'api',
      component: API
    },
    {
      path: '/faq',
      name: 'faq',
      component: FAQ
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/apiv2',
      name: 'apiv2',
      component: API2Documentation
    },
    {
      path: '/disclaimer',
      name: 'disclaimer',
      component: Disclaimer
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: Analytics,
      meta: {
        redirectOnOrganismSelectTo: 'analyticsHome'
      },
      redirect: { name: 'analyticsHome' },
      children: [
        {
          path: '',
          name: 'analyticsHome',
          component: AnalyticsHome,
          meta: {
            helpKey: 'analytics'
          }
        },
        {
          path: 'expressionHeatmap',
          name: 'analyticsExpressionHeatmap',
          component: ExpressionHeatmap,
          meta: {
            helpKey: 'analyticsExpressionHeatmap'
          }
        },
        {
          path: 'selectivity',
          name: 'analyticsSelectivity',
          component: SelectivityView,
          meta: {
            helpKey: 'analyticsDrugSensitivityPrediction',
            availableOrganisms: [9606]
          }
        },
        {
          path: 'proteinDrugInteraction',
          name: 'analyticsProteinDrugInteraction',
          component: ProteinDrugInteractionView,
          meta: {
            helpKey: 'analyticsCombinationTreatment',
            availableOrganisms: [9606]
          }
        },
        {
          path: 'ptmNavigator',
          name: 'analyticsPTMNavigator',
          component: PTMNavigator
        },
        {
          path: 'pathwayExplorer',
          name: 'analyticsPTMNavigator',
          component: PTMNavigator
        },
        {
          path: 'decryptMDashboard',
          name: 'analyticsDecryptMDashboard',
          component: DecryptMDashboard
        },
        {
          path: 'customDataUpload',
          name: 'analyticsCustomDataUpload',
          component: CustomDataUpload,
          meta: {
            helpKey: 'analyticsCustomDataUpload'
          }
        },
        {
          path: 'cellSensitivity',
          name: 'analyticsCellSensitivity',
          component: CellSensitivity,
          meta: {
            helpKey: 'analyticsCellLineSensitivity',
            availableOrganisms: [9606]
          }
        },
        {
          path: 'combinationTreatment',
          name: 'analyticsCombinationTreatment',
          component: ComingSoon,
          meta: {
            availableOrganisms: [9606]
          }
        }
        // {
        //   path: 'dataExplorer',
        //   name: 'dataExplorer',
        //   meta: {
        //     helpKey: 'dataExplorer'
        //   },
        //   component: DataExplorer
        // }
      ]
    },
    {
      path: '/decryptm',
      name: 'decryptmLanding',
      component: DecryptMLandingPage,
      meta: {
        availableOrganisms: [9606]
      }
    },
    {
      path: '/decrypte',
      name: 'decrypteLanding',
      component: DecryptELandingPage,
      meta: {
        availableOrganisms: [9606]
      }
    },
    {
      path: '/sarquarium',
      name: 'sarcomaLanding',
      component: SarcomaLandingPage

    },
    {
      path: '/pyinteractions',
      name: 'PYInteractionLanding',
      component: PyInteractionLandingPage

    },
    // {
    //   path: '/community',
    //   name: 'community',
    //   component: Community
    // },
    // {
    //   path: '/community/ideaSubmission',
    //   name: 'ideaSubmission',
    //   component: IdeaSubmission
    // },
    // {
    //   path: '/community/:id',
    //   name: 'idea',
    //   component: IdeaDetails
    // },
    {
      path: '/:pathMatch(.*)',
      component: NotFound,
      meta: {
        // Disable matomo tracking for this route. Tracking of 404s is handled by
        // explicitly by the `NotFound` component.
        analyticsIgnore: true
      }
    }
  ]
})

router.beforeEach(legacyRedirect)

router.beforeEach((to, from, next) => {
  if (to.matched.some(m => typeof m.components.default === 'function')) {
    store.commit('setIsPageLoading', true)
  }
  next()
})

router.beforeResolve((to, from, next) => {
  store.commit('setIsPageLoading', false)
  next()
})

export default router
