// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/SplitGroup.sol";

contract SplitGroupTest is Test {
    SplitGroup sg;
    address alice = address(0xA1);
    address bob   = address(0xB2);
    address carol = address(0xC3);

    function setUp() public {
        sg = new SplitGroup();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(carol, 10 ether);
    }

    function test_CreateGroup() public {
        address[] memory members = new address[](3);
        members[0]=alice; members[1]=bob; members[2]=carol;
        uint256 groupId = sg.createGroup(members, keccak256("groupMeta"));
        address[] memory stored = sg.getMembers(groupId);
        assertEq(stored.length, 3);
    }

    function test_AddExpenseUpdatesBalances() public {
        address[] memory members = new address[](3);
        members[0]=alice; members[1]=bob; members[2]=carol;
        uint256 groupId = sg.createGroup(members, keccak256("meta"));
        vm.prank(alice);
        sg.addExpense(groupId, 9 ether, keccak256("exp1")); // share = 3 ether
        // alice debe recibir 3 ether * 2 = 6 (positivo), bob y carol -3 cada uno
        assertEq(sg.netBalance(groupId, alice), int256(6 ether));
        assertEq(sg.netBalance(groupId, bob), int256(-3 ether));
        assertEq(sg.netBalance(groupId, carol), int256(-3 ether));
    }

    function test_SettleDebtPartial() public {
        address[] memory members = new address[](3);
        members[0]=alice; members[1]=bob; members[2]=carol;
        uint256 groupId = sg.createGroup(members, keccak256("meta"));
        vm.prank(alice); sg.addExpense(groupId, 9 ether, keccak256("exp"));
        // bob debe 3 ether; paga 2
        vm.prank(bob);
        sg.settleDebt{value:2 ether}(groupId, alice, 2 ether, address(0));
        assertEq(sg.netBalance(groupId, bob), int256(-1 ether));
        assertEq(sg.netBalance(groupId, alice), int256(4 ether));
    }

    function test_SettleDebtFullAutoClamp() public {
        address[] memory members = new address[](3);
        members[0]=alice; members[1]=bob; members[2]=carol;
        uint256 groupId = sg.createGroup(members, keccak256("meta"));
        vm.prank(alice); sg.addExpense(groupId, 9 ether, keccak256("exp"));
        // bob intenta pagar más de lo que debe (5) -> se clampa y se reembolsa exceso
        uint256 bobBalBefore = bob.balance;
        vm.prank(bob);
        sg.settleDebt{value:5 ether}(groupId, alice, 5 ether, address(0)); // owing is 3 ether
        assertEq(bob.balance, bobBalBefore - 3 ether, "Solo debe salir lo que realmente debe");
        assertEq(sg.netBalance(groupId, bob), int256(0));
        assertEq(sg.netBalance(groupId, alice), int256(3 ether)); // carol still owes 3
    }
}
