// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/SplitPoolFactory.sol";
import "test/mocks/MockERC20.sol";
import "src/SplitPool.sol";
import "src/interfaces/ISplitPoolFactory.sol"; // brings PoolCreated event into scope

contract SplitPoolFactoryTest is Test {
    // Declaramos el evento localmente para poder usar expectEmit + emit sin heredar la interfaz
    event PoolCreated(
        address indexed pool,
        address indexed creator,
        address indexed group,
        address merchant,
        address settlementToken,
        uint256 totalAmount,
        uint256 metadataPointer,
        uint256 participantsLength
    );
    SplitPoolFactory factory;
    MockERC20 usdt;
    address merchant = address(0xABCD);
    address a = address(0xA1); address b = address(0xB2); address c = address(0xC3); address d = address(0xD4);

    function setUp() public {
        factory = new SplitPoolFactory();
    }

    function test_CreatePoolEmitsEvent() public {
        address[] memory participants = new address[](4);
        participants[0]=a;participants[1]=b;participants[2]=c;participants[3]=d;
        // Expect event but wildcard pool (first indexed) so set first bool false
        vm.expectEmit(false,true,true,true);
        emit PoolCreated(address(0), address(this), address(0), merchant, address(0), 400 ether, 0, 4);
        address payable pool = payable(factory.createPool(address(0), merchant, address(0), 400 ether, 0, participants));
        SplitPool p = SplitPool(pool);
        assertEq(p.sharePerUser(), 100 ether);
        assertEq(factory.allPoolsLength(), 1);
    }
}
