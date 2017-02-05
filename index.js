'use strict';

const Rx = require('rxjs/Rx');
let locked = false;

function lock() {
  if (locked) {
    return Promise.reject('could not acquire lock');
  }

  locked = true;
  return Promise.resolve();
}

function unlock() {
  locked = false;
  return Promise.resolve();
}

function acquireLock() {
  return Rx.Observable.from(lock())
    .catch(err => {
      console.error(err);
      return Rx.Observable.empty();
    });
}

function releaseLock() {
  return Rx.Observable.from(unlock());
}

function pollApi() {
  console.log('creating promise...');
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve('api answer'), 2000);
  });
  return Rx.Observable.from(promise);
}

const interval$ = Rx.Observable.interval(200);
const apiResults$ = interval$
  .mergeMap(acquireLock)
  .mergeMap(pollApi)
  .do(releaseLock);

apiResults$.subscribe(
  console.log,
  console.error
);
