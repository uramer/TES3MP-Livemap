var applyWrapper = function(callback,thisReplacer) {
  return function() {
    return callback.apply(thisReplacer,arguments)
  }
}