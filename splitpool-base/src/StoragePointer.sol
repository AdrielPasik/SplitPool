// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StoragePointer
/// @notice saves CIDs (Filecoin/IPFS) referenced by deterministic IDs
/// @dev Recommended IDs: keccak256("USER", user), keccak256("GROUP", groupId),
///      keccak256("POOL", poolAddress), keccak256("EXPENSE", expenseId)
contract StoragePointer {
	// mapping id -> cid string (multihash/base32/bafy...)
	mapping(bytes32 => string) private _cidOf;

	// simple role: owner can set CIDs; optionally can be extended to AccessControl
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

	/// @notice Assigns/updates CID for an id
	/// @param id Deterministic identifier (e.g., keccak256("POOL", poolAddress))
	/// @param cid Full CID string
	function setCid(bytes32 id, string calldata cid) external onlyOwner {
		if (bytes(cid).length == 0) revert EmptyCid();
		_cidOf[id] = cid;
		emit CidSet(id, cid, msg.sender);
	}

	/// @notice Gets the CID associated with an id
    /// @param id Deterministic identifier
	function getCid(bytes32 id) external view returns (string memory) {
		return _cidOf[id];
	}

	/// @notice Transfer ownership (future CID management)
	function transferOwnership(address newOwner) external onlyOwner {
		owner = newOwner;
	}
}

