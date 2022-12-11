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
async function deploySubmanAndToken() {
	const Subman = await ethers.getContractFactory("Subman");
	const subman = await Subman.deploy();
	const Token = await ethers.getContractFactory("TestToken");
	const token = await Token.deploy();
	await token.transfer((await ethers.getSigners())[1].address, ethers.BigNumber.from("20000").mul(ethers.BigNumber.from("10").pow(await token.decimals())));
	await token.approve(subman.address, 10000000000);
	return [subman, token];
  }
	describe("Payee Addition", function() {
		it("Before any addition, should get empty array of payees", async function() {
			const subman = await loadFixture(deploySubman);
			const signers = await ethers.getSigners();

			expect(await subman.getPayeesForPayer(signers[0].address)).to.deep.equal([]);
		});
		it("Before any addition, should get empty array of payers", async function() {
			const subman = await loadFixture(deploySubman);
			const signers = await ethers.getSigners();

			expect(await subman.getPayersForPayee(signers[0].address)).to.deep.equal([]);
		});
				
		// TODO: ensure that withdrawing money before the time is up fails
		
		it("getPayeesForPayer should return a list of the two payees that we add", async function() {
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
			
			expect(await subman.getPayeesForPayer(payer)).to.deep.equal([payee2, payee]);
		});
		it("getPayersForPayee should return a list of the two payers that we add", async function() {
			const subman = await loadFixture(deploySubman);
			// generate random payer address,
			// random payee address,
			// add payee as a payee from the payer, should get correct result.
			const signers = await ethers.getSigners();
			const payer1 = signers[0];
			const payer2 =  signers[1];
			const payee = signers[2].address;

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			success = await subman.addPayee(payee, 100, 10, payee);
			success2 = await subman.connect(payer2).addPayee(payee, 100, 10, payee);
			
			expect(await subman.getPayersForPayee(payee)).to.deep.equal([payer2.address, payer1.address]);
		});

		it("Should successfully remove the first payee", async function() {
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
			
			await subman.stopPayment(payee);
			expect(await subman.getPayeesForPayer(payer)).to.deep.equal([payee2]);

		});
		it("Should successfully remove the second payee", async function() {
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
			
			await subman.stopPayment(payee2);
			expect(await subman.getPayeesForPayer(payer)).to.deep.equal([payee]);

		});
		it("Should successfully remove the middle payee of three", async function() {
		const subman = await loadFixture(deploySubman);
			const signers = await ethers.getSigners();
			const payer = signers[0].address;
			const payee =  signers[1].address;
			const payee2 = signers[2].address;
			const payee3 = signers[3].address;

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			success = await subman.addPayee(payee, 100, 10, payee);
			success2 = await subman.addPayee(payee2, 100, 10, payee);
			success3 = await subman.addPayee(payee3, 100, 10, payee);
			
			await subman.stopPayment(payee2);

			expect(await subman.getPayeesForPayer(payer)).to.deep.equal([payee3, payee]);
		});

		it("Should successfully remove the first payer", async function() {
		const subman = await loadFixture(deploySubman);
			// generate random payer address,
			// random payee address,
			// add payee as a payee from the payer, should get correct result.
			const signers = await ethers.getSigners();
			const payer1 = signers[0];
			const payer2 =  signers[1];
			const payee = signers[2].address;

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			success = await subman.addPayee(payee, 100, 10, payee);
			success2 = await subman.connect(payer2).addPayee(payee, 100, 10, payee);
			
			await subman.stopPayment(payee);
			expect(await subman.getPayersForPayee(payee)).to.deep.equal([payer2.address]);

		});
		it("Should successfully remove the second payer", async function() {
		const subman = await loadFixture(deploySubman);
			const signers = await ethers.getSigners();
			const payer1 = signers[0];
			const payer2 =  signers[1];
			const payee = signers[2].address;

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			success = await subman.addPayee(payee, 100, 10, payee);
			success2 = await subman.connect(payer2).addPayee(payee, 100, 10, payee);
			
			await subman.connect(payer2).stopPayment(payee);
			expect(await subman.getPayersForPayee(payee)).to.deep.equal([payer1.address]);
		});
		it("Should successfully remove the middle payer of three", async function() {
		const subman = await loadFixture(deploySubman);
			const signers = await ethers.getSigners();
			const payer = signers[0].address;
			const payee =  signers[1].address;
			const payer2 = signers[2];
			const payer3 = signers[3];

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			success = await subman.addPayee(payee, 100, 10, payee);
			success2 = await subman.connect(payer2).addPayee(payee, 100, 10, payee);
			success3 = await subman.connect(payer3).addPayee(payee, 100, 10, payee);
			
			await subman.connect(payer2).stopPayment(payee);

			expect(await subman.getPayersForPayee(payee)).to.deep.equal([payer3.address, payer]);
		});

	});
	describe("Token interoperability", function() {
		it("Should create the token and send the first transaction", async function() {
			const [subman, token] = await loadFixture(deploySubmanAndToken);
			const signers = await ethers.getSigners();
			expect(await token.balanceOf(signers[0].address)).to.equal(ethers.BigNumber.from("80000").mul(ethers.BigNumber.from("10").pow(await token.decimals())));
		});
	});

	describe("Token interoperability", function() {
		it("Should create the token and send the first transaction", async function() {
			const [subman, token] = await loadFixture(deploySubmanAndToken);
			const signers = await ethers.getSigners();
			expect(await token.balanceOf(signers[1].address)).to.equal(ethers.BigNumber.from("20000").mul(ethers.BigNumber.from("10").pow(await token.decimals())));
		});
		it("Withdrawing early should fail if it's done too early", async function() {
			const [subman, token] = await loadFixture(deploySubmanAndToken);
			// generate random payer address,
			// random payee address,
			// add payee as a payee from the payer, should get correct result.
			const signers = await ethers.getSigners();
			const payer = signers[0];
			const payee =  signers[1];

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			await subman.addPayee(payee.address, 100, 10, token.address);
			
			await subman.connect(payee).withdraw(payer.address);

			//const withdrawUnsigned = await subman.populateTransaction.withdraw(payer);
			//const withdrawSigned = signers[1].signTransaction(withdrawUnsigned);
			//await expect().to.be.revertedWith("Withdrawing too frequently")
			await expect(subman.connect(payee).withdraw(payer.address)).to.be.revertedWith("Withdrawing too frequently")
		});
		it("Withdrawing should work if it's done after a reasonable time", async function() {
			const [subman, token] = await loadFixture(deploySubmanAndToken);
			// generate random payer address,
			// random payee address,
			// add payee as a payee from the payer, should get correct result.
			const signers = await ethers.getSigners();
			const payer = signers[0];
			const payee =  signers[1];

			// I'm using the payee address in place of the token because it fits for now and doesn't matter
			await subman.addPayee(payee.address, 100, 10, token.address);
			
			
			await subman.connect(payee).withdraw(payer.address);

			await time.increase(11);
			//await time.increaseTo(time.);

			//const withdrawUnsigned = await subman.populateTransaction.withdraw(payer);
			//const withdrawSigned = signers[1].signTransaction(withdrawUnsigned);
			//await expect().to.be.revertedWith("Withdrawing too frequently")
			//await expect(subman.connect(payee).withdraw(payer.address)).to.be.revertedWith("Withdrawing too frequently")
			await subman.connect(payee).withdraw(payer.address);
			expect(await token.balanceOf(signers[1].address)).to.equal(ethers.BigNumber.from("20000").mul(
				ethers.BigNumber.from("10").pow(await token.decimals())).add(ethers.BigNumber.from("200")));

		});
	});
	

});
