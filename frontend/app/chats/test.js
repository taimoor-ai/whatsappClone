import parsePhoneNumber from "awesome-phonenumber";

// Using object with regionCode
const pn = parsePhoneNumber("3123456780", { regionCode: "PK" });

console.log(pn)
// console.log({
//   valid: pn.isValid(),
//   number: pn.getNumber("e164"), // +923123456789
//   region: pn.getRegionCode(),   // PK
// });
