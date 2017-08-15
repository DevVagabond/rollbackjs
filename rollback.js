class Rollback {

  constructor(async) {
    this.async = async;
  }
  makeIifeStack(rollbackStack, result) {
    return rollbackStack.map(
      (rb, i) => !!result[i] ? cb => rb(result[i], (e, r) => !!e ? cb(e) : cb(null, r)) : cb => cb(null, false)
    );
  }
  parallel(functionPipeline, callback) {
    var transactionStack = functionPipeline.map(pipeLine => pipeLine.transaction);
    var rollbackStack = functionPipeline.map(pipeLine => pipeLine.rollback);
    this.async.parallel(transactionStack, (err, result) => {
      if (err) {
        this.async.parallel(this.makeIifeStack(rollbackStack, result), (e, r) => !!e ? callback(e) : callback(null, r));
      } else {
        callback(null, result);
      }
    });
  };

  series(functionPipeline, callback) {
    var transactionStack = functionPipeline.map(pipeLine => pipeLine.transaction);
    var rollbackStack = functionPipeline.map(pipeLine => pipeLine.rollback);
    this.async.series(transactionStack, (err, result) => {
      if (err) {
        Promise.all(rollbackStack.map((rb, i) => !!result[i] ? new Promise((resolve, reject) => {
            rb(result[i], (e, r) => !!e ? reject(e) : resolve(r));
          }) : Promise.resolve(false)))
          .then(r => callback(null, r))
          .catch(e => callback(e));
      } else {
        callback(null, result);
      }
    });
  }
};

module.exports = (async) => {
  return new Rollback(async);
}