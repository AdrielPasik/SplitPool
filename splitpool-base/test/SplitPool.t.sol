// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/SplitPool.sol";
import "src/SplitPoolFactory.sol";
import "test/mocks/MockERC20.sol";
import "src/interfaces/ISplitPool.sol";

contract SplitPoolTest is Test {
    address merchant = address(0xBEEF);
    address alice = address(0xA1);
    address bob = address(0xB2);
    address carol = address(0xC3);
    address dave = address(0xD4);

    SplitPoolFactory factory;
    MockERC20 token;

    function setUp() public {
        factory = new SplitPoolFactory();
        token = new MockERC20("MockUSD","MUSD");
        // Mint tokens to participants
        uint256 mintAmt = 1_000_000e18;
        token.mint(alice, mintAmt);
        token.mint(bob, mintAmt);
        token.mint(carol, mintAmt);
        token.mint(dave, mintAmt);
    }

    function _createPool(address settlementToken, uint256 total) internal returns (SplitPool) {
        address[] memory participants = new address[](4);
        participants[0]=alice;participants[1]=bob;participants[2]=carol;participants[3]=dave;
        address poolAddr = factory.createPool(address(0), merchant, settlementToken, total, 0, participants);
        return SplitPool(poolAddr);
    }

    function test_CreatePoolShareCalculationETH() public {
        uint256 total = 400 ether; // divisible by 4
        SplitPool p = _createPool(address(0), total);
        assertEq(p.sharePerUser(), 100 ether, "share incorrect");
        assertEq(p.remainingAmount(), total);
    }

    function test_PayShareETHFlow() public {
        uint256 total = 4 ether;
        SplitPool p = _createPool(address(0), total);
        vm.prank(alice); p.payShare{value:1 ether}();
        assertTrue(p.hasPaid(alice));
        assertEq(p.collectedAmount(), 1 ether);
        vm.prank(bob); p.payShare{value:1 ether}();
        vm.prank(carol); p.payShare{value:1 ether}();
        vm.prank(dave); p.payShare{value:1 ether}();
        assertEq(uint(p.status()), uint(ISplitPool.PoolStatus.Paid), "Pool should be paid");
        assertEq(address(merchant).balance, 4 ether, "Merchant should receive total");
    }

    function test_Revert_OverpayETH() public {
        uint256 total = 4 ether; SplitPool p = _createPool(address(0), total);
        vm.expectRevert(); // IncorrectShareAmount custom error
        vm.prank(alice); p.payShare{value:2 ether}();
    }

    function test_Revert_DoublePay() public {
        uint256 total = 4 ether; SplitPool p = _createPool(address(0), total);
        vm.prank(alice); p.payShare{value:1 ether}();
        vm.expectRevert();
        vm.prank(alice); p.payShare{value:1 ether}();
    }

    function test_Revert_NotParticipant() public {
        uint256 total = 4 ether; SplitPool p = _createPool(address(0), total);
        address outsider = address(0x999);
        vm.deal(outsider, 1 ether);
        vm.expectRevert();
        vm.prank(outsider); p.payShare{value:1 ether}();
    }

    function test_CreatePoolERC20AndPay() public {
        uint256 total = 4000e18; // divisible by 4
        SplitPool p = _createPool(address(token), total);
        assertEq(p.sharePerUser(), 1000e18);
        vm.startPrank(alice); token.approve(address(p), 1000e18); p.payShare(); vm.stopPrank();
        vm.startPrank(bob); token.approve(address(p), 1000e18); p.payShare(); vm.stopPrank();
        vm.startPrank(carol); token.approve(address(p), 1000e18); p.payShare(); vm.stopPrank();
        vm.startPrank(dave); token.approve(address(p), 1000e18); p.payShare(); vm.stopPrank();
        assertEq(uint(p.status()), uint(ISplitPool.PoolStatus.Paid));
        assertEq(token.balanceOf(merchant), total);
    }

    function test_DepositCompatibilityRedirects() public {
        uint256 total = 4 ether; SplitPool p = _createPool(address(0), total);
        vm.prank(alice); p.deposit{value:1 ether}(1 ether);
        assertTrue(p.hasPaid(alice));
    }

    function test_Revert_DepositWrongAmount() public {
        uint256 total = 4 ether; SplitPool p = _createPool(address(0), total);
        vm.expectRevert();
        vm.prank(alice); p.deposit{value:2 ether}(2 ether);
    }
}
