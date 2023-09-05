// const { expect, assert } = require("chai");
// const { ethers, network, upgrades } = require("hardhat");
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { MyToken, MyTokenV2 } from '../types/typechain-types';
// import { Contract } from "ethers";

// const metadata = "https://token-cdn-domain/";
// let owner: SignerWithAddress;
// let user1: SignerWithAddress;
// let user2: SignerWithAddress;
// let Test20Box2: MyTokenV2;

// describe("TEST ERC20", function () {
//   async function standardPrepare() {
// //     await ethers.provider.send("hardhat_reset");
//     const [owner, user1, user2] = await ethers.getSigners();

//     const Test20Box = await ethers.getContractFactory("MyToken");
//     const Test20Box2 = await ethers.getContractFactory("MyTokenV2");
//     // eslint-disable-next-line camelcase
//     const Test20Beacon = await upgrades.deployBeacon(Test20Box);
//     // this is proxy contract. All data is stored here.
//     const instance = await upgrades.deployBeaconProxy(Test20Beacon, Test20Box, [
//       "MatrixToken",
//       "MTR"
//     ]);

//     return {
//       owner,
//       user1,
//       user2,
//       Test20Beacon,
//       Test20Box2,
//       Test20Box,
//       instance
//     };
//   }

//   describe("mint", function () {
//     it("mint by user1", async function () {
//       const { owner, Test20Beacon, instance, Test20Box2} = await loadFixture(standardPrepare);
//       // expect(instance.address).to.be.properAddress;
//         await instance.mint(owner.address, 100);

//         console.log("D", await instance.balanceOf(owner.address));

//         // // UPGRADE
//         await upgrades.upgradeBeacon(Test20Beacon, Test20Box2);

//         const upgraded = Test20Box2.attach(instance.address);

//         await upgraded.mint2(owner.address, 100);
//         console.log("W", await instance.balanceOf(owner.address)); // the same like in v1
//     });
//   });
// });
