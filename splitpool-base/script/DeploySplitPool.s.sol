// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "src/SplitPoolFactory.sol";
import "src/SplitPool.sol";

/// @notice Script de despliegue simple para Base testnet
/// @dev Ejecutar con: forge script script/DeploySplitPool.s.sol --rpc-url $BASE_RPC --broadcast --verify (según config)
contract DeploySplitPoolScript is Script {
	function run() external {
		uint256 deployerPk = vm.envUint("PRIVATE_KEY");
		vm.startBroadcast(deployerPk);

		// Deploy factory
		SplitPoolFactory factory = new SplitPoolFactory();

		// Crear un pool de ejemplo (ETH) con participantes de env vars (puede adaptarse)
		address merchant = vm.envAddress("MERCHANT_ADDR");
		address[] memory participants = new address[](2);
		participants[0] = vm.envAddress("P1_ADDR");
		participants[1] = vm.envAddress("P2_ADDR");

		uint256 totalAmount = vm.envUint("TOTAL_AMOUNT"); // debe ser divisible por participants.length

		address pool = factory.createPool(
			address(0), // group opcional
			merchant,
			address(0), // settlementToken ETH
			totalAmount,
			0, // metadataPointer (usar StoragePointer luego)
			participants
		);

		console2.log("Factory:", address(factory));
		console2.log("Pool:", pool);

		vm.stopBroadcast();
	}
}

