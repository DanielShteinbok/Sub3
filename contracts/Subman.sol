// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
// using an OpenZeppelin EnumerableMap for keeping track of connections
// between payer and payee
//import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IERC20.sol";

contract Subman {
    //uint public unlockTime;
    //address payable public owner;
    struct Subscription {
	    // paymentFreq is currently by number of blocks
	    uint paymentFreq;

	    // two ways of handling frequency:
	    // either a minimum time between payments
	    // (then a late withdrawal puts you behind forever)
	    // or a minimum value for the floored division of numWithdrawals/(block.timestamp - startTime)
	    // the latter is more proper IMO because it means that payments on average happen regularly
	    uint startTime;
	    uint numWithdrawals;

	    uint amount;
	    address tokenAddr;
	    address payee;
	    address payer;

	    // LMAO WTF. Brain damage.
	    address nextPayer;
	    address nextPayee;
    }

    // LMAO, need to create linked list from scratch
    // Alternatively, use OpenZeppelin EnumerableMapping
    // of the form address => address,
    // then use a different mapping of the form
    // address => mapping(address => Subscription)

    // UNFORTUNATELY, address=>address mappings are not supported and that may be a pain.
    // Instead, I'll cause myself far more pain by rolling my own DSA
    mapping (address => mapping (address => Subscription)) private _payerPayee;
    mapping (address => mapping (address => Subscription)) private _payeePayer;

    // needed as a starting point for the linked list
    mapping (address => address) private _payerEnd;
    mapping (address => address) private _payeeEnd;

    //event Withdrawal(uint amount, uint when);

    // event to emit upon addPayee
    event NewSubscription(address payer, address payee, uint amount, uint paymentFreq);

    event StopPayment(address payer, address payee);

    event Withdrawal(address payer, address payee, uint amount);

    //constructor(address _payee, uint _amount, uint _paymentFreq) {
	    
    //}

    function addPayee(address _payee, uint _amount, uint _paymentFreq, address _token) public returns (bool){
	    // I have no idea how this works, but I'm copying from:
	    // https://docs.soliditylang.org/en/v0.8.17/types.html#structs
	    //Subscription storage newSub = _payerPayee[msg.sender][_payee];
	    //Subscription memory newSub = Subscription(_paymentFreq, block.timestamp, 0, _amount, _token, _payee, msg.sender, address(0), address(0));

	    Subscription memory newSub;

	    newSub.payee = _payee;
	    newSub.amount = _amount;
	    newSub.paymentFreq = _paymentFreq;
	    newSub.tokenAddr = _token;
	    newSub.startTime = block.timestamp;

	    // check whether the payer has a starting point (implying existing subscriptions).
	    // If so, point the new subscription to the starting point.
	    if (_payerEnd[msg.sender] != address(0)) {
		    newSub.nextPayer = _payerEnd[msg.sender];
	    } else {
		    newSub.nextPayer = address(0);
	    }
	    // regardless, the new subscription should be pointed to as the starting point
	    _payerEnd[msg.sender] = _payee;

	    // check whether the payee has a starting point (implying existing subscriptions).
	    // If so, point the new subscription to the starting point.
	    if (_payeeEnd[_payee] != address(0)) {
		    newSub.nextPayee = _payeeEnd[_payee];
	    } else {
		    newSub.nextPayee = address(0);
	    }
	    // regardless, the new subscription should be pointed to as the starting point
	    _payeeEnd[_payee] = msg.sender;

	    _payerPayee[msg.sender][_payee] = newSub;

	    emit NewSubscription(msg.sender, _payee, _amount, _paymentFreq);

	    return true;
    }

    function endSubPayee(address _payee) public view returns (address) {
	    return _payeeEnd[_payee];
    }

    function endSubPayer(address _payer) public view returns (address) {
	    return _payerEnd[_payer];
    }

    // TODO: view function that all the subscriptions associated with a particular payee
    // TODO: view function that all the subscriptions associated with a particular payer
    // QUESTION: what limitations do we have on what we can return from a function?
    // Can we return a list of addresses, from which each subscription can be accessed?

    // FIXME: don't have a way to do multiple payment currencies for a single payer-payee pair
    // perhaps this doesn't actually need to be fixed for this godforsaken event...

    // IMM: write some damn tests!

    function withdraw(address _payer) public returns (bool){
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        //require(block.timestamp >= unlockTime, "You can't withdraw yet");
        //require(msg.sender == owner, "You aren't the owner");

	// TODO: Grab appropriate subscription and transfer the appropriate amount of the underlying token

	// FIXME: replace 0

	Subscription memory sub = _payerPayee[_payer][msg.sender];
	require(sub.numWithdrawals * sub.paymentFreq > (block.timestamp - sub.startTime), "Withdrawing too frequently");

	IERC20 token = IERC20(sub.tokenAddr);

	token.transferFrom(_payer, msg.sender, sub.amount);
        emit Withdrawal(address(this), address(this), 0);

        //owner.transfer(address(this).balance);
	return true;
	
    }

    function getSub(address _payer, address _payee) public view returns (uint startTime, uint numWithdrawals, 
									 uint amount, 
									 address tokenAddr, 
									 address payee, 
									 address payer, 
									 address nextPayer, 
									 address nextPayee){
      Subscription memory sub = _payerPayee[_payer][_payee];
      return (sub.startTime, sub.numWithdrawals, 
									 sub.amount, 
									 sub.tokenAddr, 
									 sub.payee, 
									 sub.payer, 
									 sub.nextPayer, 
									 sub.nextPayee);

   }

}
