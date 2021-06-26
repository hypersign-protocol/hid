const BigNumber = require("bignumber.js");
const config = require("./config");
  function getDateFromEpoch(seconds) {
    let d;
    if (seconds === "now") {
      d = new Date();
    } else {
      d = new Date(seconds * 1000);
    }

    return (
      d.getMonth() +
      "/" +
      d.getDate() +
      "/" +
      d.getFullYear() +
      " " +
      d.getHours() +
      ":" +
      d.getMinutes() +
      ":" +
      d.getSeconds() +
      ":" +
      d.getMilliseconds()
    );
  }


  function convertToken(amount) {
    amount = amount * Math.pow(10, config.DECIMALS);
    return BigNumber(amount.toString());
  }

  module.exports = {
    getDateFromEpoch,
    convertToken
  }