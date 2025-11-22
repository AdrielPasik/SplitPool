// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/PoolAnalytics.sol";

contract PoolAnalyticsTest is Test {
    PoolAnalytics pa;
    // Dirección simbólica válida para rol CRE
    address cre = address(0xC0DE);
    // Direcciones mock para pool y merchant
    address poolMock = address(0x1001);
    address merchantMock = address(0x2002);
    function setUp() public { pa = new PoolAnalytics(cre); }

    function test_LogPaymentOnlyCRE() public {
        vm.prank(cre);
        pa.logPayment(poolMock, merchantMock, address(0), 10 ether, 12 ether);
        assertEq(pa.logsLength(), 1);
        PoolAnalytics.PaymentLog memory log = pa.getLog(0);
        assertEq(log.pool, poolMock);
        assertEq(log.amount, 10 ether);
    }

    function test_RevertNotCRE() public {
        vm.expectRevert(PoolAnalytics.NotCRE.selector);
        pa.logPayment(poolMock, merchantMock, address(0), 1, 1);
    }
}
