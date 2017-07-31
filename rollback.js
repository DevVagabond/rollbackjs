class Rollback {

    constructor(async) {
        this.async = async;
    }
    parallel(functionPipeline, callback) {
        var transactionStack = functionPipeline.map(pipeLine => pipeLine.transaction);
        var rollbackStack = functionPipeline.map(pipeLine => pipeLine.rollback);
        this.async.parallel(transactionStack, (err, result) => {
            if (err) {
                Promise.all(rollbackStack.map((rb, i) => new Promise((resolve, reject) => {
                        rb(result[i], (e, r) => {
                            !!e ? reject(e) : resolve(r)
                        });
                    })))
                    .then(r => callback(null, r))
                    .catch(e => callback(e));
            } else {
                callback(null, result);
            }
        });
    };
};

module.exports = async => new Rollback(async);