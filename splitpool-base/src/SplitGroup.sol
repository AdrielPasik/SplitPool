// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "openzeppelin-contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";

/// @title SplitGroup
/// @notice Gestión básica de grupos y gastos estilo Splitwise con metadata en Filecoin (via StoragePointer)
/// @dev Versión inicial: división equitativa entre todos los miembros del grupo.
contract SplitGroup {
	using SafeERC20 for IERC20;

	struct Group {
		address creator;
		address[] members;
		bytes32 metadataId; // apunta a CID en StoragePointer
		bool exists;
	}

	struct Expense {
		uint256 groupId;
		address payer;
		uint256 amount;
		bytes32 metadataId; // CID de recibo / detalles gasto
		bool settled; // futuro, para gastos con lógica específica
	}

	// grupos
	uint256 public groupCount;
	mapping(uint256 => Group) public groups;

	// gastos
	uint256 public expenseCount;
	mapping(uint256 => Expense) public expenses;

	// balances netos por grupo y usuario (positivo: le deben, negativo: debe)
	mapping(uint256 => mapping(address => int256)) public netBalance; // groupId => user => saldo

	event GroupCreated(uint256 indexed groupId, address indexed creator, bytes32 metadataId, uint256 membersLength);
	event ExpenseAdded(uint256 indexed expenseId, uint256 indexed groupId, address indexed payer, uint256 amount, bytes32 metadataId);
	event DebtSettled(uint256 indexed groupId, address indexed from, address indexed to, uint256 amount, address settlementToken);

	error InvalidMembers();
	error GroupNotFound(uint256 groupId);
	error NotMember(uint256 groupId, address user);
	error ZeroAmount();
	error NothingToSettle();

	// Crear grupo con miembros y metadata (CID almacenada fuera)
	function createGroup(address[] calldata members, bytes32 metadataId) external returns (uint256 groupId) {
		if (members.length == 0) revert InvalidMembers();
		groupId = ++groupCount;
		groups[groupId] = Group({
			creator: msg.sender,
			members: members,
			metadataId: metadataId,
			exists: true
		});
		emit GroupCreated(groupId, msg.sender, metadataId, members.length);
	}

	// Agregar gasto equitativo entre todos los miembros
	function addExpense(uint256 groupId, uint256 amount, bytes32 metadataId) external returns (uint256 expenseId) {
		Group storage g = groups[groupId];
		if (!g.exists) revert GroupNotFound(groupId);
		if (amount == 0) revert ZeroAmount();
		if (!_isMember(g.members, msg.sender)) revert NotMember(groupId, msg.sender);

		expenseId = ++expenseCount;
		expenses[expenseId] = Expense({
			groupId: groupId,
			payer: msg.sender,
			amount: amount,
			metadataId: metadataId,
			settled: false
		});
		emit ExpenseAdded(expenseId, groupId, msg.sender, amount, metadataId);

		// Actualizar net balances: cada miembro debe share al payer
		uint256 mLen = g.members.length;
		uint256 share = amount / mLen; // si no divide exacto queda remainder ignorado (se puede mejorar luego)
		for (uint256 i = 0; i < mLen; ++i) {
			address member = g.members[i];
			if (member == msg.sender) continue; // el payer no se debe a sí mismo
			netBalance[groupId][member] -= int256(share);
		}
		netBalance[groupId][msg.sender] += int256(share * (mLen - 1));
	}

	/// @notice Salda deuda entre dos miembros transfiriendo token ERC20 (aprobado previamente) o ETH
	/// @dev Simplificado: from ejecuta la función y paga 'amount' a to; ajusta saldo.
	function settleDebt(
		uint256 groupId,
		address to,
		uint256 amount,
		address settlementToken
	) external payable {
		Group storage g = groups[groupId];
		if (!g.exists) revert GroupNotFound(groupId);
		if (!_isMember(g.members, msg.sender) || !_isMember(g.members, to)) revert NotMember(groupId, msg.sender);
		if (amount == 0) revert ZeroAmount();

		int256 current = netBalance[groupId][msg.sender];
		// msg.sender debe tener saldo negativo suficiente (debe esa cantidad)
		if (current >= 0) revert NothingToSettle();
		// convertir a positivo para comparación
		uint256 owing = uint256(-current);
		uint256 payAmount = amount > owing ? owing : amount;

		// transferir
		if (settlementToken == address(0)) {
			// pagar en ETH, permitir sobrepago y reembolsar exceso
			require(msg.value >= payAmount, "Incorrect ETH amount");
			uint256 excess = msg.value - payAmount;
			(bool ok, ) = to.call{value: payAmount}("");
			require(ok, "ETH transfer failed");
			if (excess > 0) {
				(bool ok2, ) = msg.sender.call{value: excess}("");
				require(ok2, "Refund failed");
			}
		} else {
			require(msg.value == 0, "ETH not required");
			IERC20(settlementToken).safeTransferFrom(msg.sender, to, payAmount);
		}

		// ajustar balances: from sube (menos negativo), to baja (menos positivo)
		netBalance[groupId][msg.sender] += int256(payAmount);
		netBalance[groupId][to] -= int256(payAmount);
		emit DebtSettled(groupId, msg.sender, to, payAmount, settlementToken);
	}

	function getMembers(uint256 groupId) external view returns (address[] memory) {
		return groups[groupId].members;
	}

	// helper interno
	function _isMember(address[] storage members, address user) internal view returns (bool) {
		for (uint256 i = 0; i < members.length; ++i) {
			if (members[i] == user) return true;
		}
		return false;
	}
}

