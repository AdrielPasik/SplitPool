// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/token/ERC20/IERC20.sol";

interface ISplitPool {
    /// @notice Pool status
    enum PoolStatus {
        Open,
        Paid,
        Cancelled
    }

    /// @notice Emitted when someone deposits in the pool
    event Deposit(
        address indexed pool,
        address indexed payer,
        uint256 amount,
        uint256 pooledAmount
    );

    /// @notice Emitted when the pool is paid to the merchant
    /// @dev This event will be listened to by Chainlink CRE
    event PoolPaid(
        address indexed pool,
        address indexed settlementToken,
        uint256 amount,
        address indexed merchant
    );

    /// @notice Emitted cuando un participante paga su parte fija
    event ParticipantPaid(
        address indexed pool,
        address indexed payer,
        uint256 amount,
        uint256 paidCount,
        uint256 remainingParticipants
    );

    /// @notice Emitted when a user is refunded from a cancelled pool
    event Refunded(
        address indexed pool,
        address indexed user,
        uint256 amount
    );

    /// @notice Error if the settlement token is invalid
    error InvalidSettlementToken(address token);

    /// @notice Error if the pool has already been paid
    error PoolAlreadyPaid();

    /// @notice Error if the pool is cancelled
    error PoolCancelled();

    /// @notice Error if trying to pay without reaching the total
    error PoolNotFullyFunded(uint256 collected, uint256 required);

    /// @notice Error if the user has outstanding debts in the system
    /// @dev Will be used when integrating logic with SplitGroup / DebtManager
    error OutstandingDebts(address user, uint256 totalDebt);

    /// @notice Error si el total no se puede dividir exactamente entre participantes
    error NonDivisibleTotal(uint256 total, uint256 participants);

    /// @notice Error si el usuario no es participante
    error NotParticipant(address user);

    /// @notice Error si el usuario ya pagó su parte
    error AlreadyPaid(address user);

    /// @notice Error si el monto enviado no coincide exactamente con la parte fija
    error IncorrectShareAmount(uint256 sent, uint256 expected);

    /// @notice Error si se envía ETH directo a receive/fallback cuando no corresponde
    error DirectEthTransferNotAllowed();

    // ==========
    //  Getters
    // ==========

    function settlementToken() external view returns (address);

    function merchant() external view returns (address);

    function totalAmount() external view returns (uint256);

    function collectedAmount() external view returns (uint256);

    function status() external view returns (PoolStatus);

    /// @notice returns the remaining amount to reach totalAmount of the pool
    function remainingAmount() external view returns (uint256);

    /// @notice pointer to metadata in StoragePointer/IPFS
    /// @dev defined as uint256 to integrate later with StoragePointer
    function metadataPointer() external view returns (uint256);

    /// @notice Monto exacto que cada participante debe pagar
    function sharePerUser() external view returns (uint256);

    /// @notice Cantidad total de participantes
    function participantsLength() external view returns (uint256);

    /// @notice Devuelve participante por índice
    function participantAt(uint256 index) external view returns (address);

    /// @notice Indica si un participante ya pagó
    function hasPaid(address user) external view returns (bool);

    // ==============
    //  Core actions
    // ==============

    /// @notice Deposit into the pool
    /// @dev
    ///  - If settlementToken == address(0): use msg.value
    ///  - If settlementToken != address(0): the caller
    ///    must have previously approved() the SplitPool contract
    ///  - Implementation will:
    ///      - check debts (calling SplitGroup / DebtManager)
    ///      - update collectedAmount
    ///      - if totalAmount is reached => autoPay()
    function deposit(uint256 amount) external payable;

    /// @notice Pagar la parte fija asignada al msg.sender
    /// @dev Para tokens ERC20: se requiere allowance previo igual a sharePerUser
    ///      Para ETH: se debe enviar exactamente msg.value == sharePerUser
    function payShare() external payable;

    /// @notice Manually pay the merchant (in case we want to expose it)
    /// @dev In the implementation it will be internal + public wrapper, but
    ///      we leave it in the interface to be able to test/call it
    function autoPay() external;
}
