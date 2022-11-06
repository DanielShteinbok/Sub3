const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Subman", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  //async function deployOneYearLockFixture() {
    //const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    //const ONE_GWEI = 1_000_000_000;
//
    //const lockedAmount = ONE_GWEI;
    //const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
//
    //// Contracts are deployed using the first signer/account by default
    //const [owner, otherAccount] = await ethers.getSigners();
//
    //const Lock = await ethers.getContractFactory("Lock");
    //const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
//
    //return { lock, unlockTime, lockedAmount, owner, otherAccount };

	// no arguments needed for deployment!
  async function deploySubman() {
	const Subman = await ethers.getContractFactory("Subman");
	const subman = await Subman.deploy();
	  return subman;
  }

	describe("Payee Addition", function() {
		it("Before any addition, should get 0x0 endSubPayee", async function() {
			const subman = await loadFixture(deploySubman);
			const signers = await ethers.getSigners();
			expect(await subman.endSubPayee(signers[0].address))
				.to.equal(ethers.constants.AddressZero);
		});
		it("Before any addition, should get 0x0 endSubPayee for other signers", async function() {
			// since this works, seems we can get at least three addresses this way
			const subman = await loadFixture(deploySubman);
			const signers = await ethers.getSigners();
			const payer = signers[1].address;
			const payee =  signers[2].address;
			expect(await subman.endSubPayer(payer))
				.to.equal(ethers.constants.AddressZero);
		});
		// TODO: repeat test above with a random addresses
		it("After adding a payee, should get that payee from endSubPayer", async function() {
			const subman = await loadFixture(deploySubman);
			// generate random payer address,
			// random payee address,
			// add payee as a payee from the payer, should get correct result.
			const signers = await ethers.getSigners();
			const payer = signers[0].address;
			const payee =  signers[1].address;

			success = await subman.addPayee(payee, 100, 10, payee);
			expect(await subman.endSubPayer(payer))
				.to.equal(payee);

		});
		it("After adding a payee, should get that payee from endSubPayee", async function() {
			const subman = await loadFixture(deploySubman);
			// generate random payer address,
			// random payee address,
			// add payee as a payee from the payer, should get correct result.
			const signers = await ethers.getSigners();
			const payer = signers[0].address;
			const payee =  signers[1].address;

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			success = await subman.addPayee(payee, 100, 10, payee);
			expect(await subman.endSubPayee(payee))
				.to.equal(payer);

		});
		it("After adding two payees, I should be able to get the second by iterating through", async function() {
			const subman = await loadFixture(deploySubman);
			// generate random payer address,
			// random payee address,
			// add payee as a payee from the payer, should get correct result.
			const signers = await ethers.getSigners();
			const payer = signers[0].address;
			const payee =  signers[1].address;
			const payee2 = signers[2].address;

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			success = await subman.addPayee(payee, 100, 10, payee);
			success2 = await subman.addPayee(payee2, 100, 10, payee);

			expect(await subman.endSubPayer(payer))
				.to.equal(payee2);

			const {firstBlock, numWithdrawals, amount, tokenAddr, payee_out, payer_out, nextPayer, nextPayee}= await subman.getSub(payer, payee2);

		});

	});

});
