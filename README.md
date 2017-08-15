# rollbackjs
rollback.js is a javascript library to rollback the processes.
### parallel : 
***
You can execute your transaction and rollback methods parallely.
That means neither transaction nor the rollback methods are dependent on each other. This method is faster than other methods in rollback.

```javascript
var async = require('async');
var rollback = require('rollback')(async);

var x, y, z;
x = 10;
y = 20;
z = 30;

rollback.parallel([{
  transaction: (cb) => {
    setTimeout(() => {
      ++x;
      cb(null, x);
    }, 100);
  },
  rollback: (num, cb) => {
    setTimeout(() => {
      --num;
      cb(null, "rollback - " + num);
    }, 100);
  }
}, {
  transaction: (cb) => {
    setTimeout(() => {
      ++y;
      cb(y);
    }, 500);
  },
  rollback: (num, cb) => {
    setTimeout(() => {
      --num;
      cb(null, "rollback - " + num);
    }, 20);
  }
}, {
  transaction: (cb) => {
    setTimeout(() => {
      ++z;
      cb(null, z);
    }, 100);
  },
  rollback: (num, cb) => {
    setTimeout(() => {
      --num;
      cb(null, "rollback - " + num);
    }, 100);
  }
}], (err, data) => {
  console.log("final", err, data); 
  // console :  final null [ 'rollback - 10', false, 'rollback - 30' ]
});
```


### series
***

```javascript

var a, b, c;
a = 100;
b = 200;
c = 300;
rollback.series([{
  transaction: (cb) => {
    setTimeout(() => {
      ++a;
      cb(null, a);
    }, 100);
  },
  rollback: (num, cb) => {
    setTimeout(() => {
      --num;
      cb(null, "rollback - " + num);
    }, 100);
  }
}, {
  transaction: (cb) => {
    setTimeout(() => {
      ++b;
      cb(b);
    }, 500);
  },
  rollback: (num, cb) => {
    setTimeout(() => {
      --num;
      cb(null, "rollback - " + num);
    }, 20);
  }
}, {
  transaction: (cb) => {
    setTimeout(() => {
      ++c;
      cb(null, c);
    }, 100);
  },
  rollback: (num, cb) => {
    setTimeout(() => {
      --num;
      cb(null, "rollback - " + num);
    }, 100);
  }
}], (err, data) => {
  console.log("final", err, data);
  //console: final null [ 'rollback - 100', false, false ]
});

```