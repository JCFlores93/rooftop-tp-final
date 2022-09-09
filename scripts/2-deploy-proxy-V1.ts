import { ethers, upgrades } from "hardhat";

async function main() {

// Deploying V1
const Greeter = await ethers.getContractFactory('Greeter');
const greeter = await upgrades.deployProxy(Greeter, ['Hola!'], { initializer: 'setGreeting' });
await greeter.deployed();

console.log('Greeter deployed en:', greeter.address);
console.log(await greeter.greet());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
