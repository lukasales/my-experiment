const { Before } = require('@cucumber/cucumber');

Before(function () {
  this.reset();
});
