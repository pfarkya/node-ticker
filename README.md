# node-ticker
It can create a continuous or random tick to perform some light-weighted operations
To test this library first install dependency
##Steps:
1.sudo npm install --no-bin-links
2.mocha test

## ticker-constructor ticker("name",starttime,endtime,mode,interval/burst)
it will create a ticker object
## ticker Object Methods:
### name() returns the object name
example:
```js
tickerObj=new ticker('tickerOne');
console.log(tickerObj.name())//tickerOne
```

### start(cb) takes a callback  return null
callback to handle after successful start of ticker.
example:
```js
tickerObj = new ticker('tickerOne');
tickerObj.start(function() {});
```

### scheduler(processcb,completecb) takes two argument first callback that is of function to call at each interval and secondOne when all ticks will over then for final work
