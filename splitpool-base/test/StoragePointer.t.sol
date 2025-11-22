// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/StoragePointer.sol";

contract StoragePointerTest is Test {
    StoragePointer sp;
    function setUp() public { sp = new StoragePointer(); }

    function test_SetAndGetCid() public {
        bytes32 id = keccak256("POOL:1");
        sp.setCid(id, "bafyTESTcid");
        assertEq(sp.getCid(id), "bafyTESTcid");
    }

    function test_RevertEmptyCid() public {
        bytes32 id = keccak256("POOL:2");
        vm.expectRevert(StoragePointer.EmptyCid.selector);
        sp.setCid(id, "");
    }

    function test_TransferOwnership() public {
        sp.transferOwnership(address(0xBEEF));
        vm.prank(address(0xBEEF));
        bytes32 id = keccak256("USER:1");
        sp.setCid(id, "bafyUser");
        assertEq(sp.getCid(id), "bafyUser");
    }

    function test_RevertNotOwner() public {
        vm.prank(address(0xDEAD));
        vm.expectRevert(StoragePointer.NotOwner.selector);
        sp.setCid(keccak256("X"), "cid");
    }
}
