import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat"
import { SolicyCoinERC20 } from "../typechain-types";
const BigNumber = require('bignumber.js');

const Web3EthAccounts = require('web3-eth-accounts');

const account = new Web3EthAccounts('ws://localhost:8546');


describe("ERC20", function () {
    
    let erc20: SolicyCoinERC20

    beforeEach(async () => {
        const SolicyCoinERC20 = await ethers.getContractFactory("SolicyCoinERC20");
        erc20 = await SolicyCoinERC20.deploy(5);
    });

    describe("Init", function () {
        it ("The token Name is correct", async () => {
            expect(await erc20.name()).to.equal("Solicy"); 
        })
        it ("The token Symbol is correct", async () => {
            expect(await erc20.symbol()).to.equal("SOL"); 
        })
        it ("The token decimals set correct", async () => {
            expect(await erc20.decimals()).to.equal(18); 
        })
    });

    describe("Mint", () => {
        it ("Essentially minted correct count of",async () => {
            expect(await erc20.totalSupply()).to.equal(10 ** 10); 
        })
        it ("The Mint functional is blocked for everyone", async () => {
            try {
                await erc20.mint()
            } catch (error: any) {
                expect(error.errorArgs[0]).to.equal("Mint action blocked in this contract");
            }
        })
    })

    describe("Burn", function () {
        it ("Token burn test complete successfully", async () => {
            const [owner] = await ethers.getSigners();
            const ballance = await erc20.balanceOf(owner.address);
            const amount = 2 ** 6;
            await erc20.burn(owner.address, amount);
            const balanceAfter = await erc20.balanceOf(owner.address);
            expect(Number(ballance) - amount).to.equal(balanceAfter);
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
        it ("Transfer functionality works perfect", async () => {
            const tempAccount_1 = account.create();
            const balanceBefore = await erc20.balanceOf(tempAccount_1.address)
            const amount = 2 ** 6
            erc20.transfer(tempAccount_1.address, amount)
            const balanceAfter = await erc20.balanceOf(tempAccount_1.address)
            expect(balanceBefore + new BigNumber(amount)).to.equal(balanceAfter);

        })
    })

    describe("Blacklist", () => {
        const tempAccount_1 = account.create();
        const tempAccount_2 = account.create();
        it("Add to blackList (transfer)", async () => {
            erc20.addToBlackList(tempAccount_1.address);
            try {
                await erc20.transfer(tempAccount_1.address, 2);
            } catch (error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'The address you are trying to transfer is blocked'");
            }
        })
        it("Add to blackList (transferFrom)", async () => {
            erc20.addToBlackList(tempAccount_1.address);
            try {
                await erc20.transferFrom(tempAccount_2.address, tempAccount_1.address, 2);
            } catch (error: any) {
                expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'The address you are trying to transfer is blocked'");
            }
        })
        it("Remove from blackList", async () => {
            erc20.delFromBlackList(tempAccount_1.address);
            const balanceBefore = await erc20.balanceOf(tempAccount_1.address);
            const amount = 2 ** 6;
            erc20.transfer(tempAccount_1.address, amount);
            const balanceAfter = await erc20.balanceOf(tempAccount_1.address);
            expect(balanceBefore + new BigNumber(amount)).to.equal(balanceAfter);
        });
    });
});
