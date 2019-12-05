"use strict";

const cache = require("./lib/cache");

module.exports = app => {
  cache(app);
  app.coreLogger.info(`[egg-mongoose-redis] is ready`);
};
