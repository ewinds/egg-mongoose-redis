"use strict";

module.exports = function(app) {
  const exec = app.mongoose.Query.prototype.exec;
  const client = app.redis;

  app.mongoose.Query.prototype.cache = function(ttl, customKey) {
    if (typeof ttl === "string") {
      customKey = ttl;
      ttl = 60;
    }

    this._ttl = ttl;
    this._key = customKey;
    return this;
  };

  app.mongoose.Query.prototype.reCache = function(ttl, customKey) {
    if (typeof ttl === "string") {
      customKey = ttl;
      ttl = 60;
    }

    this._ttl = ttl;
    this._key = customKey;
    this._reCache = true;
    return this;
  };

  app.mongoose.Query.prototype.exec = async function() {
    if (!this._ttl) {
      return exec.apply(this, arguments);
    }
    const key =
      this._key ||
      crypto
        .createHash("md5")
        .update(
          JSON.stringify(
            Object.assign(
              {},
              {
                name: this.model.collection.name,
                conditions: this._conditions,
                fields: this._fields,
                o: this._mongooseOptions,
                distinct: this._distinct
              }
            )
          )
        )
        .digest("hex");

    const cached = await client.get(key);
    if (cached && !this._reCache) {
      // console.log(`[LOG] Serving from cache`);
      const doc = JSON.parse(cached);
      return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);
    if (result) {
      client.set(key, JSON.stringify(result), "EX", this._ttl);
    }
    return result;
  };
};
