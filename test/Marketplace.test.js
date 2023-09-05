// const { expect, assert } = require("chai");
// const { ethers, network, upgrades } = require("hardhat");

// const metadata = "https://token-cdn-domain/";
// let accounts;
// let owner;
// let user1;
// let user2;
// let instanceMarket;
// let instance20;
// let upgraded20;
// let instance721;
// let upgraded721;
// let Test20Box;
// let Test20Box2;
// let Test20Beacon;
// let Test721Box;
// let Test721Box2;
// let Test721Beacon;
// let MarketBox;
// let MarketBox2;
// let MarketBeacon;

// describe("TEST Marketplace", function () {
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
//     instance721 = await upgrades.deployBeaconProxy(Test721Beacon, Test721Box, [
//       "MatrixNFT",
//       "MTR"
//     ]);

//     Test20Box = await ethers.getContractFactory("MyToken");
//     Test20Box2 = await ethers.getContractFactory("MyTokenV2");
//     // eslint-disable-next-line camelcase
//     Test20Beacon = await upgrades.deployBeacon(Test20Box);
//     // this is proxy contract. All data is stored here.
//     instance20 = await upgrades.deployBeaconProxy(Test20Beacon, Test20Box, [
//       "MatrixToken",
//       "MTR"
//     ]);

//     MarketBox = await ethers.getContractFactory("Marketplace");
//     // eslint-disable-next-line camelcase
//     MarketBeacon = await upgrades.deployBeacon(MarketBox);
//     // this is proxy contract. All data is stored here.
//     instanceMarket = await upgrades.deployBeaconProxy(MarketBeacon, MarketBox, []);
//     console.log(instanceMarket.address);
//   });
//   describe("Main Test", function () {
//     it("should be deployed!", async function () {
//       expect(instance721.address).to.be.properAddress;
//       expect(instance20.address).to.be.properAddress;
//       expect(instanceMarket.address).to.be.properAddress;
//     })
//     describe("Set data", function () {
//       it("mint erc20 for user1", async function () {
//         let value = 100_000_000;
//         await instance20.mint(user1.address, value);
//         expect(await instance20.balanceOf(user1.address)).to.eq(value)
//       })
//       it("mint erc721 for user2", async function () {
//         for (let i = 0; i < 10; i++) {
//           await instance721.safeMint(user2.address, i, "someURI");
//         }
//         expect(await instance721.balanceOf(user2.address)).to.eq(10)
//       })
//       it("add tokens to whitelist by owner", async function () {
//         await instanceMarket
//           .addTokensToWhitelist(
//             [instance20.address, instance721.address],
//             [false, true]
//           );
//       });
//       it("check tokens in whitelist", async function () {
//         const erc20 = await instanceMarket.getWhitelistedTokens(false);
//         const erc721 = await instanceMarket.getWhitelistedTokens(true);
//         assert.equal(erc20.length, 1);
//         assert.equal(erc721.length, 1);
//       });
//     });
//     describe("Create offer", function () {
//       it("user2 create offer 0", async function () {
//         await instance721.connect(user2).approve(instanceMarket.address, 0);
//         await instanceMarket.connect(user2).createOffer(instance721.address, 0, instance20.address, 100000);

//         assert.isTrue(await instanceMarket.isOfferActive(0));
//         assert.isFalse(await instanceMarket.isOfferActive(1));
//         assert.equal(await instance721.ownerOf(0), user2.address);
//       })
//       it("user2 create offer 1", async function () {
//         await instance721.connect(user2).approve(instanceMarket.address, 1);
//         await instanceMarket.connect(user2).createOffer(instance721.address, 1, instance20.address, 200000);

//         assert.isTrue(await instanceMarket.isOfferActive(0));
//         assert.isTrue(await instanceMarket.isOfferActive(1));
//         assert.isFalse(await instanceMarket.isOfferActive(2));
//         assert.equal(await instance721.ownerOf(1), user2.address);
//       })
//       it("user2 create offer 2", async function () {
//         await instance721.connect(user2).approve(instanceMarket.address, 2);
//         await instanceMarket.connect(user2).createOffer(instance721.address, 2, instance20.address, 200000);

//         assert.isTrue(await instanceMarket.isOfferActive(0));
//         assert.isTrue(await instanceMarket.isOfferActive(1));
//         assert.isTrue(await instanceMarket.isOfferActive(2));
//         assert.isFalse(await instanceMarket.isOfferActive(3));

//         assert.equal(await instance721.ownerOf(2), user2.address);
//       })
//     });
//     describe("Cancel offer", function () {
//       it("user2 cancel offer 0", async function () {
//         await instanceMarket.connect(user2).cancelOffer(0);

//         assert.isFalse(await instanceMarket.isOfferActive(0));
//       })
//     });
//     describe("Edit offer", function () {
//       it("user2 edit offer 1", async function () {
//         await instanceMarket.connect(user2).editOffer(
//           1,
//           ethers.utils.parseUnits("2", "18"),
//           "0x0000000000000000000000000000000000000000"
//         );

//         let res = await instanceMarket.getOfferInfo(1);

//         assert.equal(res.price, BigInt(ethers.utils.parseUnits("2", "18")));
//         assert.equal(res.saleToken, "0x0000000000000000000000000000000000000000");
//       })
//     });
//     describe("Accept offer", function () {
//       it("user1 accept offer 1", async function () {
//         let marketFee = 200000000000000000n;// fee 10%
//         let sellerFee = 1800000000000000000n;
//         let cost = BigInt(ethers.utils.parseUnits("2", "ether"));

//         assert.equal(await instance721.ownerOf(1), user2.address);

//         let tx = await instanceMarket.connect(user1).acceptOffer(1, { value: cost });

//         await expect(() => tx)
//           .to.changeEtherBalances([user2, instanceMarket, user1], [sellerFee, marketFee, -cost]);

//         assert.equal(await instance721.ownerOf(1), user1.address);
//       })
//       it("user1 accept offer 2", async function () {
//         let marketFee = 20000;// fee 10%
//         let sellerFee = 180000;
//         let cost = 200000;

//         assert.equal(await instance721.ownerOf(2), user2.address);
//         await instance20.connect(user1).approve(instanceMarket.address, cost);

//         await expect(() => instanceMarket.connect(user1).acceptOffer(2))
//         .to.changeTokenBalances(instance20, [user2, instanceMarket, user1], [sellerFee, marketFee, -cost]);

//         assert.equal(await instance721.ownerOf(2), user1.address);
//       })
//     });
//     describe("Repeat action after upgrading", function () {
//       it("upgrade erc20 & erc721", async function () {
//         await upgrades.upgradeBeacon(Test20Beacon, Test20Box2);
//         upgraded20 = Test20Box2.attach(instance20.address);

//         await upgrades.upgradeBeacon(Test721Beacon, Test721Box2);
//         upgraded721 = Test721Box2.attach(instance721.address);
//       })
//       describe("Create offer", function () {
//         it("user2 create offer 3", async function () {
//           await upgraded721.connect(user2).approve(instanceMarket.address, 3);
//           await instanceMarket.connect(user2).createOffer(instance721.address, 3, instance20.address, 10000000);

//           assert.isTrue(await instanceMarket.isOfferActive(3));
//           assert.isFalse(await instanceMarket.isOfferActive(4));
//           assert.equal(await upgraded721.ownerOf(3), user2.address);
//         })
//       })
//       describe("Accept offer", function () {
//         it("user1 accept offer 3", async function () {
//           let marketFee = 1000000;// fee 10%
//           let sellerFee = 9000000;
//           let cost = 10000000;

//           assert.equal(await upgraded721.ownerOf(3), user2.address);
//           await instance20.connect(user1).approve(instanceMarket.address, cost);

//           await expect(() => instanceMarket.connect(user1).acceptOffer(3))
//           .to.changeTokenBalances(upgraded20, [user2, instanceMarket, user1], [sellerFee, marketFee, -cost]);

//           assert.equal(await upgraded721.ownerOf(3), user1.address);
//         })
//       })
//     });
//   })
// });
