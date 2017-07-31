# rollbackjs

async = require('async');
rollback = require('./modules/util/rollback')(async);

rollback.parallel([{
    transaction: (cb) => {
        setTimeout(() => {
            cb(null, 1);
        }, 100);
    },
    rollback: (num, cb) => {
        setTimeout(() => {
            cb(null, "rollback - " + num);
        }, 100);
    }
}, {
    transaction: (cb) => {
        setTimeout(() => {
            cb(null, 2);
        }, 200);
    },
    rollback: (num, cb) => {
        setTimeout(() => {
            cb(null, "rollback - " + num);
        }, 20);
    }
}, {
    transaction: (cb) => {
        setTimeout(() => {
            cb(3);
        }, 500);
    },
    rollback: (num, cb) => {
        setTimeout(() => {
            cb(null, "rollback - " + num);
        }, 500);
    }
}], (err, data) => {
    console.log("final", err, data);
});
