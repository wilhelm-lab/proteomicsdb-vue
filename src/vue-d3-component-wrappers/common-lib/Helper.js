
/*
 *  Contains all helper functions
 */
var helper = {
    /**
     * this method can provide a csv download from a given json
     * @param {object}  oJSON          data that has to be converted to csv as json
     * @param {[type]}  sFileName      filename of the csv to download
     * @param {[type]}  aColumnMapping array of objects defining the jsonProperty to columnName mapping, also allows for multiple parts and a formatter
     *                  should look like
     *                  [{
     *                       jsonProperty: "col1",
     *                       columnName: "Column 1"
     *                   }, {
     *                       parts: ['col2', 'col3'],
     *                       formatter: function formatter(oData, aParts) {
     *                           return oData[aParts[0]] + ' (' + oData[aParts[1]] + ')';
     *                       },
     *                       columnName: "Column 2"
     *                   }]
     * @param  {[type]} sSeparator     separator for the csv, semicolon by default
     */
    downloadCsvFromJson: function(oJSON, sFileName, aColumnMapping, sSeparator) {
        sSeparator = sSeparator ? sSeparator : ';';
        var aCsvRows = [];
        var aColumnHeaders = [];
        var iIndex;

        if (aColumnMapping != 'undefined' && typeof aColumnMapping !== 'undefined') {
            for (iIndex = 0; iIndex < aColumnMapping.length; iIndex++) {
                aColumnHeaders.push(aColumnMapping[iIndex].columnName);
            }

            aCsvRows.push(aColumnHeaders.join(sSeparator));

            for (iIndex = 0; iIndex < oJSON.length; iIndex++) {
                var aRow = [];
                for (var jIndex = 0; jIndex < aColumnMapping.length; jIndex++) {
                    var oMappingEntry = aColumnMapping[jIndex];
                    if (oMappingEntry.jsonProperty) {
                        aRow.push(oJSON[iIndex][oMappingEntry.jsonProperty]);
                    } else if (oMappingEntry.parts && oMappingEntry.formatter) {
                        aRow.push(oMappingEntry.formatter(oJSON[iIndex], oMappingEntry.parts));
                    }
                }
                aCsvRows.push(aRow.join(sSeparator));
            }

            var sCsv = aCsvRows.join('\n');
            var oBlob = new Blob([sCsv], {
                type: 'text/plain'
            });

            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(oBlob, sFileName + '.csv');
            } else {
                var oLink = document.createElement('a');
                oLink.download = sFileName + '.csv';
                oLink.href = URL.createObjectURL(oBlob);
                document.body.appendChild(oLink);
                oLink.click();
                document.body.removeChild(oLink);
            }
        }
    },

    downloadData: function(sContent, oSettings) {
        oSettings = oSettings || {};
        oSettings.fileName = oSettings.fileName || 'data.raw';
        oSettings.contentType = oSettings.contentType || 'application/octet-stream';
        oSettings.charset = oSettings.charset || 'utf-8';

        var xA = document.createElement('a');
        xA.setAttribute('href', 'data:' + oSettings.contentType + ';charset=' + oSettings.charset + ',' + encodeURIComponent(sContent));
        xA.setAttribute('download', oSettings.fileName);
        xA.style.display = 'none';
        document.body.appendChild(xA);

        xA.click();

        document.body.removeChild(xA);
    },

    createCsv: function(aData, oSettings) {
        oSettings = oSettings || {};
        oSettings.fieldSeparator = oSettings.fieldSeparator || ';';
        oSettings.lineSeparator = oSettings.lineSeparator || '\n';

        if (!aData || !aData.length) {
            return;
        }

        var aKeys = Object.keys(aData[0]);
        var sData = aData.map(function(oRow) {
            return aKeys.map(function(sKey) {
                return oRow[sKey];
            }).join(oSettings.fieldSeparator);
        }).join(oSettings.lineSeparator);

        var sHeader = aKeys.join(oSettings.fieldSeparator);

        return [sHeader, sData].join(oSettings.lineSeparator);
    },

    /**
     * Parse search parameters into Request
     */
    parseSearchParam: function(searchparam) {
        var Request = {
            parameter: function(name) {
                return this.parameters()[name];
            },
            parameters: function() {
                var result = {};
                if (searchparam !== null) {
                    var curparameters = searchparam.split(';');
                    for (var i = 0; i < curparameters.length; i++) {
                        var parameter = curparameters[i].split(':');
                        if (parameter.length === 1) {
                            result.searchparam = parameter[0];
                        } else {
                            result[parameter[0]] = parameter[1];
                        }
                    }
                    return result;
                }
                return [];
            }
        };
        return Request;
    },

    /**
     * Validates an email
     */
    validateEmail: function(email) {
        var emailRegex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
        return emailRegex.test(email);
    },

    /**
     * Rounds a number
     */
    roundNumber: function(num, digits) {
        var factor = Math.pow(10, digits);
        return Math.round(num * factor) / factor;
    },

    /**
     * Adds zeros to a number
     */
    addZeros: function(num, digits) {
        if (num === undefined || num === null) {
            return '';
        }
        var s = num.toString();
        if (s.indexOf('.') !== -1) {
            var freq = s.length - s.indexOf('.') - 1;
            if (freq < digits) {
                return s + Array(digits - freq + 1).join('0');
            }
            return s.substring(0, s.indexOf('.') + digits + 1);
        }
        return s + '.' + Array(digits + 1).join('0');
    },
    deleteCookie: function deleteCookie(cname) {
        document.cookie = cname + '=' + ';expires=Thu, 01 Jan 1970 00:00:01 GMT' + ';path=/';
    },
    setCookie: function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    },
    checkCookie: function checkCookie(variable) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + variable + '=');
        var val = null;
        if (parts.length == 2) {
            val = parts.pop().split(';').shift();
        }

        return val;
    }

};

/*
 * Variables
 */
helper.pubmedBaseUrl = 'http://www.ncbi.nlm.nih.gov/pubmed/';

helper.pxdBaseUrl = 'http://proteomecentral.proteomexchange.org/cgi/GetDataset?filterstr=';

//Not used anywhere, should probably be used in the custom user data upload
helper.WHITELIST = (function() {
    var constants = {
        FILEEXTENSIONS: ['pdf', 'doc', 'docx', 'txt', 'mgf', 'mxml', 'raw', 'pkl', 'dat', 'odt', 'ods', 'ppt', 'pptx', 'xlsx', 'xls', 'csv', 'tsv',
            'png', 'jpg', 'jpeg', 'tiff', 'xml', 'mzml', 'mzxml', 'mzdata', 'mz5', 'wiff', 'yep', 'd', 'baf', 'fid', 'datp'
        ],
        HTMLTAGS: ['p', 'br', 'li', 'lu', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'dl', 'dd', 'dt', 'sub', 'sup', 'b', 'i', 'a', 'u']
    };
    return {
        get: function(name) {
            return constants[name];
        }
    };
})();

export default helper;
