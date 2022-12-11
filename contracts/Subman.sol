// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
// using an OpenZeppelin EnumerableMap for keeping track of connections
// between payer and payee
//import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "./IERC20.sol";

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

	    // TODO: make this list doubly-linked
	    address prevPayer;
	    address prevPayee;
    }

    // LMAO, need to create linked list from scratch
    // Alternatively, use OpenZeppelin EnumerableMapping
    // of the form address => address,
    // then use a different mapping of the form
    // address => mapping(address => Subscription)

    // UNFORTUNATELY, address=>address mappings are not supported and that may be a pain.
    // Instead, I'll cause myself far more pain by rolling my own DSA
    // NOTE: only need one of these mappings
    mapping (address => mapping (address => Subscription)) private _payerPayee;
    //mapping (address => mapping (address => Subscription)) private _payeePayer;

    // we need to keep track of both the number of payers for a payee,
    // and the number of payees for a payer
    // to make things faster. Perhaps it would save gas to calculate this on-the-fly
    // in the view functions below, but that would be ugly
    mapping (address => uint) private _numPayees;
    mapping (address => uint) private _numPayers;

    // needed as a starting point for the linked list

    // _payerEnd should give us back th payer, it's INDEXED by the payee
    mapping (address => address) private _payerEnd;

    // _payeeEnd should give us back th payee, it's INDEXED by the payer
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
	    Subscription storage newSub = _payerPayee[msg.sender][_payee];
	    //Subscription memory newSub = Subscription(_paymentFreq, block.timestamp, 0, _amount, _token, _payee, msg.sender, address(0), address(0));

	    //Subscription memory newSub;

	    newSub.payee = _payee;
	    newSub.amount = _amount;
	    newSub.paymentFreq = _paymentFreq;
	    newSub.tokenAddr = _token;
	    newSub.startTime = block.timestamp;
	    newSub.numWithdrawals = 0;

	    // check whether the payer has a starting point (implying existing subscriptions).
	    // If so, point the new subscription to the starting point.
	    if (_payeeEnd[msg.sender] != address(0)) {
		    newSub.nextPayee = _payeeEnd[msg.sender];
		    _payerPayee[msg.sender][newSub.nextPayee].prevPayee = _payee;
	    } else {
		    newSub.nextPayee = address(0);
		    newSub.prevPayee = address(0);
	    }
	    // regardless, the new subscription should be pointed to as the starting point
	    _payeeEnd[msg.sender] = _payee;

	    // check whether the payee has a starting point (implying existing subscriptions).
	    // If so, point the new subscription to the starting point.
	    if (_payerEnd[_payee] != address(0)) {
		    newSub.nextPayer = _payerEnd[_payee];
		    _payerPayee[newSub.nextPayer][_payee].prevPayer = msg.sender;
	    } else {
		    newSub.nextPayer = address(0);
		    newSub.prevPayer = address(0);
	    }
	    // regardless, the new subscription should be pointed to as the starting point
	    _payerEnd[_payee] = msg.sender;

	    //_payerPayee[msg.sender][_payee] = newSub;
	    ++_numPayees[msg.sender];
	    ++_numPayers[_payee];

	    emit NewSubscription(msg.sender, _payee, _amount, _paymentFreq);

	    return true;
    }

    function stopPayment(address _payee) public returns (bool) {
	    // reference to the subscription in storage that we want to delete
	    Subscription storage toCancelSubscription = _payerPayee[msg.sender][_payee];

	    // set the nextPayee of the previous subscription associated with the same payer, to the next subscription
	    _payerPayee[msg.sender][toCancelSubscription.nextPayee].prevPayee = toCancelSubscription.prevPayee;
	    // as above
	    _payerPayee[msg.sender][toCancelSubscription.prevPayee].nextPayee = toCancelSubscription.nextPayee;

	    // brainpower go brrr
	    _payerPayee[toCancelSubscription.prevPayer][_payee].nextPayer = toCancelSubscription.nextPayer;
	    _payerPayee[toCancelSubscription.nextPayer][_payee].prevPayer = toCancelSubscription.prevPayer;

	    // FIXME: deal with case of this being the last subscription; update _payerEnd and _payeeEnd
	    if (_payerEnd[_payee] == msg.sender) {
		    _payerEnd[_payee] = toCancelSubscription.nextPayer;
	    }
	    if (_payeeEnd[msg.sender] == _payee) {
		    _payeeEnd[msg.sender] = toCancelSubscription.nextPayee;
	    }

	    //delete toCancelSubscription;
	    delete _payerPayee[msg.sender][_payee];

	    // decrease the number of payers by one
	    --_numPayers[_payee];
	    --_numPayees[msg.sender];

	    return true;
    }


    function getPayeesForPayer(address _payer) public view returns (address[] memory) {
	    // count the number of payees of the payer, since we don't store this
	    //uint num_payees = _numPayees[_payer];
	    address[] memory toReturn = new address[](_numPayees[_payer]);
	    //address[] memory toReturn = new address[](num_payees);
	    //address[] memory toReturn = new address[](2);
	    // from experiments, I know the error does not happen during assingment
	    // Additionally, I know that the length of the array is as expected
	    //address[] memory toReturn = new address[](1);

	    // the first element of the toReturn array is the end-payee associated with this payer
	    //toReturn[0] = endSubPayer(_payer);
	    if (_numPayees[_payer] == 0) {
		    return toReturn;
	    }
	    toReturn[0] = _payeeEnd[_payer];
	    for (uint i=1; i < _numPayees[_payer]; i++) {
		    // each subsequent element of the toReturn array should be the nextPayee of the last
		    toReturn[i] = _payerPayee[_payer][toReturn[i-1]].nextPayee;
	    }
	    return toReturn;
    }

    function getPayersForPayee(address _payee) public view returns (address[] memory) {
	    // count the number of payees of the payer, since we don't store this
	    //uint num_payees = _numPayees[_payer];
	    address[] memory toReturn = new address[](_numPayers[_payee]);
	    //address[] memory toReturn = new address[](num_payees);
	    //address[] memory toReturn = new address[](2);
	    // from experiments, I know the error does not happen during assingment
	    // Additionally, I know that the length of the array is as expected
	    //address[] memory toReturn = new address[](1);

	    // the first element of the toReturn array is the end-payee associated with this payer
	    //toReturn[0] = endSubPayee(_payee);
	    if (_numPayers[_payee] == 0) {
		    return toReturn;
	    }
	    toReturn[0] = _payerEnd[_payee];
	    for (uint i=1; i < _numPayers[_payee]; i++) {
		    // each subsequent element of the toReturn array should be the nextPayee of the last
		    toReturn[i] = _payerPayee[toReturn[i-1]][_payee].nextPayer;
	    }
	    return toReturn;
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

	Subscription storage sub = _payerPayee[_payer][msg.sender];
	require(sub.numWithdrawals * sub.paymentFreq < (block.timestamp - sub.startTime), "Withdrawing too frequently");
	++sub.numWithdrawals;

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
