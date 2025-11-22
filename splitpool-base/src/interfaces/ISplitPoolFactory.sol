// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ISplitPool} from "./ISplitPool.sol";

interface ISplitPoolFactory {
    /// @notice Emitted when a new pool is created
    /// @param pool address of the newly created pool contract
    /// @param creator address of the user who created the pool
    /// @param group address of the group contract (SplitGroup) or address(0) if outside group
    /// @param merchant address of the merchant who will receive the funds
    /// @param settlementToken settlement token (USDC or ETH sentinel)
    /// @param totalAmount target amount of the pool
    /// @param metadataPointer Id/pointer to metadata in StoragePointer/IPFS
    event PoolCreated(
        address indexed pool,
        address indexed creator,
        address indexed group,
        address merchant,
        address settlementToken,
        uint256 totalAmount,
        uint256 metadataPointer,
        uint256 participantsLength
    );

    /// @notice Error if the token is not one of the accepted ones (example, only USDC/ETH)
    error UnsupportedSettlementToken(address token);

    /// @notice Error if the merchant is invalid
    error InvalidMerchant(address merchant);

    /// @notice Error if the total amount is zero
    error InvalidTotalAmount();

    /// @notice Returns the total number of pools created
    function allPoolsLength() external view returns (uint256);

    /// @notice Returns the address of a pool by index
    function allPools(uint256 index) external view returns (address);

    /// @notice Creates a new payment pool
    /// @param group Associated group contract (SplitGroup) or address(0)
    /// @param merchant Wallet of the merchant
    /// @param settlementToken Settlement token (USDC or ETH sentinel)
    /// @param totalAmount Total amount to be raised
    /// @param metadataPointer Pointer to metadata in StoragePointer/IPFS
    /// @return pool Address of the new pool
    function createPool(
        address group,
        address merchant,
        address settlementToken,
        uint256 totalAmount,
        uint256 metadataPointer,
        address[] calldata participants
    ) external returns (address pool);

    /// @notice Returns all pools associated with a group
    /// @dev Useful for filtering by group from the dashboard/MultiBaas
    function getPoolsByGroup(address group) external view returns (address[] memory);
}
