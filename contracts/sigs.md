# Function Signatures

```
function addPayee(address _payee, uint _amount, uint _paymentFreq) public returns (bool)
```
Adds a payee; `_payee` is the address you're paying to, `_amount` is the amount,
`_paymentFreq` is the average number of blocks per which the payment is allowed to take place.
Returns true if successful.

```
function withdraw(address _payee) public returns (bool)
```

Withdraws the alotted amount. Fails if this is done too frequently, or if insufficient allowance,
or if insufficient balance. Returns true if successful.

```
function stopPayment(address _payee) public returns (bool)
```

Removes the payee.

```
function endSubPayer(address _payer) public view returns (address payee)
```

Used to grab some payee associated with this payer.
Once you get the payee, you can get the subscription info from the next-documented function.
From that subscription info, you get the next payee address, and you can grab that.
This allows you to iterate through all the subscriptions belonging to this payer.

```
function endSubPayee(address _payee) public view returns (address payer)
```
same as endSubPayer, but for the payee

```
function getSub(address _payer, address _payee) public view returns (uint firstBlock, uint numWithdrawals, uint amount, address tokenAddr, address payee, address payer, address nextPayer, address nextPayee)
```

gives all the info about a particular subscription, connecting a particular payer and a particular payee.
By my shitty design, these must be unique (you can't have two subscriptions where the same payer pays the same payee).
The returned nextPayee is the address of a different payee whom the same payer pays, and nextPayer is a different payer who pays the same payee.
Basically you can traverse the entire graph of subscriptions by calling this function over and over, and using that method you can get a list of all the subscriptions for a particular payer, or a particular payee, to either bundle a bunch of `withdraw` calls or to draw a nice list of subscriptions for the user.
Ask me for more details when you get to this.


