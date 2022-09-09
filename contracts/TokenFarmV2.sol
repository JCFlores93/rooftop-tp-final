// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DappToken.sol";
import "./LPToken.sol";

// Import this file to use console.log
import "hardhat/console.sol";

struct structUser {
    uint256 stakingBalance;
    uint256 checkpoints;
    uint256 pendigRewards;
    bool hasStaked;
    bool isStaking;
}

/**
    A super simple token farm 
*/
contract TokenFarmV2 {

    // State variables

    string public name = "Simple Token Farm";

    address public owner;   
    DappToken public dappToken; //mock platform reward token
    LPToken public lpToken; // mock LP Token staked by users

    // rewards per block
    uint256 public constant REWARD_PER_BLOCK = 1e18;

    // total staked
    uint256 public totalStaked;

    // total accumulated fee
    uint256 public accumulatedFee;

    // iterable list of staking users
    address[] public stakers;

    mapping (address => structUser) public mapUsers;

    // Events - add events as needed
    event Deposit(address indexed _from, uint256 _amount);
    event Withdraw(address indexed _address, uint256 _amount);
    event DistributeRewardsAll(address indexed _caller, uint indexed _totalAmount);
    event ClaimRewards(address indexed _address, uint256 _amount);

    /**
        constructor
     */ 
    constructor(DappToken _dappToken, LPToken _lpToken) {
        // Set the owner to the creator of this contract
        // Set the instance of the deployed Dapp and LP contracts
        owner = msg.sender;
        dappToken = _dappToken;
        lpToken = _lpToken;
    }

    // function setInitialConfiguration(DappToken _dappToken, LPToken _lpToken) public {
    //     console.log("Changing greeting from '%s' to '%s'", _dappToken, _lpToken);
    //     // greeting = _greeting;
    //     owner = msg.sender;
    //     dappToken = _dappToken;
    //     lpToken = _lpToken;
    // }

    modifier amountGreaterThanZero(uint256 amount) {
        require(amount > 0, "The amount must be greater than 0.");
        _;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier isTheUserStaking {
        require(mapUsers[msg.sender].isStaking, "The user is not staking.");
        _;
    }

    /**
     @notice Deposit
     Users deposits LP Tokens
     */
    function deposit(uint256 _amount) 
        public 
        amountGreaterThanZero(_amount) {
        // Require amount greater than 0 -> Handled with modifier amountGreaterThanZero

        // Trasnfer Mock LP Tokens to this contract for staking
        lpToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        mapUsers[msg.sender].stakingBalance = mapUsers[msg.sender].stakingBalance + _amount;
        totalStaked += _amount;

        if(!mapUsers[msg.sender].hasStaked) {
            stakers.push(msg.sender);
        }

        // Update staking status
        mapUsers[msg.sender].isStaking = true;
        mapUsers[msg.sender].hasStaked = true;

        if(mapUsers[msg.sender].checkpoints == 0) {
            mapUsers[msg.sender].checkpoints = block.number;
        }

        // calculate rewards
        distributeRewards(msg.sender);

        // emit some event
        emit Deposit(msg.sender, _amount);
    }

    /**
     @notice Withdraw
     Unstaking LP Tokens (Withdraw all LP Tokens)
     */
    function withdraw() 
        public
        isTheUserStaking // check is sender is staking
        {
        console.log("Withdraw was called");
        // Fetch staking balance
        uint256 balance = mapUsers[msg.sender].stakingBalance;

        // Require amount greater than 0
        require(balance > 0, "The balance must be greater then zero.");

        console.log(msg.sender);

        // calculate rewards before reseting staking balance
        distributeRewards(msg.sender);

        // Reset staking balance
        mapUsers[msg.sender].stakingBalance = 0;
        totalStaked -= balance;

        // Update staking status
        mapUsers[msg.sender].isStaking = false;

        // emit some event
        emit Withdraw(msg.sender, balance);

        // Transfer LP Tokens to user
        lpToken.transfer(msg.sender, balance);
    }

    /**
     @notice Claim Rewards
     Users harvest pendig rewards
     Pendig rewards are minted to the user
     */
    function claimRewards() public {
        // fetch pendig rewards
        uint256 reward = mapUsers[msg.sender].pendigRewards;

        // check if user has pending rewards
        require(reward > 0, "No rewards to claim.");

        uint256 fee = reward * 3 / 100;
        accumulatedFee += fee;

        // reset pendig rewards balance
        mapUsers[msg.sender].pendigRewards = 0;

        // mint rewards tokens to user
        dappToken.transfer(msg.sender, reward);

        // emit some event
        emit ClaimRewards(msg.sender, reward);
    }

    function claimFees() public onlyOwner {
        require(accumulatedFee > 0, "Accumulated fee must be greather than zero.");
        dappToken.transfer(msg.sender, accumulatedFee);
    }


    /**
     @notice Distribute rewards 
     Distribute rewards for all staking user
     Only owner can call this function
     */
    function distributeRewardsAll() 
        external
        onlyOwner {
        // set rewards to all stakers
        // in this case the iterable list of staking users could be useful
        uint totalAmount = 0;
        for(uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = mapUsers[recipient].stakingBalance;
            console.log(balance);
            if (balance > 0) {
                totalAmount += balance;
                dappToken.transfer(recipient, balance);
                if (mapUsers[recipient].pendigRewards > 0) {
                    claimRewards();
                }
            }
        }

        // emit some event
        emit DistributeRewardsAll(msg.sender, totalAmount);
    }

    /**
     @notice Distribute rewards
     calculates rewards for the indicated beneficiary 
     */
    function distributeRewards(address beneficiary) private {
        // get las checkpoint block
        uint256 checkpoint = mapUsers[beneficiary].checkpoints;

        // calculates rewards:
        if (block.number > checkpoint) {
            uint256 reward = (block.number - checkpoint) * mapUsers[beneficiary].stakingBalance / totalStaked ;

            mapUsers[beneficiary].checkpoints = block.number;
            mapUsers[beneficiary].pendigRewards += reward;
        }
    }
}

// REWARD_PER_BLOCK = 1
// blocks-since-last-checkpoint: 50
// total rewards = 50
// total staked = 40

// user reward = (totalRewards/TotalStaked) * userStaked

// user 1: deposits 10 reward 12,5
// user 2: deposits 30 reward 37,5
