import Protvista from "./protvista";

import ProtvistaNavigation from "protvista-navigation";
import ProtvistaTooltip from "protvista-tooltip";
import ProtvistaInterproTrack from "protvista-interpro-track";
import ProtvistaSequence from "protvista-sequence";
import ProtvistaVariation from "protvista-variation";
import ProtvistaVariationGraph from "protvista-variation-graph";
import ProtvistaFilter from "protvista-filter";
import ProtvistaManager from "protvista-manager";
import ProtvistaUniprotStructure from "./protvista-uniprot-structure";

// Overwrite Protvista Track
import ProtvistaTrack from "./protvista-track/ProtvistaTrack";

import {transformData as _transformDataFeatureAdapter} from "protvista-feature-adapter";
import {transformData as _transformDataProteomicsAdapter} from "protvista-proteomics-adapter";
import {transformData as _transformDataStructureAdapter} from "protvista-structure-adapter";
import {transformData as _transformDataVariationAdapter} from "protvista-variation-adapter";
import {transformData as _transformDataProteomicsdbAdapter} from "./ProtvistaProteomicsdbAdapter";
import {transformData as _transformDataPredictProteinAdapter} from "./ProtvistaPredictProteinAdapter";
import {transformData as _transformDataSnap2Adapter} from "./ProtvistaSnap2Adapter";

export const transformDataFeatureAdapter = _transformDataFeatureAdapter;
export const transformDataProteomicsAdapter = _transformDataProteomicsAdapter;
export const transformDataStructureAdapter = _transformDataStructureAdapter;
export const transformDataVariationAdapter = _transformDataVariationAdapter;
export const transformDataProteomicsdbAdapter = _transformDataProteomicsdbAdapter;
export const transformDataPredictProteinAdapter = _transformDataPredictProteinAdapter;
export const transformDataSnap2Adapter = _transformDataSnap2Adapter;

const adapters = {
  "protvista-proteomics-adapter": transformDataProteomicsAdapter,
  "protvista-proteomicsdb-adapter": transformDataProteomicsdbAdapter,
  "protvista-predictprotein-adapter": transformDataPredictProteinAdapter,
  "protvista-snap2-adapter": transformDataSnap2Adapter
};

const components = {
  protvista_navigation: ProtvistaNavigation,
  protvista_tooltip: ProtvistaTooltip,
  protvista_track: ProtvistaTrack,
  protvista_interpro_track: ProtvistaInterproTrack,
  protvista_sequence: ProtvistaSequence,
  protvista_variation: ProtvistaVariation,
  protvista_variation_graph: ProtvistaVariationGraph,
  protvista_filter: ProtvistaFilter,
  protvista_manager: ProtvistaManager,
  protvista_uniprot_structure: ProtvistaUniprotStructure
};

class ProtvistaProteomicsdb extends Protvista {

  constructor() {
    super(
      {
        adapters,
        components,
        getConfig: undefined
      }
    );
    this.getConfig = async function getConfig() {
      return fetch(this.url).then(res => res.json());
    };
  }

  static get properties() {
    return {
      url: { type: String },
    };
  }

  shouldUpdate(changedProperties) {
    // Quick hack to force reload when config url changes
    if (changedProperties.has("url")) {
      this.getConfig().then(config => {
        this.config = config;
        this._loadData();
      });
    }
    return super.shouldUpdate(changedProperties);
  }
}

export default ProtvistaProteomicsdb;
