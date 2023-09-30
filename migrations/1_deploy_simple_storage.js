// const SimpleStorage = artifacts.require("SimpleStorage");

// module.exports = function (deployer) {
//   deployer.deploy(SimpleStorage);
// };

const fs=require('fs')
const CarRentalPlatform=artifacts.require("CarRentalPlatform")

module.exports=async function(deployer){
await deployer.deploy(CarRentalPlatform);
const instance=await CarRentalPlatform.deployed();
let CarRentalPlatformAddress=await instance.address;
let config="export const CarRentalPlatformAddress = "+CarRentalPlatformAddress;
console.log("CarRentalPlatformAddress= "+CarRentalPlatformAddress);
let data=JSON.stringify(config);
fs.writeFileSync('config.js',JSON.parse(data))
}