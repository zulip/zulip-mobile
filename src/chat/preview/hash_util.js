// prettier-disable
/* eslint-disable */
// prettier-ignore

var hash_util = (function () {

var exports = {};

// Some browsers zealously URI-decode the contents of
// window.location.hash.  So we hide our URI-encoding
// by replacing % with . (like MediaWiki).
exports.encodeHashComponent = function (str) {
    return encodeURIComponent(str)
        .replace(/\./g, '%2E')
        .replace(/%/g,  '.');
};

exports.decodeHashComponent = function (str) {
    return decodeURIComponent(str.replace(/\./g, '%'));
};


return exports;

}());
if (typeof module !== 'undefined') {
    module.exports = hash_util;
}
