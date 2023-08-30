import Vue from 'vue'
import Vuetify from 'vuetify/lib'

import ProteinIcon from '@/components/icons/ProteinIcon.vue'
import HelixIcon from '@/components/icons/HelixIcon.vue'
import RiceIcon from '@/components/icons/RiceIcon.vue'
import ArabidopsisIcon from '@/components/icons/ArabidopsisIcon.vue'
import InvertedCurveIcon from '@/components/icons/InvertedCurveIcon.vue'
import MultiPeptideIcon from '@/components/icons/MultiPeptideIcon.vue'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#001bc7',
        secondary: '#f0ab00'
      }
    }
  },
  icons: {
    values: {
      protein: {
        component: ProteinIcon
      },
      helix: {
        component: HelixIcon
      },
      rice: {
        component: RiceIcon
      },
      arabidopsis: {
        component: ArabidopsisIcon
      },
      invertedCurve: {
        component: InvertedCurveIcon
      },
      multiPeptideIcon: {
        component: MultiPeptideIcon
      }
    }
  }
})
