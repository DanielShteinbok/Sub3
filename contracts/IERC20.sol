pragma solidity ^0.8.9;

interface IERC20 {
	function transferFrom(address from, address to,uint256 amount) external returns (bool);
}
