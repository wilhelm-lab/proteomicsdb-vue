//This script used to be an exact copy of https://github.com/ebi-webcomponents/protvista-uniprot/blob/master/src/protvista-uniprot-structure.js
//That project has been converted to TypeScript, so I couldn't just copy pase the new version to add AlphaFold to ProteomicsDB
//Instead, only the relevant code has been copied and translated back to plain JavaScript. 

import { LitElement, html, css } from "lit-element";
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { load } from "data-loader";
import ProtvistaStructure from "protvista-structure";
import ProtvistaDatatable from "protvista-datatable";
import { loadComponent } from "./loadComponents";

const PDBLinks = [
  { name: "PDB", link: "https://www.ebi.ac.uk/pdbe-srv/view/entry/" },
  { name: "RCSB-PDB", link: "https://www.rcsb.org/structure/" },
  { name: "PDBj", link: "https://pdbj.org/mine/summary/" },
  { name: "PDBsum", link: "https://www.ebi.ac.uk/pdbsum/" },
];
const alphaFoldLink = 'https://alphafold.ebi.ac.uk/entry/';

const processPDBData = (data) =>
  data.dbReferences
    .filter((xref) => xref.type === "PDB")
    .sort((refA, refB) => refA.id.localeCompare(refB.id))
    .map(({ id, properties }) => {
      if (!properties) {
        return null;
      }
      const { chains, resolution, method } = properties;

      let chain;
      let positions;
      if (chains) {
        const tokens = chains.split("=");
        if (tokens.length === 2) {
          [chain, positions] = tokens;
        }
      }
      return {
        id,
        source: 'PDB',
        method,
        resolution: !resolution || resolution === "-" ? null : resolution,
        downloadLink: `https://www.ebi.ac.uk/pdbe/entry-files/download/pdb${id.toLowerCase()}.ent`,
        chain,
        positions,
        protvistaFeatureId: id,
      };
    }).filter((transformedItem) => transformedItem !== undefined);

const processAFData = (data) =>
  data.map((d) => ({
    id: d.entryId,
    source: 'AlphaFold',
    method: 'Predicted',
    positions: `${d.uniprotStart}-${d.uniprotEnd}`,
    protvistaFeatureId: d.entryId,
    downloadLink: d.pdbUrl,
  }));

const styleId = 'protvista-styles';
class ProtvistaUniprotStructure extends LitElement {
  constructor() {
    super();
    loadComponent("protvista-structure", ProtvistaStructure);
    loadComponent("protvista-datatable", ProtvistaDatatable);
    this.loading = true;
    this.onTableRowClick = this.onTableRowClick.bind(this);
    this.addStyles()
  }

  static get properties() {
    return {
      accession: { type: String },
      structureId: { type: String },
      data: { type: Object },
      highlightresidues: { type: String }
    };
  }

  async connectedCallback() {
    super.connectedCallback();
    if (!this.accession) return;
    const pdbUrl = `https://www.ebi.ac.uk/proteins/api/proteins/${this.accession}`;
    const alphaFoldURl = `https://alphafold.ebi.ac.uk/api/prediction/${this.accession}`;
    
    const rawData = {};

    Promise.all(
      [pdbUrl, alphaFoldURl].map((url) => 
        load(url).then( 
          (data) => (rawData[url] = data.payload),
          // TODO handle this better based on error code
          // Fail silently for now
          (error) => console.warn(error)
       ) 
      )
    ).then( () => {
        this.loading = false;
        const pdbData = processPDBData(rawData[pdbUrl] || []);
        const afData = processAFData(rawData[alphaFoldURl] || []);
        const data = [...pdbData, ...afData];
        if (!data || !data.length) return;

        this.data = data;
    })
  }

  disconnectedCallback() {
    this.removeStyles();
  }

  updated() {
    const protvistaDatatableElt = this.querySelector('protvista-datatable');
    if (protvistaDatatableElt && !protvistaDatatableElt.selectedid && this.data && this.data[0]) {
      // Select the first element in the table
      this.onTableRowClick({ id: this.data[0].id });
      protvistaDatatableElt.selectedid = this.structureId;
    }
  }

  addStyles() {
    // We are not using static get styles()
    // as we are not using the shadowDOM
    // because of Mol*
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.innerHTML = `
      ${this.cssStyle}
      `;
      const head = document.querySelector('head')
      if(head){ 
        head.append(styleTag);
      }
    }
  }

  removeStyles() {
    const styleTag = document.getElementById(styleId);
    if (styleTag) {
      styleTag.remove();
    }
  }

  onTableRowClick({ id }) {
    this.structureId = id;
  }

  get cssStyle() {
    return css`
      .protvista-uniprot-structure {
        z-index: 40000;
        position: relative;
      }
      
      .protvista-uniprot-structure__structure {
        display: flex;
      }
      .protvista-uniprot-structure__meta {
        flex: 1;
        padding: 1rem;
      }
      .protvista-uniprot-structure__structure protvista-structure {
        z-index: 40000;
        width: 100%;
        flex: 4;
      }
      .protvista-uniprot-structure__meta .small {
        font-size: 0.75rem;
      }
      .protvista-uniprot-structure__meta .no-bullet {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .protvista-uniprot-structure__meta .no-bullet li {
        padding: 0;
        margin: 0.5rem 0;
      }
      .protvista-uniprot-structure__meta .af-legend::before {
        content: '';
        margin: 0;
        display: inline-block;
        width: 20px;
        height: 16px;
      }
      .download-link svg {
        width: 1rem;
      }
      select {
        appearance: auto !important;
        border: 1px solid !important;
        padding: 0.25em 0.5em;
        font-size: 0.75rem !important;
      }

      tr {
        position: relative;
        z-index: 1 !important;
      }


    `;
  }

  /**
   * LiteMol doesn't work well with the Shadow DOM, therefore
   * we need to use the light DOM.
   * */
  createRenderRoot() {
    return this;
  }

  render() {
      this.addStyles()
    return html`
    <div class="protvista-uniprot-structure">
        ${this.structureId
                ? html`
                    <protvista-structure
                            structureid=${this.structureId}
                            accession=${this.accession}
                            highlight="${this.highlightresidues}"
                    ></protvista-structure>`
                : html``}
      </div>
        ${this.data && this.data.length
          ? html`<protvista-datatable noScrollToRow noDeselect filter-scroll>
              <table>
                <thead>
                  <tr>
                    <th data-filter="source">Source</th>
                    <th>Identifier</th>
                    <th>Method</th>
                    <th>Resolution</th>
                    <th>Chain</th>
                    <th>Positions</th>
                    <th>Links</th>
                    <th><!--Download--></th>
                  </tr>
                </thead>
                <tbody>
                  ${this.data.map(
                    ({
                      source,
                      id,
                      method,
                      resolution,
                      chain,
                      positions,
                      downloadLink,
                    }) => html`<tr
                      data-id="${id}"
                      @click="${() => this.onTableRowClick({ id })}"
                    >
                      <td data-filter="source" data-filter-value="${source}">
                        <strong>${source}</strong>
                      </td>
                      <td>${id}</td>
                      <td>${resolution ? resolution.replace('A', 'Å') : ''}</td>
                      <td>${chain || ''}</td>
                      <td>${positions || ''}</td>
                      <td>
                        ${source === 'PDB'
                          ? html`
                              ${PDBLinks.map((pdbLink) => {
                                return html`
                                  <a target='_blank' href="${pdbLink.link}${id}"
                                    >${pdbLink.name}</a
                                  >
                                `;
                              }).reduce(
                                (prev, curr) => html` ${prev} · ${curr} `
                              )}
                            `
                          : html`<a target='_blank' href="${alphaFoldLink}${this.accession}"
                              >AlphaFold</a
                            >`}
                      </td>
                      <td>
                        ${downloadLink
                          ? html`<a target="_blank" href="${downloadLink}" class="download-link">Download</a>`
                          : ''}
                      </td>
                    </tr>`
                  )}
                </tbody>
              </table>
            </protvista-datatable>`
          : html``}
          ${!this.data && !this.loading
            ? html`<div>
                No structure information available for ${this.accession}
              </div>`
            : html``}
    `;
  }
}

export default ProtvistaUniprotStructure;
