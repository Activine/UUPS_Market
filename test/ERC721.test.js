// const { expect, assert } = require("chai");
// const { ethers, network, upgrades } = require("hardhat");

// const metadata = "https://token-cdn-domain/";
// let accounts;
// let owner;
// let user1;
// let user2;
// let instance;
// let Test721Box;
// let Test721Box2;
// let Test721Beacon;

// describe("TEST ERC721", function () {
//   before("deploy", async function () {
//     await ethers.provider.send("hardhat_reset");
//     accounts = await ethers.getSigners();
//     owner = accounts[0];
//     user1 = accounts[1];
//     user2 = accounts[2];


//     Test721Box = await ethers.getContractFactory("MyToken721");
//     Test721Box2 = await ethers.getContractFactory("MyToken721V2");
//     // eslint-disable-next-line camelcase
//     Test721Beacon = await upgrades.deployBeacon(Test721Box);
//     instance = await upgrades.deployBeaconProxy(Test721Beacon, Test721Box, [
//       "MatrixNFT",
//       "MTR"
//     ]);
//   });

//   describe("!!!!", function () {
//     it("!!!!!", async function () {
//       await instance.safeMint(owner.address, 0, "rrW");

//       console.log("D", await instance.ownerOf(0));

//       // // UPGRADE
//       await upgrades.upgradeBeacon(Test721Beacon, Test721Box2);

//       const upgraded = Test721Box2.attach(instance.address);
//       await upgraded.safeMint2(owner.address, 1, "121QWERT");

//       console.log("W", await instance.ownerOf(1)); // the same like in v1
//     });
//   });
// });
