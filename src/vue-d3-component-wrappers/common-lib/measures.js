// https://github.com/OpenMS/OpenMS/blob/5a70018d9e03ce32e64fcbb1c985b7a1256efc7a/src/tests/class_tests/openms/data/PILISSequenceDB_DFPIANGER_1.dta

const _ = require('lodash');

const ipsa_helper = {
  comparison: {
    // https://brenocon.com/blog/2012/03/cosine-similarity-pearson-correlation-and-ols-coefficients/
    // All functions in here must comply to
    // spectrum_1_intensity = [....]
    // spectrum_2_intensity = [....]
    dot_product(spectrum_1, spectrum_2) {
      let dot_help = 0;
      let a = 0;
      let norm_a = 0;
      let b = 0;
      let norm_b = 0, n;
      // norm_2 (x)	sqrt (sum |xi|2 )
      for (n = 0; n < spectrum_1.length; n++) {
        a += Math.pow(spectrum_1[n], 2);
        b += Math.pow(spectrum_2[n], 2);
      }
      norm_a = Math.sqrt(a);
      norm_b = Math.sqrt(b);
      for (n = 0; n < spectrum_1.length; n++) {
        // we normalize the vector in here elementwise
        dot_help += (spectrum_1[n] / norm_a) * (spectrum_2[n] / norm_b);
      }
      return (dot_help);
    },
    spectral_angle(spectrum_1, spectrum_2) {
      let dot_help = 0;
      let a = 0;
      let norm_a = 0;
      let b = 0;
      let norm_b = 0, n;
      // norm_2 (x)	sqrt (sum |xi|2 )
      for (n = 0; n < spectrum_1.length; n++) {
        a += Math.pow(spectrum_1[n], 2);
        b += Math.pow(spectrum_2[n], 2);
      }
      norm_a = Math.sqrt(a);
      norm_b = Math.sqrt(b);
      for (n = 0; n < spectrum_1.length; n++) {
        // we normalize the vector in here elementwise
        dot_help += (spectrum_1[n] / norm_a) * (spectrum_2[n] / norm_b);
      }
      if (isNaN(dot_help)) {
        return (0);
      }
      dot_help = dot_help > 1 ? 1 : dot_help;
      return (1 - 2 * Math.acos(dot_help) / Math.PI);
    },
    pearson_correlation(spectrum_1, spectrum_2) {
      let a = 0;
      let norm_a = 0;
      let b = 0;
      let norm_b = 0;

      // norm_2 (x)	sqrt (sum |xi|2 )
      for (let n = 0; n < spectrum_1.length; n++) {
        a += Math.pow(spectrum_1[n], 2);
        b += Math.pow(spectrum_2[n], 2);
      }
      norm_a = Math.sqrt(a);
      norm_b = Math.sqrt(b);

      for (let n = 0; n < spectrum_1.length; n++) {
        spectrum_1[n] = spectrum_1[n] / norm_a;
        //spectrum_2[n] = spectrum_2[n] / norm_a; //TODO check with Tobi
        spectrum_2[n] = spectrum_2[n] / norm_b;
      }

      let xsum = 0;
      const xavg = spectrum_1.reduce((a, b) => a + b, 0) / spectrum_1.length;
      let ysum = 0;
      const yavg = spectrum_2.reduce((a, b) => a + b, 0) / spectrum_2.length;
      let sum = 0;
      let n;
      for (n = 0; n < spectrum_1.length; n++) {
        sum += (spectrum_1[n] - xavg) * (spectrum_2[n] - yavg);
        xsum += Math.pow((spectrum_1[n] - xavg), 2);
        ysum += Math.pow((spectrum_2[n] - yavg), 2);
      }
      // return (sum / Math.sqrt(xsum * ysum));
      const result =  (sum / Math.sqrt(xsum * ysum));
      return result;
    },
  },

};
// will return function f(ary1) => ary2
const regressionThroughZero = function (ary1, ary2) {
  const maxAry1 = ary1.reduce((prev, current) => ((prev > current) ? prev : current)); // returns object
  const maxAry2 = ary2.reduce((prev, current) => ((prev > current) ? prev : current)); // returns object

  var nominator = _.zip(ary1, ary2)
    .map((x) => x[0] / maxAry1 * x[1] / maxAry2)
    .reduce((prev, current) => prev + current, 0);

  const denominator = ary1
    .map((x) => x / maxAry1 * x / maxAry1)
    .reduce((prev, current) => prev + current, 0);

  return nominator / denominator;
};

exports.ipsa_helper = ipsa_helper;
exports.regressionThroughZero = regressionThroughZero;
