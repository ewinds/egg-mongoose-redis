"use strict";

const mock = require("egg-mock");

describe("test/mongoose-redis.test.js", () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: "apps/mongoose-redis-test"
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it("should GET /", () => {
    return app
      .httpRequest()
      .get("/")
      .expect("hi, mongooseRedis")
      .expect(200);
  });
});
