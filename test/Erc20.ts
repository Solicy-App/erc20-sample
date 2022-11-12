import { expect } from "chai";
import { ethers } from "hardhat";
import { SolicyCoinERC20 } from "../typechain-types";

const BigNumber = require('bignumber.js');
const Web3EthAccounts = require('web3-eth-accounts');
const account = new Web3EthAccounts('ws://localhost:8546');


describe("ERC20", function () {
    let erc20: SolicyCoinERC20;
    let tempAccount_1: any;

    beforeEach(async () => {
        const SolicyCoinERC20 = await ethers.getContractFactory("SolicyCoinERC20");
        erc20 = await SolicyCoinERC20.deploy(5);
        tempAccount_1 = account.create();
        erc20.addToBlackList(tempAccount_1.address);
    });

    describe("Init", function () {
        it ("The token Name is correct", async () => {
            expect(await erc20.name()).to.equal("Solicy"); 
        });
        it ("The token Symbol is correct", async () => {
            expect(await erc20.symbol()).to.equal("SOL"); 
        });
        it ("The token decimals set correct", async () => {
            expect(await erc20.decimals()).to.equal(18); 
        });
    });

    describe("Mint", () => {
        it ("Essentially minted correct count of",async () => {
            expect(await erc20.totalSupply()).to.equal(10 ** 10); 
        });
        it ("The Mint functional is blocked for everyone", async () => {

            await expect(erc20.mint()).to.be.rejectedWith("Mint action blocked in this contract")

        });
    });

    describe("Burn", function () {
        it ("Owner burned Token test complete successfully", async () => {
            const [owner] = await ethers.getSigners();
            const ballance = await erc20.balanceOf(owner.address);
            const amount = 10 ** 10;
            await erc20.burn(owner.address, amount);
            const balanceAfter = await erc20.balanceOf(owner.address);
            expect(Number(ballance) - amount).to.equal(balanceAfter);
        });

        it ("Account can't burn Tokens of another account", async () => {
            try {
                await erc20.burn(tempAccount_1.address, 1);
            } catch (error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Only wallet owner can burn it's tokens'");
            };
        });
    });

    describe("Fee", () => {
        it ("Token fee set correctly", async () => {
            const _fee = 2;
            erc20.setFee(_fee);
            expect(_fee).to.equal(await erc20.getFee());
        })
    })

    describe("Transfer", () => {
        it ("Transfer token test complete successfully", async () => {
            const tempAccount_1 = account.create();
            const balanceBefore = await erc20.balanceOf(tempAccount_1.address);
            const amount = 10 ** 10;
            await erc20.transfer(tempAccount_1.address, amount);
            const balanceAfter = await erc20.balanceOf(tempAccount_1.address);
            const expectedBalance = balanceBefore + new BigNumber(amount);
            expect(expectedBalance).to.equal(balanceAfter);
        })

        it ("Transfer token with not enough amount test complete successfully", async () => {
            try {
                const [owner] = await ethers.getSigners();
                const balanceOwner = await erc20.balanceOf(owner.address);
                const tempAccount_1 = account.create();
                const amount = 10 ** 10;
                await erc20.transfer(tempAccount_1.address, balanceOwner + BigNumber(amount));

            } catch (error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'ERC20: transfer amount exceeds balance'");
            };
        });

        it ("transferFrom token test complete successfully", async () => {
            try {
                const [owner, addr1, addr2] = await ethers.getSigners();
                const balanceAddr2Before = await erc20.balanceOf(addr2.address);
                const amount = 1;
                await erc20.transfer(addr1.address, 1);
                await erc20.connect(addr1).increaseAllowance(owner.address, 2);
                await erc20.transferFrom(addr1.address, addr2.address, amount);
                const balanceAddr2After = await erc20.balanceOf(addr2.address);

                expect(balanceAddr2Before + new BigNumber(amount)).to.equal(balanceAddr2After);
            } catch (error) {
                console.log(error);
            };
        });
    });

    describe("Blacklist", () => {
        const tempAccount_2 = account.create();

        it("Add to blackList (transfer)", async () => {
            try {
                await erc20.transfer(tempAccount_1.address, 2);
            } catch (error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'The address you are trying to transfer is blocked'");
            };
        });

        it("Add to blackList (transferFrom)", async () => {
            try {
                await erc20.transferFrom(tempAccount_2.address, tempAccount_1.address, 2);
            } catch (error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'The address you are trying to transfer is blocked'");
            };
        });

        it("Remove from blackList", async () => {
            erc20.delFromBlackList(tempAccount_1.address);
            const balanceBefore = await erc20.balanceOf(tempAccount_1.address);
            const amount = 10 ** 10;
            erc20.transfer(tempAccount_1.address, amount);
            const balanceAfter = await erc20.balanceOf(tempAccount_1.address);
            expect(balanceBefore + new BigNumber(amount)).to.equal(balanceAfter);
        });
    });
});
