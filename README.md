# Simple DeFi Yield Farming Exercise

How to use Farms (Yield Farming) in PancakeSwap
https://docs.pancakeswap.finance/products/yield-farming/how-to-use-farms


### Use case

In this exercise, you will implement a Simple Token Farm DeFi project.

The Farm should allow user to make deposits and widthdrawals of an mocked LP Token.
Users can also claim the rewards generated during staking. These reward tokens are the platform token: name: "DApp Token", token "DAPP"
The contract contains the framework and comments to implement the contract. Follow the comments outlined to implement it. 

The use case of The Simple Bank contract is as follows
- Users deposits LP Tokens `deposit()`
- User can harvest or claim rewards `claimRewards()`
- User can unstake all his LP Tokens `withdraw()` but still claim pendig rewards
- Each time the amount of staked LP tokens is updated, the rewards must be recalculated first
- The platform owner can call the `distributeRewardsAll()` method at regular intervals to update the pending rewards of all staking users.


### Contracts

- LPToken.sol: LP token contract, used for staking
- DappToken.sol: Platform token contract, used as reward
- TokenFarm.sol: The Farm contract



## Requirements
1. Create a new *Hardhat* project, add the provided contract
2. Implement all functions, events and anything mentioned in code comments in the contract
3. Deploy contracts in a local environment

### Bonus Points
In addition to the required features, feel free to add the extra bonus features to make your code stand out from others.


### Bonus: 1 Modifier (Completed)

Create `modifier()` functions that validates:
    1. if the function caller is a staking user
    2. if the function caller is the owner of the contract
Add the modifier in the functions that require them.


### Bonus: 2 Struct (Completed)

Create a `Struct{}` that contains user's staking information and replace the following `mapping()`s 

```
mapping(address => uint256) public stakingBalance;
mapping(address => uint256) public checkpoints;
mapping(address => uint256) public pendigRewards;
mapping(address => bool) public hasStaked;
mapping(address => bool) public isStaking;
```

By a new `mapping()` of `(address => structUser)`. 
Modify the corresponding functions according to this new `mapping()`.

### Bonus: 3 Tests (Completed)

Create a test file for the SimpleBank contract that allows you to test:
1. Mint LP Tokens for a user and make a deposit of those tokens
2. The platform correctly distributes rewards to all staking users
3. User claim rewards and check if they were successfully transferred to his account
4. User unstake all deposited LP tokens and claim pending rewards, if any

### Bonus: 4 Variable rewards per block (Not Completed)
1. Transform block rewards into a range, allow owner to change that value.

### Bonus: 5 Withdrawal fee (Completed)
1. Charge a fee at the time of claiming of rewards.
2. Add a function so that the owner can withdraw that fee.

### Bonus: 6 Proxy (new proyect) (Not Completed)
1. Implement bonus 5 as a V2 version of our farming contract
Or
2. Our platform has grown and we are going to implement farms for more types of LP tokens. How can we solve the deployment of new farming contracts saving gas?

# How to execute this project.
```
npx hardhat test // to execute the tests.
npx hardhat run scripts/deploy-tk-v1.ts // To deploy the TokenFarm (v1)
npx hardhat run scripts/deploy-tk-v2.ts // To deploy the TokenFarm (v2)
```
