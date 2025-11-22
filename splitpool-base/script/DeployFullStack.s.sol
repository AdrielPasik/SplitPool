// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "src/StoragePointer.sol";
import "src/SplitPoolFactory.sol";
import "src/SplitGroup.sol";
import "src/PoolAnalytics.sol";

/// @notice Deploys the full SplitPool stack and creates an example pool.
contract DeployFullStackScript is Script {
    struct DeployResult {
        address storagePointer;
        address splitGroup;
        uint256 groupId;
        address analytics;
        address factory;
        address pool;
        uint256 sharePerUser;
    }

    function run() external returns (DeployResult memory r) {
        uint256 deployerPk = uint256(vm.envBytes32("PRIVATE_KEY"));
        vm.startBroadcast(deployerPk);

        (address spAddr, address groupAddr, uint256 groupId, address analyticsAddr, address factoryAddr, address poolAddr, uint256 sharePerUser) = _deployAll(deployerPk);

        // Minimal logging
        console2.log("StoragePointer", spAddr);
        console2.log("SplitGroup", groupAddr);
        console2.log("GroupId", groupId);
        console2.log("PoolAnalytics", analyticsAddr);
        console2.log("SplitPoolFactory", factoryAddr);
        console2.log("Pool", poolAddr);

        vm.stopBroadcast();

        r = DeployResult(spAddr, groupAddr, groupId, analyticsAddr, factoryAddr, poolAddr, sharePerUser);
    }

    function _deployAll(uint256 deployerPk) internal returns (
        address spAddr,
        address groupAddr,
        uint256 groupId,
        address analyticsAddr,
        address factoryAddr,
        address poolAddr,
        uint256 sharePerUser
    ) {
        (address spAddrLocal, address groupAddrLocal, address analyticsAddrLocal, address factoryAddrLocal) = _setupInfra(deployerPk);
        spAddr = spAddrLocal;
        groupAddr = groupAddrLocal;
        analyticsAddr = analyticsAddrLocal;
        factoryAddr = factoryAddrLocal;

        // pool metadata
        uint256 metadataPointer = 0;
        string memory cid = _envOptionalString("METADATA_CID");
        if (bytes(cid).length > 0) {
            bytes32 id = keccak256(abi.encodePacked("POOL:", cid));
            StoragePointer(spAddr).setCid(id, cid);
            metadataPointer = uint256(id);
        }

        address merchant = vm.envAddress("MERCHANT_ADDR");
        address[] memory participants = _parseParticipantsCSV(vm.envString("PARTICIPANTS_CSV"));
        uint256 totalAmount = vm.envUint("POOL_TOTAL_WEI");
        require(participants.length > 0, "No participants");
        require(totalAmount % participants.length == 0, "Non divisible total");

        // group metadata
        uint256 groupMetaPointer = 0;
        string memory groupCid = _envOptionalString("GROUP_METADATA_CID");
        if (bytes(groupCid).length > 0) {
            bytes32 gidHash = keccak256(abi.encodePacked("GROUP:", groupCid));
            StoragePointer(spAddr).setCid(gidHash, groupCid);
            groupMetaPointer = uint256(gidHash);
        }

        uint256 appliedGroupMeta = groupMetaPointer != 0 ? groupMetaPointer : (metadataPointer != 0 ? metadataPointer : uint256(keccak256(abi.encodePacked("GROUP:FALLBACK", groupAddr, block.number))));
        groupId = _createGroupAndReturnId(groupAddr, participants, appliedGroupMeta);

        poolAddr = _createPoolAndReturn(factoryAddr, groupAddr, merchant, totalAmount, metadataPointer, participants);
        sharePerUser = totalAmount / participants.length;
    }

    function _createGroupAndReturnId(address groupAddr, address[] memory participants, uint256 appliedGroupMeta) internal returns (uint256) {
        return SplitGroup(groupAddr).createGroup(participants, appliedGroupMeta);
    }

    function _createPoolAndReturn(address factoryAddr, address groupAddr, address merchant, uint256 totalAmount, uint256 metadataPointer, address[] memory participants) internal returns (address) {
        return SplitPoolFactory(factoryAddr).createPool(groupAddr, merchant, address(0), totalAmount, metadataPointer, participants);
    }

    function _parseParticipantsCSV(string memory csv) internal pure returns (address[] memory addrs) {
        bytes memory b = bytes(csv);
        if (b.length == 0) return new address[](0);
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
        if (!ok) return address(0);
        string memory val = abi.decode(data, (string));
        if (bytes(val).length == 0) return address(0);
        return _parseAddress(val);
    }

    function _envOptionalString(string memory key) internal returns (string memory) {
        (bool ok, bytes memory data) = address(vm).call(abi.encodeWithSignature("envString(string)", key));
        if (!ok) return "";
        return abi.decode(data, (string));
    }

    function _setupInfra(uint256 deployerPk) internal returns (address spAddr, address groupAddr, address analyticsAddr, address factoryAddr) {
        address spExisting = _envOptionalAddress("EXISTING_STORAGE_POINTER");
        StoragePointer sp = spExisting == address(0) ? new StoragePointer() : StoragePointer(spExisting);
        spAddr = address(sp);

        SplitGroup group = new SplitGroup();
        groupAddr = address(group);

        address analyticsCre = _envOptionalAddress("ANALYTICS_CRE");
        if (analyticsCre == address(0)) analyticsCre = vm.addr(deployerPk);
        PoolAnalytics analytics = new PoolAnalytics(analyticsCre);
        analyticsAddr = address(analytics);

        SplitPoolFactory factory = new SplitPoolFactory();
        factoryAddr = address(factory);
    }
}
