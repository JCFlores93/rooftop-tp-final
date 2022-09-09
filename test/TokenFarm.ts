import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenFarm", function () {
  async function deployTokenFarm() {

    const [owner, otherAccount] = await ethers.getSigners();

    const emission = ethers.utils.parseEther("1000000");
    const DappToken = await ethers.getContractFactory("DappToken");
    const dappToken = await DappToken.deploy(emission);
    await dappToken.deployed();
  
    const LPToken = await ethers.getContractFactory("LPToken");
    const lpToken = await LPToken.deploy(emission);
    await lpToken.deployed();
  
    const TokenFarm = await ethers.getContractFactory("TokenFarm");
    const tokenFarm = await TokenFarm.deploy(dappToken.address, lpToken.address);
    await tokenFarm.deployed();

    await dappToken.transfer(tokenFarm.address, emission)
    await lpToken.transfer(otherAccount.address, "100", { from: owner.address })
    return { dappToken, lpToken, tokenFarm, owner, otherAccount, emission };
  }

  async function mineBlocks(n: number) {
    for (let index = 0; index < n; index++) {
      await ethers.provider.send("evm_mine", []);
    }
  }

  describe("DappToken Deployment", function() {
    it("Check the contract name",async () => {
      const { dappToken } = await loadFixture(deployTokenFarm);
      console.log(await dappToken.name())
      expect(await dappToken.name()).to.equal("DApp Token")
    })
  })

  describe("LPToken Deployment", function() {
    it("Check the contract name",async () => {
      const { lpToken } = await loadFixture(deployTokenFarm);
      console.log(await lpToken.name())
      expect(await lpToken.name()).to.equal("LPToken")
    })
  })

  describe("Token Farm Deployment", function() {
    it("Check the contract name",async () => {
      const { tokenFarm } = await loadFixture(deployTokenFarm);
      console.log(await tokenFarm.name())
      expect(await tokenFarm.name()).to.equal("Simple Token Farm")
    })

  })

  describe("Farming tokens",async () => {
    it("Mint LP Tokens for a user and make a deposit of those tokens", async() => {
      const { lpToken, tokenFarm, owner, otherAccount } = await loadFixture(deployTokenFarm);

      let result
      // Check investor balance before staking
      result = await lpToken.balanceOf(otherAccount.address)
      expect(result.toString()).to.be.equal("100")

      // Make deposit
      await lpToken.connect(otherAccount).approve(tokenFarm.address, "100")
      await tokenFarm.connect(otherAccount).deposit("100")

      // Check staking result
      result = await (await tokenFarm.mapUsers(otherAccount.address)).stakingBalance
      expect(result.toString()).to.be.equal("100")

      // Investor staking status correct after staking.
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).isStaking
      expect(result.toString()).to.be.equal("true")

      // Token Farm balance correct after staking
      result = await lpToken.connect(otherAccount).balanceOf(tokenFarm.address)
      expect(result.toString()).to.be.equal("100")
    })

    it("The platform correctly distributes rewards to all staking users", async() => {
      const { dappToken, lpToken, tokenFarm, owner, otherAccount } = await loadFixture(deployTokenFarm);

      let result
      // Check investor balance before staking
      result = await lpToken.balanceOf(otherAccount.address)
      expect(result.toString()).to.equal("100")

      // Make deposit
      await lpToken.connect(otherAccount).approve(tokenFarm.address, "100")
      await tokenFarm.connect(otherAccount).deposit("100")

      // Check staking balance
      result = await (await tokenFarm.mapUsers(otherAccount.address)).stakingBalance
      expect(result.toString()).to.be.equal("100")

      // Investor staking status correct after staking.
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).isStaking
      expect(result.toString()).to.be.equal("true")

      // Check tokenFarm balance
      result = await lpToken.balanceOf(tokenFarm.address)
      expect(result.toString()).to.be.equal("100")

      await mineBlocks(40)

      result = expect(await tokenFarm.connect(owner).distributeRewardsAll()).not.to.be.revertedWith("No rewards to claim.")
    })

    it("User claim rewards and check if they were successfully transfered to his account", async () => {
      const { dappToken, lpToken, tokenFarm, owner, otherAccount } = await loadFixture(deployTokenFarm); 

      let result
      // Check investor balance before staking
      result = await lpToken.balanceOf(otherAccount.address)
      expect(result.toString()).to.equal("100")

      // Make deposit
      await lpToken.connect(otherAccount).approve(tokenFarm.address, "100")
      await tokenFarm.connect(otherAccount).deposit("100")

      // Check staking result
      result = await lpToken.balanceOf(otherAccount.address)
      expect(result.toString()).to.be.equal("0")

      // Check tokenFarm balance
      result = await lpToken.balanceOf(tokenFarm.address)
      expect(result.toString()).to.be.equal("100")

      // Check staking balance
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).stakingBalance
      expect(result.toString()).to.be.equal("100")

      // Check staking status.
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).isStaking
      expect(result.toString()).to.be.equal("true") 

      // Move forward 40 blocks
      await mineBlocks(40);

      // Withdraw tokens
      await tokenFarm.connect(otherAccount).withdraw();

      // Check if there's any pending rewards
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).pendigRewards;
      expect(result).to.be.greaterThanOrEqual(41);

      // Claim tokens
      await tokenFarm.connect(otherAccount).claimRewards();

      // Check if reward was claimed;
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).pendigRewards;
      expect(result).to.be.equal(0);
    })

    it("User unstake all deposited LP tokens and claim pending rewards, if any", async () => {
      const { lpToken, tokenFarm, owner, otherAccount } = await loadFixture(deployTokenFarm); 

      let result
      // Check investor balance before staking
      result = await lpToken.balanceOf(otherAccount.address)
      expect(result.toString()).to.equal("100")

      // Make deposit
      await lpToken.connect(otherAccount).approve(tokenFarm.address, "100")
      await tokenFarm.connect(otherAccount).deposit("100")

      // Check staking result
      result = await lpToken.balanceOf(otherAccount.address)
      expect(result.toString()).to.be.equal("0")

      // Check tokenFarm balance
      result = await lpToken.balanceOf(tokenFarm.address)
      expect(result.toString()).to.be.equal("100")

      // Check staking balance
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).stakingBalance
      expect(result.toString()).to.be.equal("100")

      // Check staking status.
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).isStaking
      expect(result.toString()).to.be.equal("true") 

      // Move forward 40 blocks
      await mineBlocks(40);

      // Withdraw tokens
      await tokenFarm.connect(otherAccount).withdraw();

      // Check if there's any pending rewards
      result = await (await tokenFarm.connect(otherAccount).mapUsers(otherAccount.address)).pendigRewards;
      expect(result).to.be.greaterThanOrEqual(41);
    })
  })
});
