// const { expect, assert } = require("chai");
// const { ethers, network, upgrades } = require("hardhat");

// const metadata = "https://token-cdn-domain/";
// let accounts;
// let owner;
// let user1;
// let user2;
// let instance;
// let Test20Box;
// let Test20Box2;
// let Test20Beacon;

// describe("TEST ERC20", function () {
//   before("deploy", async function () {
//     await ethers.provider.send("hardhat_reset");
//     accounts = await ethers.getSigners();
//     owner = accounts[0];
//     user1 = accounts[1];
//     user2 = accounts[2];

//     Test20Box = await ethers.getContractFactory("MyToken");
//     Test20Box2 = await ethers.getContractFactory("MyTokenV2");

//     Test20Beacon = await upgrades.deployBeacon(Test20Box);
//     // this is proxy contract. All data is stored here.
//     instance = await upgrades.deployBeaconProxy(Test20Beacon, Test20Box, [
//       "MatrixToken",
//       "MTR"
//     ]);
//   });

//   describe("!!!!", function () {
//     it("!!!!!", async function () {
//       expect(instance.address).to.be.properAddress;
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
