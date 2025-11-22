// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/ISplitPoolFactory.sol";
import "./SplitPool.sol";

contract SplitPoolFactory is ISplitPoolFactory {
    address[] internal _allPools;
    mapping(address => address[]) internal poolsByGroup;
    
    constructor() {}

    function allPoolsLength() external view override returns (uint256) {
        return _allPools.length;
    }

    function allPools(uint256 index) external view returns (address) {
        return _allPools[index];
    }

    function createPool(
        address group,
        address merchant,
        address settlementToken,
        uint256 totalAmount,
        uint256 metadataPointer,
        address[] calldata participants
    ) external override returns (address pool) {
        if (merchant == address(0)) revert InvalidMerchant(merchant);
        if (totalAmount == 0) revert InvalidTotalAmount();
        if (participants.length == 0) revert InvalidTotalAmount(); // reuse error; could define InvalidParticipants
        // no factory-level enforcement; accept ETH (address(0)) or any ERC20 for now

        // Optional: validate settlementToken here (only allow USDC or ETH)
        // We'll accept any token for now. Factory-level validation can be added later.

        // Deploy new SplitPool; pass creator = msg.sender
        SplitPool s = new SplitPool(
            msg.sender,
            merchant,
            settlementToken,
            totalAmount,
            metadataPointer,
            participants
        );

        pool = address(s);
        _allPools.push(pool);

        if (group != address(0)) {
            poolsByGroup[group].push(pool);
        }

        emit PoolCreated(pool, msg.sender, group, merchant, settlementToken, totalAmount, metadataPointer, participants.length);
    }

    function getPoolsByGroup(address group) external view override returns (address[] memory) {
        return poolsByGroup[group];
    }

    // helper to read internal array (not in interface)
    function getAllPools() external view returns (address[] memory) {
        return _allPools;
    }
}
