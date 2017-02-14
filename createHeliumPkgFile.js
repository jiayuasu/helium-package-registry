var checkPreviousContainerId = require('./lib/createHeliumPkgFile/checkPreviousContainerId')
var removeContentInTmp = require('./lib/createHeliumPkgFile/removeContentInTmp')
var pushPkgInfoToTmp = require('./lib/createHeliumPkgFile/pushPkgInfoToTmp')
var getFinalContent = require('./lib/createHeliumPkgFile/getFinalContent')
var createFinalHeliumFile = require('./lib/createHeliumPkgFile/createFinalHeliumFile')

// need to check whether Lambda container is being reused or not using its containerID
var containerId = Date.now().toString().slice(-6)

exports.handler = (event, context, callback) => {
  checkPreviousContainerId()
    .then(function (previousContainerId) {
      if(previousContainerId !== containerId) {
        return removeContentInTmp()
      } else {
        context.callbackWaitsForEmptyEventLoop = false
        return callback(null, "Abort function running to prevent to create duplicated key.")
      }
    })
    .delay(3000)
    .then(function(){
      console.log('Will take less than 10 sec to integrate whole package info in ' + containerId + " Lambda container...")
      return pushPkgInfoToTmp()
    })
    .delay(8000)
    .then(function(){
      return getFinalContent()
    })
    .then(function(result){
      return createFinalHeliumFile(containerId, result)
    })
    .delay(3000)
    .then(function () {
      return context.callbackWaitsForEmptyEventLoop = false
    })
    .then(function () {
      return callback(null, "Done")
    })
    .catch(function (error) {
      console.error(error.message)
    })
}