// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StoragePointer
/// @notice Almacena CIDs (Filecoin/IPFS) referenciados por IDs determinísticos
/// @dev IDs recomendados: keccak256("USER", user), keccak256("GROUP", groupId),
///      keccak256("POOL", poolAddress), keccak256("EXPENSE", expenseId)
contract StoragePointer {
	// mapping id -> cid string (multihash/base32/bafy...)
	mapping(bytes32 => string) private _cidOf;

	// rol sencillo: owner puede fijar CIDs; opcionalmente se puede ampliar a AccessControl
	address public owner;

	event CidSet(bytes32 indexed id, string cid, address indexed setter);

	error NotOwner();
	error EmptyCid();

	constructor() {
		owner = msg.sender;
	}

	modifier onlyOwner() {
		if (msg.sender != owner) revert NotOwner();
		_;
	}

	/// @notice Asigna/actualiza CID para un id
	/// @param id Identificador determinístico (ej: keccak256("POOL", poolAddress))
	/// @param cid Cadena CID completa
	function setCid(bytes32 id, string calldata cid) external onlyOwner {
		if (bytes(cid).length == 0) revert EmptyCid();
		_cidOf[id] = cid;
		emit CidSet(id, cid, msg.sender);
	}

	/// @notice Obtiene el CID asociado a un id
	function getCid(bytes32 id) external view returns (string memory) {
		return _cidOf[id];
	}

	/// @notice Transferir propiedad (administración futura de CIDs)
	function transferOwnership(address newOwner) external onlyOwner {
		owner = newOwner;
	}
}

