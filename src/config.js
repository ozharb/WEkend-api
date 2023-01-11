"use strict";

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgres://xtogvimv:ATsFN_bzqioTUreRdNUJswhTv6aFoPVo@hansken.db.elephantsql.com/xtogvimv",
  JWT_SECRET: process.env.JWT_SECRET || "oz-special-jwt-secret",
};
