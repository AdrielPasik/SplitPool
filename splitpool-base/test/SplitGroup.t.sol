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
        uint256 groupId = sg.createGroup(members, uint256(keccak256("groupMeta")));
        address[] memory stored = sg.getMembers(groupId);
        assertEq(stored.length, 3);
    }

    function test_AddExpenseUpdatesBalancesAfterApprovals() public {
        address[] memory members = new address[](3);
        members[0]=alice; members[1]=bob; members[2]=carol;
        uint256 groupId = sg.createGroup(members, uint256(keccak256("meta")));
        // expense participants = all members (including payer alice)
        address[] memory participants = new address[](3);
        participants[0]=alice; participants[1]=bob; participants[2]=carol;
        vm.prank(alice);
        uint256 expenseId = sg.addExpense(groupId, 9 ether, uint256(keccak256("exp1")), participants); // share = 3 ether
        // Need approvals from bob and carol
        vm.prank(bob); sg.approveExpense(expenseId);
        vm.prank(carol); sg.approveExpense(expenseId);
        // Now applied
        assertEq(sg.netBalance(groupId, alice), int256(6 ether));
        assertEq(sg.netBalance(groupId, bob), int256(-3 ether));
        assertEq(sg.netBalance(groupId, carol), int256(-3 ether));
    }

    function test_SettleDebtPartialAfterApprovals() public {
        address[] memory members = new address[](3);
        members[0]=alice; members[1]=bob; members[2]=carol;
        uint256 groupId = sg.createGroup(members, uint256(keccak256("meta")));
        address[] memory participants = new address[](3);
        participants[0]=alice; participants[1]=bob; participants[2]=carol;
        vm.prank(alice); uint256 expenseId = sg.addExpense(groupId, 9 ether, uint256(keccak256("exp")), participants);
        vm.prank(bob); sg.approveExpense(expenseId);
        vm.prank(carol); sg.approveExpense(expenseId);
        // bob debe 3 ether; paga 2
        vm.prank(bob);
        sg.settleDebt{value:2 ether}(groupId, alice, 2 ether, address(0));
        assertEq(sg.netBalance(groupId, bob), int256(-1 ether));
        assertEq(sg.netBalance(groupId, alice), int256(4 ether));
    }

    function test_SettleDebtFullAutoClampAfterApprovals() public {
        address[] memory members = new address[](3);
        members[0]=alice; members[1]=bob; members[2]=carol;
        uint256 groupId = sg.createGroup(members, uint256(keccak256("meta")));
        address[] memory participants = new address[](3);
        participants[0]=alice; participants[1]=bob; participants[2]=carol;
        vm.prank(alice); uint256 expenseId = sg.addExpense(groupId, 9 ether, uint256(keccak256("exp")), participants);
        vm.prank(bob); sg.approveExpense(expenseId);
        vm.prank(carol); sg.approveExpense(expenseId);
        // bob intenta pagar más de lo que debe (5) -> se clampa y se reembolsa exceso
        uint256 bobBalBefore = bob.balance;
        vm.prank(bob);
        sg.settleDebt{value:5 ether}(groupId, alice, 5 ether, address(0)); // owing is 3 ether
        assertEq(bob.balance, bobBalBefore - 3 ether, "Solo debe salir lo que realmente debe");
        assertEq(sg.netBalance(groupId, bob), int256(0));
        assertEq(sg.netBalance(groupId, alice), int256(3 ether)); // carol aún debe 3
    }
}
