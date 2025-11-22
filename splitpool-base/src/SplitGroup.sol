// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "openzeppelin-contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";

/// @title SplitGroup
/// @notice Ledger on-chain de grupos y deudas tipo Splitwise, con gastos por subconjunto de participantes y aprobación.
/// @dev
///  - Un solo contrato maneja TODOS los grupos.
///  - Cada gasto tiene su lista de participantes dentro del grupo.
///  - El gasto solo impacta en netBalance cuando TODOS los participantes aprueban on-chain.
contract SplitGroup {
    using SafeERC20 for IERC20;

    // ==============
    //   Estructuras
    // ==============

    struct Group {
        address creator;
        address[] members;
        uint256 metadataPointer; // ID que apunta a CID en StoragePointer/Filecoin
        bool exists;
    }

    struct Expense {
        uint256 groupId;
        address payer;
        uint256 amount;
        uint256 metadataPointer; // metadata del gasto en Filecoin
        address[] participants;  // solo estos miembros comparten el gasto
        bool applied;            // true cuando ya impactó en netBalance
        bool exists;
    }

    // ===================
    //   Storage principal
    // ===================

    uint256 public groupCount;
    mapping(uint256 => Group) public groups;

    uint256 public expenseCount;
    mapping(uint256 => Expense) public expenses;

    // Ledger de saldos netos:
    // groupId => user => saldo neto
    // saldo > 0  => al usuario le deben
    // saldo < 0  => el usuario debe
    mapping(uint256 => mapping(address => int256)) public netBalance;

    // Aprobaciones de gastos:
    // expenseId => user => approved?
    mapping(uint256 => mapping(address => bool)) public expenseApproved;

    // =========
    //  Eventos
    // =========

    event GroupCreated(
        uint256 indexed groupId,
        address indexed creator,
        uint256 metadataPointer,
        uint256 membersLength
    );

    /// @notice Gasto creado (pendiente de aprobación de participantes)
    event ExpenseCreated(
        uint256 indexed expenseId,
        uint256 indexed groupId,
        address indexed payer,
        uint256 amount,
        uint256 metadataPointer,
        uint256 participantsLength
    );

    /// @notice Un participante aprobó el gasto
    event ExpenseApproved(
        uint256 indexed expenseId,
        uint256 indexed groupId,
        address indexed approver
    );

    /// @notice El gasto fue aplicado al ledger (ya impactó en netBalance)
    event ExpenseApplied(
        uint256 indexed expenseId,
        uint256 indexed groupId,
        uint256 amount
    );

    /// @notice Emitted cuando se salda (total o parcialmente) una deuda entre dos miembros
    event DebtSettled(
        uint256 indexed groupId,
        address indexed from,
        address indexed to,
        uint256 amount,
        address settlementToken
    );

    // =========
    //   Errores
    // =========

    error InvalidMembers();
    error GroupNotFound(uint256 groupId);
    error NotMember(uint256 groupId, address user);
    error ZeroAmount();
    error NothingToSettle();
    error InvalidMetadataPointer();
    error InvalidParticipants();
    error ExpenseNotFound(uint256 expenseId);
    error ExpenseAlreadyApplied(uint256 expenseId);
    error NotParticipant(uint256 expenseId, address user);
    error AlreadyApproved(uint256 expenseId, address user);

    // ==============
    //  Funciones core
    // ==============

    /// @notice Crea un grupo con miembros iniciales y metadata en Filecoin
    function createGroup(
        address[] calldata members,
        uint256 metadataPointer
    ) external returns (uint256 groupId) {
        if (members.length == 0) revert InvalidMembers();
        if (metadataPointer == 0) revert InvalidMetadataPointer();

        groupId = ++groupCount;

        Group storage g = groups[groupId];
        g.creator = msg.sender;
        g.metadataPointer = metadataPointer;
        g.exists = true;

        uint256 len = members.length;
        g.members = new address[](len);
        for (uint256 i = 0; i < len; ++i) {
            g.members[i] = members[i];
        }

        emit GroupCreated(groupId, msg.sender, metadataPointer, len);
    }

    /// @notice Crea un gasto para un subconjunto de participantes del grupo (incluyendo al payer).
    /// @dev El gasto queda PENDIENTE hasta que todos los participantes aprueban.
    function addExpense(
        uint256 groupId,
        uint256 amount,
        uint256 metadataPointer,
        address[] calldata participants
    ) external returns (uint256 expenseId) {
        Group storage g = groups[groupId];
        if (!g.exists) revert GroupNotFound(groupId);
        if (amount == 0) revert ZeroAmount();
        if (metadataPointer == 0) revert InvalidMetadataPointer();
        if (participants.length == 0) revert InvalidParticipants();
        if (!_isMember(g.members, msg.sender)) revert NotMember(groupId, msg.sender);

        // Validar que:
        // - todos los participants son miembros del grupo
        // - el payer (msg.sender) está en la lista de participants
        bool payerIncluded = false;
        uint256 pLen = participants.length;
        for (uint256 i = 0; i < pLen; ++i) {
            address p = participants[i];
            if (!_isMember(g.members, p)) revert NotMember(groupId, p);
            if (p == msg.sender) payerIncluded = true;
        }
        if (!payerIncluded) revert InvalidParticipants();

        // Crear expense
        expenseId = ++expenseCount;
        Expense storage e = expenses[expenseId];
        e.groupId = groupId;
        e.payer = msg.sender;
        e.amount = amount;
        e.metadataPointer = metadataPointer;
        e.exists = true;
        e.applied = false;

        // Copiar participantes al storage
        e.participants = new address[](pLen);
        for (uint256 i = 0; i < pLen; ++i) {
            e.participants[i] = participants[i];
        }

        // El payer queda auto-aprobado
        expenseApproved[expenseId][msg.sender] = true;

        emit ExpenseCreated(
            expenseId,
            groupId,
            msg.sender,
            amount,
            metadataPointer,
            pLen
        );
    }

    /// @notice Un participante aprueba un gasto. Cuando TODOS aprueban, el gasto se aplica al ledger.
    function approveExpense(uint256 expenseId) external {
        Expense storage e = expenses[expenseId];
        if (!e.exists) revert ExpenseNotFound(expenseId);
        if (e.applied) revert ExpenseAlreadyApplied(expenseId);

        Group storage g = groups[e.groupId];
        if (!g.exists) revert GroupNotFound(e.groupId);

        // Debe ser participante del gasto y miembro del grupo
        if (!_isParticipant(e.participants, msg.sender)) {
            revert NotParticipant(expenseId, msg.sender);
        }
        if (!_isMember(g.members, msg.sender)) {
            revert NotMember(e.groupId, msg.sender);
        }

        if (expenseApproved[expenseId][msg.sender]) {
            revert AlreadyApproved(expenseId, msg.sender);
        }

        // Marcar aprobación
        expenseApproved[expenseId][msg.sender] = true;
        emit ExpenseApproved(expenseId, e.groupId, msg.sender);

        // Verificar si TODOS los participantes aprobaron
        if (_allParticipantsApproved(expenseId, e.participants)) {
            _applyExpenseToLedger(expenseId);
        }
    }

    /// @notice Saldar deuda entre msg.sender (from) y 'to', pagando en ETH o ERC20.
    function settleDebt(
        uint256 groupId,
        address to,
        uint256 amount,
        address settlementToken
    ) external payable {
        Group storage g = groups[groupId];
        if (!g.exists) revert GroupNotFound(groupId);
        if (!_isMember(g.members, msg.sender) || !_isMember(g.members, to)) {
            revert NotMember(groupId, msg.sender);
        }
        if (amount == 0) revert ZeroAmount();

        int256 current = netBalance[groupId][msg.sender];

        // msg.sender debe tener saldo negativo (debe plata)
        if (current >= 0) revert NothingToSettle();

        uint256 owing = uint256(-current);
        if (amount > owing) {
            amount = owing;
        }

        // Transferencia de fondos
        if (settlementToken == address(0)) {
            // ETH: accept msg.value >= amount, send `amount` and refund excess
            require(msg.value >= amount, "Incorrect ETH amount");
            (bool ok, ) = to.call{value: amount}("");
            require(ok, "ETH transfer failed");
            uint256 refund = msg.value - amount;
            if (refund > 0) {
                (bool r, ) = payable(msg.sender).call{value: refund}("");
                require(r, "Refund failed");
            }
        } else {
            // ERC20
            require(msg.value == 0, "ETH not required");
            IERC20(settlementToken).safeTransferFrom(msg.sender, to, amount);
        }

        // Ajustar net balances
        netBalance[groupId][msg.sender] += int256(amount);
        netBalance[groupId][to] -= int256(amount);

        emit DebtSettled(groupId, msg.sender, to, amount, settlementToken);
    }

    // ===============
    //  Funciones view
    // ===============

    function getMembers(uint256 groupId) external view returns (address[] memory) {
        Group storage g = groups[groupId];
        if (!g.exists) revert GroupNotFound(groupId);
        return g.members;
    }

    function getUserNetBalance(uint256 groupId, address user) external view returns (int256) {
        Group storage g = groups[groupId];
        if (!g.exists) revert GroupNotFound(groupId);
        return netBalance[groupId][user];
    }

    function getGroupBalances(
        uint256 groupId
    ) external view returns (address[] memory members, int256[] memory balances) {
        Group storage g = groups[groupId];
        if (!g.exists) revert GroupNotFound(groupId);

        uint256 len = g.members.length;
        members = new address[](len);
        balances = new int256[](len);

        for (uint256 i = 0; i < len; ++i) {
            address m = g.members[i];
            members[i] = m;
            balances[i] = netBalance[groupId][m];
        }
    }

    function getExpenseParticipants(uint256 expenseId) external view returns (address[] memory) {
        Expense storage e = expenses[expenseId];
        if (!e.exists) revert ExpenseNotFound(expenseId);
        return e.participants;
    }

    // ==================
    //   Helpers internos
    // ==================

    function _applyExpenseToLedger(uint256 expenseId) internal {
        Expense storage e = expenses[expenseId];
        if (!e.exists) revert ExpenseNotFound(expenseId);
        if (e.applied) revert ExpenseAlreadyApplied(expenseId);

        Group storage g = groups[e.groupId];
        if (!g.exists) revert GroupNotFound(e.groupId);

        uint256 len = e.participants.length;
        require(len > 0, "No participants");

        uint256 share = e.amount / len;
        // Resto se podría manejar a favor del payer si querés:
        // uint256 remainder = e.amount % len;

        // Ajustar ledger para participantes
        for (uint256 i = 0; i < len; ++i) {
            address member = e.participants[i];
            if (member == e.payer) continue;
            netBalance[e.groupId][member] -= int256(share);
        }
        netBalance[e.groupId][e.payer] += int256(share * (len - 1));
        // + opcional: sumar remainder al payer

        e.applied = true;

        emit ExpenseApplied(expenseId, e.groupId, e.amount);
    }

    function _isMember(address[] storage members, address user) internal view returns (bool) {
        uint256 len = members.length;
        for (uint256 i = 0; i < len; ++i) {
            if (members[i] == user) return true;
        }
        return false;
    }

    function _isParticipant(address[] storage participants, address user) internal view returns (bool) {
        uint256 len = participants.length;
        for (uint256 i = 0; i < len; ++i) {
            if (participants[i] == user) return true;
        }
        return false;
    }

    function _allParticipantsApproved(
        uint256 expenseId,
        address[] storage participants
    ) internal view returns (bool) {
        uint256 len = participants.length;
        for (uint256 i = 0; i < len; ++i) {
            if (!expenseApproved[expenseId][participants[i]]) {
                return false;
            }
        }
        return true;
    }
}