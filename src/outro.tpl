



if ( typeof module === 'object' && typeof module.exports === 'object' ) {
  module.exports = def;
} else {
  (typeof window !== 'undefined' ? window : this).def = def;
}

})();