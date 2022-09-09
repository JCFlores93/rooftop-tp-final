import { ethers } from "hardhat";

async function main() {
  const emission = ethers.utils.parseEther("1000000");
  const DappToken = await ethers.getContractFactory("DappToken");
  const dappToken = await DappToken.deploy(emission);
  await dappToken.deployed();

  const LPToken = await ethers.getContractFactory("LPToken");
  const lpToken = await LPToken.deploy(emission);
  await lpToken.deployed();

  const TokenFarm = await ethers.getContractFactory("TokenFarmV2");
  const tokenFarm = await TokenFarm.deploy(dappToken.address, lpToken.address);
  await tokenFarm.deployed();

  console.log("DappToken deployed to:", dappToken.address);
  console.log("LPToken deployed to:", lpToken.address);
  console.log("TokenFarmV2 deployed to: ", tokenFarm.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
