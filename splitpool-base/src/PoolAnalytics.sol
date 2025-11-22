// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PoolAnalytics
/// @notice Registro on-chain de pagos de pools para análisis (ej: Chainlink CRE)
/// @dev Solo el rol CRE puede ingresar logs. Datos enriquecidos (merchantName, etc.) viven off-chain (Filecoin) vía StoragePointer.
contract PoolAnalytics {
	address public cre; // entidad autorizada (ej: Chainlink CRE)

	struct PaymentLog {
		address pool;
		address merchant;
		address settlementToken;
		uint256 amount;        // monto original
		uint256 amountInLocal; // conversión a moneda local (fuera del alcance: se confía en CRE)
		uint256 timestamp;     // block.timestamp
	}

	PaymentLog[] private _logs;

	event PaymentLogged(
		uint256 indexed index,
		address indexed pool,
		address indexed merchant,
		address settlementToken,
		uint256 amount,
		uint256 amountInLocal,
		uint256 timestamp
	);

	error NotCRE();

	constructor(address _cre) {
		cre = _cre;
	}

	modifier onlyCRE() {
		if (msg.sender != cre) revert NotCRE();
		_;
	}

	function logPayment(
		address pool,
		address merchant,
		address settlementToken,
		uint256 amount,
		uint256 amountInLocal
	) external onlyCRE {
		PaymentLog memory p = PaymentLog({
			pool: pool,
			merchant: merchant,
			settlementToken: settlementToken,
			amount: amount,
			amountInLocal: amountInLocal,
			timestamp: block.timestamp
		});
		_logs.push(p);
		emit PaymentLogged(_logs.length - 1, pool, merchant, settlementToken, amount, amountInLocal, p.timestamp);
	}

	function logsLength() external view returns (uint256) {
		return _logs.length;
	}

	function getLog(uint256 index) external view returns (PaymentLog memory) {
		return _logs[index];
	}

	function updateCRE(address newCre) external onlyCRE {
		cre = newCre;
	}
}

