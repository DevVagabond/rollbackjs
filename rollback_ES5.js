"use strict";

var _createClass = function() {
  function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rollback = function() {
  function Rollback(async) {
    _classCallCheck(this, Rollback);

    this.async = async;
  }

  _createClass(Rollback, [{
    key: "makeIifeStack",
    value: function makeIifeStack(rollbackStack, result) {
      return rollbackStack.map(function(rb, i) {
        return !!result[i] ? function(cb) {
          return rb(result[i], function(e, r) {
            return !!e ? cb(e) : cb(null, r);
          });
        } : function(cb) {
          return cb(null, false);
        };
      });
    }
  }, {
    key: "parallel",
    value: function parallel(functionPipeline, callback) {
      var _this = this;

      var transactionStack = functionPipeline.map(function(pipeLine) {
        return pipeLine.transaction;
      });
      var rollbackStack = functionPipeline.map(function(pipeLine) {
        return pipeLine.rollback;
      });
      this.async.parallel(transactionStack, function(err, result) {
        if (err) {
          _this.async.parallel(_this.makeIifeStack(rollbackStack, result), function(e, r) {
            return !!e ? callback(e) : callback(null, r);
          });
        } else {
          callback(null, result);
        }
      });
    }
  }, {
    key: "series",
    value: function series(functionPipeline, callback) {
      var transactionStack = functionPipeline.map(function(pipeLine) {
        return pipeLine.transaction;
      });
      var rollbackStack = functionPipeline.map(function(pipeLine) {
        return pipeLine.rollback;
      });
      this.async.series(transactionStack, function(err, result) {
        if (err) {
          Promise.all(rollbackStack.map(function(rb, i) {
            return !!result[i] ? new Promise(function(resolve, reject) {
              rb(result[i], function(e, r) {
                return !!e ? reject(e) : resolve(r);
              });
            }) : Promise.resolve(false);
          })).then(function(r) {
            return callback(null, r);
          }).catch(function(e) {
            return callback(e);
          });
        } else {
          callback(null, result);
        }
      });
    }
  }]);

  return Rollback;
}();

;

module.exports = function(async) {
  return new Rollback(async);
};