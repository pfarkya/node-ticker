/*writing test cases for the ticker component*/
var ticker = require('../datamillserver/timeticker/timeticker');
var expect = require('chai').expect;

describe('Scenario: Instantiate Ticker with Parameters', function() {
  it('Instantiate ticker instance', function(done) {
    //There will be multiple data models trying to run in parallel, each requires their own copy of the ticker
    //As each data model will have its own schedule, rate or frequency and occurrences 
    var simpleTicker = new ticker();
    expect(simpleTicker).to.not.equal(undefined);
    expect(simpleTicker).to.not.equal(null);
    expect(simpleTicker).to.be.an('object');
    expect(simpleTicker.name()).to.equal('ticker');
    done();
  });

  it('Test there are multiple and different instances of Ticket getting created', function(done) {

    var ticketOne = new ticker('one');
    var ticketTwo = new ticker('two');

    expect(ticketOne.name()).to.not.equal(ticketTwo.name());
    expect(ticketOne).to.not.equal(ticketTwo);
    done();
  });

  it('Instantiate the ticker with default configuration', function(done) {
    var simpleticker = new ticker();
    var defaultconf = {
      name: "ticker",
      end: undefined,
      start: undefined,
      intervalorburst: 100,
      timer: undefined,
      mode: 'none',
      running: false,
      scheduled: false,
      starttimer: undefined,
      endtimer: undefined,
      currentcount: 0
    };
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.conf).to.deep.equal(defaultconf)
    done()
  });

  it('Instantiate ticker which can start immediately', function(done) {
    var simpleticker = new ticker();
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.conf.start).to.equal(undefined);
    done()
  });

  it('Instantiate ticker which can start at a future time', function(done) {
    var now = new Date();
    var future = new Date(now.getTime() + 60000 * 12);

    var simpleticker = new ticker(null, future);
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.conf.start).to.be.above(now)
    done()
  });

  it('Instantiate ticker which can stop', function(done) {
    var simpleticker = new ticker();
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.stop).to.not.equal(undefined)
    expect(simpleticker.stop).to.not.equal(null)
    done()
  });

  it('Instantiate ticker which can be stopped at a specific time in future', function(done) {
    var now = new Date();
    var future = new Date(now.getTime() + 60000 * 12);

    var simpleticker = new ticker(null, null, future);
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.stop).to.not.equal(undefined)
    expect(simpleticker.conf.end).to.be.above(now)
    done()
  });

  it('Instantiate ticker for continuous ticking', function(done) {
    var now = new Date();
    var future = new Date(now.getTime() + 60000 * 12);

    var simpleticker = new ticker(null, now, future, 'continuous', 1000);
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.stop).to.not.equal(undefined)
    expect(simpleticker.conf.mode).to.equal('continuous')
    expect(simpleticker.conf.intervalorburst).to.equal(1000)
    done()
  });

  it('Instantiate ticker for burst mode ticking', function(done) {
    var now = new Date();
    var future = new Date(now.getTime() + 60000 * 12);
    var simpleticker = new ticker(null, now, future, 'burst', 1000);
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.stop).to.not.equal(undefined)
    expect(simpleticker.conf.intervalorburst).to.equal(1000)
    done()
  });
});

describe('Scenario: Ticking the ticker', function() {

  it('start ticking', function(done) {
    var simpleTicker = new ticker('one');
    var ticks = 0;
    simpleTicker.start(function() {
      console.log('Tick ' + (++ticks));
      if (ticks == 10) {
        simpleTicker.stop()
        expect(ticks).to.be.equal(10)
        expect(simpleTicker.conf.running).to.be.false;
        done();
      }
    });
  });
  it('immediate stop ticking', function(done) {
    var simpleTicker = new ticker('one');
    var ticks = 0;
    simpleTicker.start(function() {
      console.log('Tick ' + (++ticks));
      if (ticks == 10) {
        simpleTicker.stop()
        expect(ticks).to.be.equal(10)
        expect(simpleTicker.conf.running).to.be.false;
        done("it should be stop immediately");
      }
    });
    simpleTicker.stop()
    expect(ticks).to.be.equal(0)
    expect(simpleTicker.conf.running).to.be.false;
    done();
  });
  it('Start ticking at future time', function(done) {
    this.timeout(70000)
    var now = new Date();
    var future = new Date(now.getTime() + 6000 * 1);

    var simpleticker = new ticker(null, future);
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.conf.start).to.be.above(now)
    simpleticker.start(function() {
      var actualstart = new Date()
      if (actualstart.getTime() >= future.getTime()) {
        console.log("getting first tick");
        simpleticker.stop()
        return done()
      }
      return done("start early")
    })
  })
  it('start ticking multiple ticker at different future time and stop time is also differ', function(done) {
    this.timeout(70000)
    var now = new Date(),
      strtOne = new Date(now.getTime() + 7000 * 1),
      endOne = new Date(now.getTime() + 7000 * 3),
      strtTwo = new Date(now.getTime() + 7000 * 2),
      endTwo = new Date(now.getTime() + 7000 * 4),
      tickerOne = new ticker('one', strtOne, endOne, 'continuous', 2000),
      tickerTwo = new ticker('two', strtTwo, endTwo, 'continuous', 2000),
      tickOne = 0,
      tickTwo = 0,
      success = 0;
    tickerOne.scheduler(function() {
      console.log("get the tick of tickerOne:", ++tickOne, " at ", new Date());
      if (tickOne == 1 && (new Date() > strtOne)) success++;
    }, function() {
      console.log("stopping the tickerOne at", new Date());
      if ((new Date() > endOne)) success++;
    })
    tickerTwo.scheduler(function() {
      console.log("get the tick of tickerTwo:", ++tickTwo, " at ", new Date());
      if (tickTwo == 1 && (new Date() > strtOne)) success++;
    }, function() {
      console.log("stopping the tickerTwo at", new Date());
      if ((new Date() > endTwo)) success++;
    })
    setTimeout(function() {
      console.log("success", success);
      if (success == 4) done();
    }, 30000)
  });
  it('start a random ticker of 10 burst', function(done) {
    this.timeout(30000)
    var now = new Date();
    var starttime = new Date(now.getTime() + 7000 * 1);
    var endtime = new Date(now.getTime() + 7000 * 3);
    var ticks = 0;
    var simpleticker = new ticker("burstticker", starttime, endtime, 'burst', 10);
    expect(simpleticker).to.be.an('object')
    expect(simpleticker.conf.start).to.be.above(now)
    simpleticker.start(function() {
      console.log('Tick ' + (++ticks) + ' at', (new Date()));

      //return done("start early")
    })
    setTimeout(function() {
      console.log("time gets over now ticks is", ticks);
      if (ticks == 10) {
        done()
      }
    }, 29000)
  })
  it('start multiple different type of ticker', function(done) {
    this.timeout(30000)
    var now = new Date();
    var starttime = new Date(now.getTime() + 7000 * 1);
    var endtime = new Date(now.getTime() + 7000 * 3);
    var burstticks = 0;
    var success = false;
    var burstticker = new ticker("burstticker", starttime, endtime, 'burst', 10);
    var continuousticks = 0;
    var continuousticker = new ticker("burstticker", starttime, endtime, 'continuous', 1000);
    expect(burstticker).to.be.an('object')
    expect(burstticker.conf.start).to.be.above(now)
    burstticker.start(function() {
      console.log('Tick ' + (++burstticks) + ' at', (new Date()));

      //return done("start early")
    })
    continuousticker.scheduler(function() {
      console.log('Tick ' + (++continuousticks) + ' at', (new Date()));
    }, function() {
      console.log('Stop at Tick ' + (continuousticks) + ' at', (new Date()));
      success = true;
    })
    setTimeout(function() {
      console.log("time gets over now ticks is", burstticks);
      if (burstticks == 10 && success) {
        done()
      }
    }, 29000)
  })
});
