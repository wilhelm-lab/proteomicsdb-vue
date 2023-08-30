const binary = require('./binary');

var Annotation = class Annotation {

  constructor(request){

    this.ChemistryConstants = {
      Proton: 1.007276466879,
      Na: 22.9897692820,
      H: 1.00782503223,
      h: 2.01410177812,
      C: 12.0,
      c: 13.00335483507,
      N: 14.00307400443,
      n: 15.00010889888,
      O: 15.99491461957,
      o: 17.99915961286,
      P: 30.97376199842,
      S: 31.9720711744
    };
    this.N_TERMINUS = this.ChemistryConstants.H;
    this.C_TERMINUS = this.ChemistryConstants.O + this.ChemistryConstants.H;
    this.B_ION_TERMINUS = this.ChemistryConstants.Proton; // wiki
    this.A_ION_TERMINUS = this.B_ION_TERMINUS - this.ChemistryConstants.C - this.ChemistryConstants.O; // wiki
    this.C_ION_TERMINUS = (2+1) * this.ChemistryConstants.H + this.ChemistryConstants.N - this.ChemistryConstants.Proton; 

    this.Y_ION_TERMINUS = this.ChemistryConstants.Proton + 2* this.ChemistryConstants.H + this.ChemistryConstants.O;
    this.X_ION_TERMINUS = this.ChemistryConstants.Proton + 2* this.ChemistryConstants.H + this.ChemistryConstants.O;
    this.Z_ION_TERMINUS = this.ChemistryConstants.Proton + 2* this.ChemistryConstants.H + this.ChemistryConstants.O;

    this.AminoAcids = {
      A: 71.037114,
      C: 103.00919,
      D: 115.02694,
      E: 129.04259,
      F: 147.06841,
      G: 57.021464,
      H: 137.05891,
      I: 113.08406,
      K: 128.09496,
      L: 113.08406,
      M: 131.04048,
      N: 114.04293,
      P: 97.052764,
      Q: 128.05858,
      R: 156.10111,
      S: 87.032029,
      T: 101.04768,
      V: 99.068414,
      W: 186.07931,
      Y: 163.06333,
    };

    var that = this;

    this.peakData = request["rawData"].map((el) =>{
      return {
        "mz": el.oim,
        "intensity": el.oii,
        "type": el.ion,
        "number": el.num,
        "charge": el.ch,
        "neutralLoss": el.nln,
        "beg": el.beg || null,
        "end": el.end || null
      }
    });

    this.ionList = request["selectedIonList"].reduce((p,n) => { p[Object.keys(n)[0]] = Object.values(n)[0]; return p}, {});
    this.extraPeakList = request["selectedExtraPeakList"];
    this.neutralLossList = request["selectedNeutralLossList"];
    this.neutralLossList.forEach((nl) => {
      var test = nl.split("").map((n) => { return !isNaN(n) ? " * " + n : n}).join("");
      Object.keys(that.ChemistryConstants).forEach((ch) => {
        test = test.replaceAll(ch, '+' + that.ChemistryConstants[ch])
      });
      that[nl]= eval(test);
    }); 
    
    this.fragmentTypes = request.fragmentTypes;
    var max_peak = this.peakData.reduce((e,i)=>{ return e.intensity > i.intensity ? e : i});
    let max_peak_intensity = max_peak.intensity;
    this.base_peak = max_peak;
    this.peakData = this.peakData.map((el) => {
      el["intensity"] = el["intensity"] / max_peak_intensity * 100;
      return(el);
    })
    this.response = {};
    this.tolerance = request["tolerance"];
    this.isPPM =  request.toleranceType === 'ppm';
    this.cutoff = request.cutoff;
    this.mods = request.mods===undefined? []: request.mods;
    this.aminoAcids = this.generateAminoAcids(
        request["sequence"], this.mods);
    this.precursorCharge = parseInt(request.precursorCharge);
    this.matchType = request.matchingType;
    this.modification = request["mods"];
    this.precursorMz = this.calculatePrecursorMZ(request.sequence, request.precursorCharge, this.mods);
    this.response["isPPM"] = this.transformIsPPM(request);
    this.response["precursorMz"] = this.calculatePrecursorMZ(request.sequence, request.precursorCharge, this.mods);
    this.response["precursorMass"] = this.calculatePrecursorMass(request.sequence, this.mods);
    this.response["fragments"] = this.calculateFragments(request["sequence"], 
        request["precursorCharge"], 
        this.mods) ;
    this.response["internalFragments"] = this.calculateInternalFragments(request["sequence"]);
    this.response["im"] = this.calculateImoniumFragments();
    this.response["modifications"] = this.mods;
    this.sequence = request["sequence"];
    this.peaks = this.annotatePeaks();
    this.modifications = [];// this.generateModifications();
    this.modifications = new Array(this.sequence.length + 2).fill(undefined).map((e, i) =>{
      return {
        site: i -1,
        deltaElement: null,
        deltaMass: 0
      }
    });
  }


  fakeAPI(){
    return{
      tolerance: this.tolerance,
      sequence: this.sequence,
      precursorMz : this.precursorMz,
      precursorMass : this.response["precursorMass"],
      precursorCharge : this.precursorCharge,
      peaks : this.peaks,
      modifications: this.modifications,
      matchType: this.matchType,
      isPPM: this.isPPM,
      fragments : this.response["fragments"],
      fragTypes : this.fragmentTypes,
      cutoff: this.cutoff,
      checkVar: null,
      charge: this.precursorCharge,
      basePeak: {
        "mZ": this.base_peak.mz,
        "intensity": 100
      },
      annotationTime: null,
      aminoAcids: this.aminoAcids

    }
  }
  transformIsPPM(json) {
    return json.toleranceType === 'ppm';
  }

  annotatePeaks(){
    var spectrum_1 = this.peakData; // we search through experimental data
    let ions = this.ionList;
    var that = this;
    spectrum_1.map((el) =>{
      let selectedIon = Object.keys(ions).indexOf(el.type) !== -1;
      let selectedExtra = this.extraPeakList.indexOf(el.type) !== -1; 
      let selectedNL = el.neutralLoss !== null ? this.neutralLossList.indexOf(el.neutralLoss) !== -1 : false; 
      if (!selectedIon && !selectedExtra && !selectedNL || (selectedNL && !selectedIon)) {
        el["matchedFeatures"] = [];
      } else {
        if (selectedNL && selectedIon) {
          el["matchedFeatures"] = that.response["fragments"].filter((fra) =>{
            return ( fra.type === el.type 
                && fra.number === el.number
                && fra.charge === el.charge
                && fra.neutralLoss === '-'+el.neutralLoss
                && fra.mz !== null)
          }).map((n)=> {
            return({
              "feature": n,
              "massError": el.med
            })
          }); 
        } else if (selectedExtra) {
          if(el.type === 'M') {
            el["matchedFeatures"] = that.response["fragments"].filter((fra) =>{
              if (el.type === 'M' && fra.type==='M' && fra.charge === el.charge) { 
                return true
              } else {
              return false
            }
            }).map((n)=> {
              return({
                "feature": n,
                "massError": el.med
              })
            }); 
          } else if(el.type === 'IM') {
            el["matchedFeatures"] = that.response["im"].filter((fra) =>{
              if (fra.charge === el.charge && fra.number === '_'+el.neutralLoss) { 
                return true
              } else {
                return false
              }
            }).map((n)=> {
              return({
                "feature": n,
                "massError": el.med
              })
            }); 
          } else if(el.type === 'yb') {
            el["matchedFeatures"] = that.response["internalFragments"].filter((fra) =>{
              if (fra.charge === el.charge && fra.number === el.beg+"_"+el.end) { 
                return true
              } else {
                return false
              }
            }).map((n)=> {
              return({
                "feature": n,
                "massError": el.med
              })
            }); 
          }
        } else if (selectedIon) {
          let bCharge = ions[el.type].indexOf(el.charge) !== -1;
          if (!bCharge) {
            el["matchedFeatures"] = [];
          } else {
            el["matchedFeatures"] = that.response["fragments"].filter((fra) =>{
              return ( fra.type === el.type 
                  && fra.number === el.number
                  && fra.charge === el.charge
                  && fra.neutralLoss === el.neutralLoss
                  && fra.mz !== null)
            }).map((n)=> {
              return({
                "feature": n,
                "massError": el.med
              })
            });
          }
        }
      }
      el["percentBasePeak"] = el["intensity"] ;
      el["sn"] = null;

      return(el);
    });

    // var spectrum_1 = answer; // we search in the calculated values
    var sorter_asc_mz = binary.my_sorter('mz', 'asc');
    spectrum_1.sort(sorter_asc_mz);
    spectrum_1 = spectrum_1.map((el) => {
      if (el["percentBasePeak"] <= this.cutoff){
        el["matchedFeatures"] = [];
      }
      return el;
    });

    return(spectrum_1);

  }
  generateAminoAcids(sequence, mods){
    var r = sequence.split(""); // 
    r = r.map((e, i) => {
      let possibleMod = mods.filter(e => {return e.index ==i});
      let m = this.calculateAllMassOffset(possibleMod) ;


      return(
          {"mass": this.AminoAcids[e],
            "modification": {
              "deltaElement": null,
              "deltaMass": 0 + m,
              "site": i 
            },
            "name": e
          });

    });
    return(r);
  }
  calculateAllMassOffset(aMods) {
    return aMods.map((Mod) => this.calculateMassOfElementChange(Mod.elementChange)).reduce((a, b) => a + b, 0);
  }
  calculateMassOfElementChange(str) {
    /*
     *
     *  "mods":[
     *        {
     *                 "name":"Carbamyl",
     *                          "site":"N-terminus",
     *                                   "index":-1,
     *                                            "elementChange":"C1 H1 N1 O1"
     *                                                  }
     *                                                     ],
     *
     *
     */
    const aMods = str.split(' ');
    const deltaMass = aMods.map((mod) => {
      const element = this.ChemistryConstants[mod[0]];
      return mod.slice(1) * element;
    }).reduce((a, b) => a + b, 0);
    return deltaMass;
  }
  calculateAminoSequenceMass(sequence) {
    const aSequence = sequence.split('');
    const SequenceMass = aSequence.map((aS) => this.AminoAcids[aS]).reduce((a, b) => a + b, 0);
    return SequenceMass;
  }

  calculatePrecursorMass(sequence, mods) {
    const m = this.calculateAllMassOffset(mods);
    return this.calculateAminoSequenceMass(sequence) + m
      + this.N_TERMINUS + this.C_TERMINUS;
  }

  calculatePrecursorMZ(sequence, precursorCharge, mods) {
    const r = this.calculatePrecursorMass(sequence, mods);
    var woCharge = r + precursorCharge * this.ChemistryConstants.Proton;
    return woCharge / precursorCharge;
  }


  countH20 = (str) => {
    const re = /[STED]/g;
    return ((str || '').match(re) || []).length;
  };
  countNH3 = (str) => {
    const re = /[RKQN]/g;
    return ((str || '').match(re) || []).length;
  };

  get_losses(){
    let returnV = [];
    let nls = Object.keys(this.fragmentTypes);
    var that = this;
    nls.forEach((nl) => {
      if(that.fragmentTypes[nl].selected){
        returnV.push({
          "mass": that[nl],
          "name": "-"+nl
        });
      }
    });
    return returnV.filter((x) => x.mass !== undefined);
  }
  get_fragmentTypes(){
    // according to http://www.matrixscience.com/help/fragmentation_help.html
    // [N] is the molecular mass of the neutral N-terminal group, [C] is the molecular mass of the neutral C-terminal group, [M] [M] is molecular mass of the neutral amino acid residues
    var returnV = [];
    if(this.fragmentTypes.x.selected){
      returnV.push({
        "reverse": true,
        "type": "x",
        "offset": this.C_TERMINUS + this.ChemistryConstants.O + this.ChemistryConstants.C - this.ChemistryConstants.H * 0 //  [C]+[M]+CO-H
      });
    }
    if(this.fragmentTypes.y.selected){
      returnV.push({
        "reverse": true,
        "type": "y",
        "offset": this.C_TERMINUS + this.ChemistryConstants.H  // [C]+[M]+H
      });
    }
    if(this.fragmentTypes.z.selected){
      returnV.push({
        "reverse": true,
        "type": "z",
        "offset": this.C_TERMINUS - 1*this.ChemistryConstants.H - this.ChemistryConstants.N // [C]+[M]-NH2 // changed this
      });
    }
    if(this.fragmentTypes.a.selected){
      returnV.push({
        "reverse": false,
        "type": "a",
        "offset": this.N_TERMINUS - this.ChemistryConstants.C - this.ChemistryConstants.H - this.ChemistryConstants.O // [N]+[M]-CHO
      });
    }
    if(this.fragmentTypes.b.selected){
      returnV.push({
        "reverse": false,
        "type" : "b",
        "offset": this.N_TERMINUS - this.ChemistryConstants.H // [N]+[M]-H
      });
    }
    if(this.fragmentTypes.c.selected){
      returnV.push({
        "reverse": false,
        "type": "c",
        "offset": this.N_TERMINUS + this.ChemistryConstants.N + 2*this.ChemistryConstants.H // [N]+[M]+NH2
      });
    }
    return returnV;
  }
  calculateImoniumFragments() {
    /*
     * position starts at 1
     */

    var ims = this.peakData.filter((peak) => {
      return(peak.type === 'IM')
    });

    var fragments = [];
    ims.forEach((im) => {
      var subPeptideSub = '';
      var element = {};
      element["sequence"] = subPeptideSub;
      element["number"] = '_' + im.neutralLoss;
      element["charge"] = im.charge;

      var allowedMods = [];
      element["mz"] = im.mz;

      var e = this.generateAminoAcids(subPeptideSub, allowedMods);

      element["subPeptide"] = e;
      element["type"] = im.type;
      element["neutralLoss"] = im.neutralLoss;
      fragments.push(element);

    });
    return fragments;
  }
  calculateInternalFragments(sequence) {
    /*
     * position starts at 1
     */

    const losses = this.get_losses();
    var ybs = this.peakData.filter((peak) => {
      return(peak.type === 'yb')
    });

    var fragments = [];
    ybs.forEach((yb) => {
      var subPeptideSub = sequence.slice(yb.beg, yb.end);
      var element = {};
      element["sequence"] = subPeptideSub;
      element["number"] = yb.beg + "_" + yb.end;
      element["charge"] = yb.charge;

      var allowedMods = [];
      element["mz"] = yb.mz;

      var e = this.generateAminoAcids(subPeptideSub, allowedMods);

      element["subPeptide"] = e;
      element["type"] = yb.type;
      element["neutralLoss"] = null;
      fragments.push(element);

      for (var loss of losses){ // gives an int
        if(loss.name == "-NH3") {
          if (this.countNH3(subPeptideSub) > 0){
            let more = {...element};
            more["mz"] -= loss.mass / yb.charge;
            more["neutralLoss"] = loss.name;
            fragments.push(more);
          }
        }else if(loss.name == "-H2O") {
          if (this.countH20(subPeptideSub) > 0 ){
            let more = {...element};
            more["mz"] -= loss.mass / yb.charge;
            more["neutralLoss"] = loss.name;
            fragments.push(more);
          }
        }
        else { 
          let more = {...element};
          more["mz"] -= loss.mass / yb.charge;
          more["neutralLoss"] = loss.name;
          fragments.push(more);
        }
      }

    });
    return fragments;
  }
  calculateFragments(sequence, precursorCharge, mods) {
    /*
     * position starts at 1
     */


    const fragTypes = this.get_fragmentTypes();
    const losses = this.get_losses();

    const lengthPeptide = sequence.length;

    var fragments = [];
    for (var c = 1; c <= precursorCharge; c++){
      for (var i = 0; i < lengthPeptide - 1; i++) {
        for (var frag of fragTypes){ // gives an int
          var subPeptideSub = frag.reverse? sequence.slice(lengthPeptide -i-1, lengthPeptide): sequence.slice(0, i+ 1);
          var element = {};
          element["sequence"] = subPeptideSub;
          element["number"] = i + 1;
          element["charge"] = c;
          var allowedMods = frag.reverse? mods.filter((m) => { return m.index >= i + 1; }) : mods.filter((m) => {return m.index <= i+1;});
          var temp_mz = this.peakData.filter((ion) => {return ( ion.type === frag.type && ion.number === i + 1 && ion.charge === c)});
          element["mz"] = temp_mz.length > 0 ? temp_mz[0].mz : null ;
          var e = this.generateAminoAcids(subPeptideSub, allowedMods);
          if (frag.reverse){
            e = e.map((el) =>{
              el.modification.site += lengthPeptide - i - 1;
              return el;
            });
          }
          element["subPeptide"] = e;
          element["type"] = frag.type;
          element["neutralLoss"] = null;
          fragments.push(element);

          for (var loss of losses){ // gives an int
            if(loss.name == "-NH3") {
              if (this.countNH3(subPeptideSub) > 0){
                let more = {...element};
                more["mz"] -= loss.mass / c;
                more["neutralLoss"] = loss.name;
                fragments.push(more);
              }
            }else if(loss.name == "-H2O") {
              if (this.countH20(subPeptideSub) > 0 ){
                let more = {...element};
                more["mz"] -= loss.mass / c;
                more["neutralLoss"] = loss.name;
                fragments.push(more);
              }
            }
            else { 
              let more = {...element};
              more["mz"] -= loss.mass / c;
              more["neutralLoss"] = loss.name;
              fragments.push(more);
            }
          }

        }
      }

    }
    for (var pc = 1; pc <= precursorCharge; pc++){
      element = {};
      element["charge"] = pc;
      element["isPrecursor"] = true;
      element["type"] = "M";
      element["mz"] = ( this.response["precursorMass"] + pc * this.ChemistryConstants["Proton"] ) / pc;
      element["number"] = "+" + pc + "H";
      element["neutralLoss"] = "";
      fragments.push(element);
    }
    return fragments;
  }
}

exports.Annotation = Annotation;
