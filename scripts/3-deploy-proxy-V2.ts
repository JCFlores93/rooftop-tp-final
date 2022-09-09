import { ethers, upgrades } from "hardhat";

async function main() {

// Upgrading to V2
const GreeterV2 = await ethers.getContractFactory('GreeterV2');
const upgraded = await upgrades.upgradeProxy('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', GreeterV2);

console.log('Greeter upgraded en:', upgraded.address);
console.log(await upgraded.greet("Lionel"));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
