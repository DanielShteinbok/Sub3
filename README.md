# Sub3 Smart Contracts
These are the smart contracts for the Sub3 project, written for EthSF 2022.
The objective of this project is to create a platform for risk-free management of recurring payments for subscription services.

This simple smart contract allows for users to add payees, specifying how much they can withdraw and how often.
This should not allow service providers, or payees to take payment more frequently than agreed upon.

Users can cancel the recurring payments any time.

## DEPLOYMENT:
Currently deployed on the Polygon Mumbai testnet with transaction hash: 0xd217ca36bfa72fe5c21e515664317ca20eddba3d15e416e43014a152d3a31491
The transaction can be viewed [here](https://mumbai.polygonscan.com/tx/0xd217ca36bfa72fe5c21e515664317ca20eddba3d15e416e43014a152d3a31491).

We are targeting the best UX project based on the UX as available in a different repository to be linked later.
The hack presents a pleasant and safe experience in subscribing to, and paying for decentralized subscription-based services.
This would create new opportunites for discovery of decentralized projects, as well as a route for making them more sustainable.

## This smart contract:
This contract, when given an allowance by a user, allows the user to add payees via the `addPayee` method, confines the payee to collecting
their fee as accepted by the user in the first place. The payee may withdraw via the `withdraw` function, and the user may cancel at any time
with the `stopPayment` method.
