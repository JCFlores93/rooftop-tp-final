import { ethers, upgrades } from "hardhat";

async function main() {

  const emission = ethers.utils.parseEther("1000000");
  const DappToken = await ethers.getContractFactory("DappToken");
  const dappToken = await DappToken.deploy(emission);
  await dappToken.deployed();

  const LPToken = await ethers.getContractFactory("LPToken");
  const lpToken = await LPToken.deploy(emission);
  await lpToken.deployed();
  
  // Deploying
  const TokenFarm = await ethers.getContractFactory('TokenFarm');
  // const args = [
  //   {types:[ "address", "address",]}, 
  //   { values: [dappToken.address, lpToken.address ]}
  // ]
  const tokenFarm = await upgrades.deployProxy(TokenFarm);
  // await tokenFarm.deployed();

  // await tokenFarm.setInitialConfiguration(dappToken.address, lpToken.address);

  // // deployProxy does the following:
  // // - Validate that the implementation is upgrade safe.
  // // - Deploy a proxy admin for your project (if needed).
  // // - Deploy the implementation contract.
  // // - Create and initialize the proxy contract.

  // console.log('TokenFarm deployed en:', tokenFarm.address);
  // // console.log(await tokenFarm.greet());

  // // Upgrading
  // const TokenFarmV2 = await ethers.getContractFactory('TokenFarmV2');
  // const upgraded = await upgrades.upgradeProxy(tokenFarm.address, TokenFarmV2);

  // // upgradeProxy:
  // // - Validate that the new implementation is upgrade safe and is compatible with the previous one.
  // // - Check if there is an implementation contract deployed with the same bytecode, 
  // // and deploy one if not.
  // // - Upgrade the proxy to use the new implementation contract.

  // console.log('TokenFarm upgraded en:', upgraded.address);
  // // console.log(await upgraded.greet("Lucas"));

  // // attach un contrato existente por su address
  // // const V2 = await TokenFarmV2.attach('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
  // // console.log(await V2.greet("Lionel"));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});