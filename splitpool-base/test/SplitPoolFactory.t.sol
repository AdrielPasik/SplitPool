// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/SplitPoolFactory.sol";
import "src/SplitPool.sol";

contract SplitPoolFactoryTest is Test {
    SplitPoolFactory factory;
    address merchant = address(0xABCD);
    address a = address(0xA1); address b = address(0xB2); address c = address(0xC3); address d = address(0xD4);

    function setUp() public { factory = new SplitPoolFactory(); }

    function test_CreatePoolEmitsEvent() public {
        address[] memory participants = new address[](4);
        participants[0]=a;participants[1]=b;participants[2]=c;participants[3]=d;
        vm.expectEmit(true,true,true,true);
        // PoolCreated(pool, creator, group, merchant, settlementToken, totalAmount, metadataPointer, participantsLength)
        // we can't know pool address before, wildcard indexed topics suffice
        emit PoolCreated(address(0), address(this), address(0), merchant, address(0), 400 ether, 0, 4);
        address pool = factory.createPool(address(0), merchant, address(0), 400 ether, 0, participants);
        SplitPool p = SplitPool(pool);
        assertEq(p.sharePerUser(), 100 ether);
        assertEq(factory.allPoolsLength(), 1);
    }
}
