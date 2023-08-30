
import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: false,
  loading: false,
  menu: {
    label: 'FDR estimation',
    showDataCount: true
  },
  routeName: 'proteinFDR'
}

const getters = {
  // Hard-coding count to 2 since there's always Protein- & Gene-level FDR
  getDataCount: () => 2,
  hasData: () => true
}

export default createTabModule({
  state,
  getters
})
