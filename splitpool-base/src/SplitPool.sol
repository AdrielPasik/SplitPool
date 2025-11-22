// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "openzeppelin-contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ISplitPool.sol";

contract SplitPool is ISplitPool, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public override settlementToken; // address(0) = ETH
    address public override merchant;
    uint256 public override totalAmount;
    uint256 public override collectedAmount;
    PoolStatus public override status;
    uint256 public override metadataPointer;
    address public factory;    // who deployed it
    address public creator;    // who initiated the pool (from factory)

    constructor(
        address _creator,
        address _merchant,
        address _settlementToken,
        uint256 _totalAmount,
        uint256 _metadataPointer
    ) {
        require(_merchant != address(0), "Invalid merchant");
        require(_totalAmount > 0, "Invalid total amount");

        creator = _creator;
        factory = msg.sender; // factory will deploy -> msg.sender = factory
        merchant = _merchant;
        settlementToken = _settlementToken;
        totalAmount = _totalAmount;
        metadataPointer = _metadataPointer;
        status = PoolStatus.Open;
    }

    /// @notice returns amount remaining to complete pool
    function remainingAmount() public view override returns (uint256) {
        if (collectedAmount >= totalAmount) return 0;
        return totalAmount - collectedAmount;
    }

    /// @notice deposit into the pool (ETH or ERC20)
    function deposit(uint256 amount) external payable override nonReentrant {
        if (status != PoolStatus.Open) {
            revert PoolAlreadyPaid();
        }

        if (settlementToken == address(0)) {
            // ETH flow
            if (msg.value != amount) revert InvalidSettlementToken(address(0));
            collectedAmount += msg.value;
        } else {
            // ERC20 flow
            if (msg.value != 0) revert InvalidSettlementToken(address(0));
            IERC20 token = IERC20(settlementToken);
            // transferFrom payer -> this
            token.safeTransferFrom(msg.sender, address(this), amount);
            collectedAmount += amount;
        }

        emit Deposit(address(this), msg.sender, amount, collectedAmount);

        // if fullfilled or overfunded, pay merchant
        if (collectedAmount >= totalAmount) {
            _autoPay();
        }
    }

    /// @notice external wrapper to allow manual trigger
    function autoPay() external override nonReentrant {
        _autoPay();
    }

    function _autoPay() internal {
        if (status != PoolStatus.Open) revert PoolAlreadyPaid();
        if (collectedAmount < totalAmount) revert PoolNotFullyFunded(collectedAmount, totalAmount);

        status = PoolStatus.Paid;

        uint256 toTransfer = collectedAmount;

        if (settlementToken == address(0)) {
            // send ETH
            (bool ok, ) = merchant.call{value: toTransfer}("");
            require(ok, "ETH transfer failed");
        } else {
            IERC20(settlementToken).safeTransfer(merchant, toTransfer);
        }

        emit PoolPaid(address(this), settlementToken, toTransfer, merchant);
    }

    // fallbacks to accept ETH only if pool expects ETH deposits
    receive() external payable {
        require(settlementToken == address(0), "Pool not accepting ETH");
        // route to deposit logic: we can't know amount parameter here, so increase collectedAmount
        collectedAmount += msg.value;
        emit Deposit(address(this), msg.sender, msg.value, collectedAmount);
        if (collectedAmount >= totalAmount) {
            _autoPay();
        }
    }

    fallback() external payable {
        if (msg.value == 0) return; // nothing to do if no ETH sent
        require(settlementToken == address(0), "Pool not accepting ETH");
        collectedAmount += msg.value;
        emit Deposit(address(this), msg.sender, msg.value, collectedAmount);
        if (collectedAmount >= totalAmount) {
            _autoPay();
        }
    }
}
