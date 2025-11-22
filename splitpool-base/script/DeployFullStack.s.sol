// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "src/StoragePointer.sol";
import "src/SplitPoolFactory.sol";
import "src/SplitGroup.sol";
import "src/PoolAnalytics.sol";

/// @notice Deploys the full SplitPool stack and creates an example pool.
/// @dev Env vars required:
/// PRIVATE_KEY          -> uint (without 0x) or hex (forge handles)
/// PARTICIPANTS_CSV     -> comma separated addresses (0x...)
/// POOL_TOTAL_WEI       -> total pool amount in wei (must divide participants length)
/// MERCHANT_ADDR        -> merchant address
/// OPTIONAL: EXISTING_STORAGE_POINTER (0x address) to reuse already deployed StoragePointer
/// OPTIONAL: METADATA_CID -> if set, will store the CID under an auto id and use its keccak as metadataPointer
/// Example run (PowerShell):
/// $env:PRIVATE_KEY="<hex_key>"; $env:PARTICIPANTS_CSV="0xabc...,0xdef..."; $env:POOL_TOTAL_WEI="3000000000000000000"; \
/// $env:MERCHANT_ADDR="0xmerchant..."; forge script script/DeployFullStack.s.sol --rpc-url $env:BASE_RPC --broadcast
contract DeployFullStackScript is Script {
    struct DeployResult {
        address storagePointer;
        address splitGroup;
        address analytics;
        address factory;
        address pool;
        uint256 sharePerUser;
    }

    function run() external returns (DeployResult memory r) {
        uint256 deployerPk = uint256(vm.envBytes32("PRIVATE_KEY"));
        vm.startBroadcast(deployerPk);

        address spExisting = _envOptionalAddress("EXISTING_STORAGE_POINTER");
        StoragePointer sp = spExisting == address(0) ? new StoragePointer() : StoragePointer(spExisting);

        SplitGroup group = new SplitGroup();
        // CRE address para analytics: usar deployer por defecto o variable opcional ANALYTICS_CRE
        address analyticsCre = _envOptionalAddress("ANALYTICS_CRE");
        if (analyticsCre == address(0)) analyticsCre = vm.addr(deployerPk); // deployer
        PoolAnalytics analytics = new PoolAnalytics(analyticsCre);
        SplitPoolFactory factory = new SplitPoolFactory();

        // Metadata pointer (keccak of stored cid) if provided
        uint256 metadataPointer = 0;
        string memory cid = _envOptionalString("METADATA_CID");
        if (bytes(cid).length > 0) {
            bytes32 id = keccak256(abi.encodePacked("POOL:", cid));
            sp.setCid(id, cid);
            metadataPointer = uint256(id);
        }

        address merchant = vm.envAddress("MERCHANT_ADDR");
        address[] memory participants = _parseParticipantsCSV(vm.envString("PARTICIPANTS_CSV"));
        uint256 totalAmount = vm.envUint("POOL_TOTAL_WEI");
        require(participants.length > 0, "No participants");
        require(totalAmount % participants.length == 0, "Non divisible total");

        address pool = factory.createPool(
            address(group),
            merchant,
            address(0), // ETH settlement
            totalAmount,
            metadataPointer,
            participants
        );

        uint256 sharePerUser = totalAmount / participants.length;

        console2.log("StoragePointer", address(sp));
        console2.log("SplitGroup", address(group));
        console2.log("PoolAnalytics", address(analytics));
        console2.log("Analytics CRE", analyticsCre);
        console2.log("SplitPoolFactory", address(factory));
        console2.log("Pool", pool);
        console2.log("Participants", participants.length);
        console2.log("SharePerUser", sharePerUser);
        if (metadataPointer != 0) console2.log("MetadataPointer", metadataPointer);

        vm.stopBroadcast();

        r = DeployResult(address(sp), address(group), address(analytics), address(factory), pool, sharePerUser);
    }

    // ------- helpers -------
    function _parseParticipantsCSV(string memory csv) internal pure returns (address[] memory addrs) {
        bytes memory b = bytes(csv);
        uint256 count = 1;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] == ",") count++;
        }
        addrs = new address[](count);
        uint256 idx = 0;
        uint256 start = 0;
        for (uint256 i = 0; i <= b.length; i++) {
            if (i == b.length || b[i] == ",") {
                uint256 len = i - start;
                require(len >= 42, "Addr too short");
                // extract substring
                bytes memory sub = new bytes(len);
                for (uint256 j = 0; j < len; j++) sub[j] = b[start + j];
                addrs[idx++] = _parseAddress(string(sub));
                start = i + 1;
            }
        }
    }

    function _parseAddress(string memory s) internal pure returns (address a) {
        bytes memory b = bytes(s);
        require(b.length == 42, "Bad addr length");
        require(b[0] == "0" && (b[1] == "x" || b[1] == "X"), "Missing 0x");
        uint160 v = 0;
        for (uint256 i = 2; i < 42; i++) {
            uint8 c = uint8(b[i]);
            uint8 n;
            if (c >= 48 && c <= 57) n = c - 48; // 0-9
            else if (c >= 97 && c <= 102) n = c - 87; // a-f
            else if (c >= 65 && c <= 70) n = c - 55; // A-F
            else revert("Bad hex");
            v = (v << 4) | uint160(n);
        }
        a = address(v);
    }

    function _envOptionalAddress(string memory key) internal returns (address) {
        (bool ok, bytes memory data) = address(vm).call(abi.encodeWithSignature("envString(string)", key));
        if (!ok) return address(0); // not set
        string memory val = abi.decode(data, (string));
        if (bytes(val).length == 0) return address(0);
        return _parseAddress(val);
    }

    function _envOptionalString(string memory key) internal returns (string memory) {
        (bool ok, bytes memory data) = address(vm).call(abi.encodeWithSignature("envString(string)", key));
        if (!ok) return "";
        return abi.decode(data, (string));
    }
}
