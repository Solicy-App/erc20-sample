import { ethers } from "hardhat";

async function main() {

  const Erc20 = await ethers.getContractFactory("SolicyCoinERC20");
  const erc20 = await Erc20.deploy(5);

  await erc20.deployed();

  console.log(`deployed to ${erc20.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
