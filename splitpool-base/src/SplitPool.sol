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
    uint256 public override sharePerUser;

    address[] private _participants;
    mapping(address => bool) private _hasPaid;
    uint256 public paidCount;
    address public factory;    // who deployed it
    address public creator;    // who initiated the pool (from factory)

    constructor(
        address _creator,
        address _merchant,
        address _settlementToken,
        uint256 _totalAmount,
        uint256 _metadataPointer,
        address[] memory participants
    ) {
        require(_merchant != address(0), "Invalid merchant");
        require(_totalAmount > 0, "Invalid total amount");
        require(participants.length > 0, "No participants");
        require(_settlementToken == address(0) || _settlementToken != address(0), "token sentinel check"); // placeholder for future validation

        // calcular share por usuario y validar divisibilidad exacta
        if (_totalAmount % participants.length != 0) {
            revert NonDivisibleTotal(_totalAmount, participants.length);
        }
        sharePerUser = _totalAmount / participants.length;
        _participants = participants;

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

    function participantsLength() external view override returns (uint256) {
        return _participants.length;
    }

    function participantAt(uint256 index) external view override returns (address) {
        return _participants[index];
    }

    function hasPaid(address user) external view override returns (bool) {
        return _hasPaid[user];
    }

    /// @notice deposit into the pool (ETH or ERC20)
    function deposit(uint256 amount) external payable override nonReentrant {
        // compatibilidad: exigimos que amount == sharePerUser y redirigimos a payShare
        if (amount != sharePerUser) revert IncorrectShareAmount(amount, sharePerUser);
        payShare();
    }

    function payShare() public payable override nonReentrant {
        if (status != PoolStatus.Open) revert PoolAlreadyPaid();
        if (_hasPaid[msg.sender]) revert AlreadyPaid(msg.sender);
        // verificar que sea participante
        if (!_isParticipant(msg.sender)) revert NotParticipant(msg.sender);

        if (settlementToken == address(0)) {
            // ETH: debe enviar exactamente sharePerUser
            if (msg.value != sharePerUser) revert IncorrectShareAmount(msg.value, sharePerUser);
            collectedAmount += msg.value;
        } else {
            // ERC20: msg.value debe ser 0 y transferimos sharePerUser
            if (msg.value != 0) revert IncorrectShareAmount(msg.value, 0);
            IERC20 token = IERC20(settlementToken);
            token.safeTransferFrom(msg.sender, address(this), sharePerUser);
            collectedAmount += sharePerUser;
        }

        _hasPaid[msg.sender] = true;
        paidCount += 1;

        emit ParticipantPaid(address(this), msg.sender, sharePerUser, paidCount, _participants.length - paidCount);
        emit Deposit(address(this), msg.sender, sharePerUser, collectedAmount); // mantener evento legacy

        // liquidar solo cuando todos pagaron y se cumple total exacto
        if (paidCount == _participants.length && collectedAmount == totalAmount) {
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
        // bloquear envíos directos para evitar sobrepago accidental
        revert DirectEthTransferNotAllowed();
    }

    fallback() external payable {
        if (msg.value > 0) revert DirectEthTransferNotAllowed();
    }

    // interno: verificar si address está en participantes (lineal; se puede optimizar con mapping si escala)
    function _isParticipant(address user) internal view returns (bool) {
        uint256 len = _participants.length;
        for (uint256 i = 0; i < len; ++i) {
            if (_participants[i] == user) return true;
        }
        return false;
    }
}
