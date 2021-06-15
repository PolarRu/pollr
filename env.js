const { config } = require("dotenv");

config();

const MONGO_URI = process.env.MONGO_URI;
const MONGO_TEST_URI = process.env.MONGO_TEST_URI;

module.exports = {
  MONGO_URI,
  MONGO_TEST_URI,
};
