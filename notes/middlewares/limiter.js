const express_rate_limiter = require("express-rate-limit");
const fifteenMins = "15 * 60 * 1000";
module.exports = {
  limit: express_rate_limiter({
    windowMs: fifteenMins, //15 mins
    max: 10,
    message:
      "Too much requests have done frequently. Please try again after 15 mins. ",
  }),
};
