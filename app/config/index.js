import Constants from "expo-constants";

const brand = Constants.expoConfig.extra.APP_BRAND;

console.log("CURRENT BRAND:", brand);

let selectedBrand;

switch (brand) {
  case "enviro":
    selectedBrand = require("./enviro").default;
    break;
    case "max estates":
    selectedBrand = require("./maxEstate").default;
    break;
  case "isociety":
    selectedBrand = require("./isociety").default;
    break;
  case "jaypee":
  default:
    selectedBrand = require("./jaypee").default;
}

export default selectedBrand