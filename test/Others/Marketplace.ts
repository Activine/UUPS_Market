// import { expect } from "chai";
// import { ethers, upgrades } from "hardhat";
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { MyToken, MyToken721, Marketplace } from "../../types/typechain-types";
// import { ZERO_ADDRESS } from "../utils/constants";
// import { BigNumber } from "ethers";

// describe("TEST Marketplace", function () {
//   async function standardPrepare() {
//     const [owner, user1, user2]: SignerWithAddress[] = await ethers.getSigners();

//     const MyToken721Instance = await ethers.getContractFactory("MyToken721");

//     const MyToken721Beacon = await upgrades.deployBeacon(MyToken721Instance);
//     // this is proxy contract. All data is stored here.
//     const myToken721 = (await upgrades.deployBeaconProxy(
//       MyToken721Beacon,
//       MyToken721Instance,
//       ["MatrixNFT", "MTR"]
//     )) as MyToken721;

//     const MyToken20Instance = await ethers.getContractFactory("MyToken");

//     const MyToken20Beacon = await upgrades.deployBeacon(MyToken20Instance);
//     // this is proxy contract. All data is stored here.
//     const myToken20 = (await upgrades.deployBeaconProxy(
//       MyToken20Beacon,
//       MyToken20Instance,
//       ["MatrixToken", "MTR"]
//     )) as MyToken;

//     const MarketplaceInstance = await ethers.getContractFactory("Marketplace");
//     const MarketplaceBeacon = await upgrades.deployBeacon(MarketplaceInstance);
//     // this is proxy contract. All data is stored here.
//     const marketplace = (await upgrades.deployBeaconProxy(
//       MarketplaceBeacon,
//       MarketplaceInstance,
//       []
//     )) as Marketplace;

//     return {
//       owner,
//       user1,
//       user2,
//       myToken721,
//       myToken20,
//       marketplace,
//     };
//   }

//   async function mintingForTests(
//     owner: SignerWithAddress,
//     buyer: SignerWithAddress,
//     seller: SignerWithAddress,
//     erc20: MyToken,
//     erc721: MyToken721
//   ) {
//     await erc20.connect(owner).mint(buyer.address, 100_000_000);

//     for (let i = 0; i < 3; i++) {
//       await erc721.connect(owner).safeMint(seller.address, i, "someURI");
//     }
//   }

//   async function createOffer(
//     owner: SignerWithAddress,
//     buyer: SignerWithAddress,
//     seller: SignerWithAddress,
//     market: Marketplace,
//     erc20: MyToken,
//     erc721: MyToken721,
//     sellerToken: string,
//     id: number,
//     amount: BigNumber | number
//   ) {
//     await mintingForTests(owner, buyer, seller, erc20, erc721);
//     await market
//       .connect(owner)
//       .addTokensToWhitelist([erc20.address, erc721.address], [false, true]);

//     await erc721.connect(seller).approve(market.address, id);

//     await market.connect(seller).createOffer(erc721.address, id, sellerToken, amount);
//   }

//   describe("Main Test", function () {
//     it("success: should be deployed!", async () => {
//       const { myToken20, marketplace, myToken721 } = await loadFixture(standardPrepare);

//       expect(myToken721.address).to.be.properAddress;
//       expect(myToken20.address).to.be.properAddress;
//       expect(marketplace.address).to.be.properAddress;
//     });
//     describe("Whitelist", function () {
//       it("success: add tokens to whitelist by owner", async () => {
//         const { owner, myToken721, myToken20, marketplace } = await loadFixture(
//           standardPrepare
//         );

//         const tx = await marketplace
//           .connect(owner)
//           .addTokensToWhitelist([myToken20.address, myToken721.address], [false, true]);

//         await expect(tx)
//           .to.emit(marketplace, "AddToWhiteList")
//           .withArgs([myToken20.address, myToken721.address], [false, true]);
//       });
//       it("fail: add tokens to whitelist with incorrect data", async () => {
//         const { owner, myToken721, myToken20, marketplace } = await loadFixture(
//           standardPrepare
//         );
//         await expect(
//           marketplace
//             .connect(owner)
//             .addTokensToWhitelist(
//               [myToken20.address, myToken721.address],
//               [false, true, false]
//             )
//         ).to.be.revertedWithCustomError(marketplace, "UnequalLength");
//       });
//       it("success: check tokens in whitelist", async () => {
//         const { owner, myToken721, myToken20, marketplace } = await loadFixture(
//           standardPrepare
//         );
//         await marketplace
//           .connect(owner)
//           .addTokensToWhitelist(
//             [myToken20.address, ZERO_ADDRESS, myToken721.address],
//             [false, false, true]
//           );

//         const erc20 = await marketplace.getWhitelistedTokens(false);
//         const erc721 = await marketplace.getWhitelistedTokens(true);

//         expect(erc20.length).to.eq(2);
//         expect(erc721.length).to.eq(1);
//       });
//       it("success: remove tokens from whitelist by owner", async () => {
//         const { owner, myToken721, myToken20, marketplace } = await loadFixture(
//           standardPrepare
//         );

//         await marketplace
//           .connect(owner)
//           .addTokensToWhitelist(
//             [myToken20.address, ZERO_ADDRESS, myToken721.address],
//             [false, false, true]
//           );

//         const tx = marketplace
//           .connect(owner)
//           .removeTokensFromWhitelist([ZERO_ADDRESS], [false]);
//         await expect(tx)
//           .to.emit(marketplace, "RemoveFromWhiteList")
//           .withArgs([ZERO_ADDRESS], [false]);
//       });
//       it("fail: remove tokens from whitelist with incorrect data", async () => {
//         const { owner, myToken20, marketplace } = await loadFixture(standardPrepare);
//         await expect(
//           marketplace
//             .connect(owner)
//             .removeTokensFromWhitelist([myToken20.address], [false, true, false])
//         ).to.be.revertedWithCustomError(marketplace, "UnequalLength");
//       });
//     });
//     describe("Create offer", function () {
//       it("success: user2 create offer 0", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await mintingForTests(owner, user1, user2, myToken20, myToken721);
//         await marketplace
//           .connect(owner)
//           .addTokensToWhitelist([myToken20.address, myToken721.address], [false, true]);

//         await myToken721.connect(user2).approve(marketplace.address, 0);
//         const tx = await marketplace
//           .connect(user2)
//           .createOffer(myToken721.address, 0, myToken20.address, 100000);
//         expect(await marketplace.isOfferActive(0)).to.eq(true);
//         expect(await marketplace.isOfferActive(1)).to.eq(false);
//         expect(await myToken721.ownerOf(0)).to.eq(user2.address);
//         await expect(tx)
//           .to.emit(marketplace, "CreatedOffer")
//           .withArgs(0, user2.address, myToken721.address, 0, myToken20.address);
//       });
//       it("fail: trying to create offer with unsupported NFT address", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await mintingForTests(owner, user1, user2, myToken20, myToken721);

//         await expect(
//           marketplace
//             .connect(user2)
//             .createOffer(myToken721.address, 0, myToken20.address, 100000)
//         ).to.be.revertedWithCustomError(marketplace, "UnsupportedNFT");
//       });
//       it("fail: trying to create offer with unsupported sale token", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await mintingForTests(owner, user1, user2, myToken20, myToken721);
//         await marketplace
//           .connect(owner)
//           .addTokensToWhitelist([myToken721.address], [true]);
//         await expect(
//           marketplace
//             .connect(user2)
//             .createOffer(myToken721.address, 0, myToken20.address, 100000)
//         ).to.be.revertedWithCustomError(marketplace, "UnsupportedSaleToken");
//       });
//       it("fail: trying to create offer without approve", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await mintingForTests(owner, user1, user2, myToken20, myToken721);
//         await marketplace
//           .connect(owner)
//           .addTokensToWhitelist([myToken20.address, myToken721.address], [false, true]);

//         await expect(
//           marketplace
//             .connect(user2)
//             .createOffer(myToken721.address, 0, myToken20.address, 100000)
//         ).to.be.revertedWithCustomError(marketplace, "NotApproved");
//       });
//     });
//     describe("Cancel offer", function () {
//       it("success: user2 cancel offer 0", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           0,
//           100000
//         );
//         expect(await marketplace.isOfferActive(0)).to.eq(true);
//         const tx = await marketplace.connect(user2).cancelOffer(0);
//         expect(await marketplace.isOfferActive(0)).to.eq(false);
//         await expect(tx).to.emit(marketplace, "OfferCanceled").withArgs(user2.address, 0);
//       });
//       it("fail: trying to cancel a non-existent offer", async () => {
//         const { user2, marketplace } = await loadFixture(standardPrepare);

//         await expect(
//           marketplace.connect(user2).cancelOffer(0)
//         ).to.be.revertedWithCustomError(marketplace, "NotActiveOffer");
//       });
//       it("fail: attempt to cancel the offer by user1", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);
//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           0,
//           100000
//         );
//         await expect(
//           marketplace.connect(user1).cancelOffer(0)
//         ).to.be.revertedWithCustomError(marketplace, "NotAnOwner");
//       });
//     });
//     describe("Edit offer", function () {
//       it("success: user2 edit offer 1", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           0,
//           100000
//         );

//         const tx = await marketplace
//           .connect(user2)
//           .editOffer(0, ethers.utils.parseUnits("2", "18"), ZERO_ADDRESS);

//         const res = await marketplace.getOfferInfo(0);

//         expect(res.price).to.eq(ethers.utils.parseUnits("2", "18"));
//         expect(res.saleToken).to.eq(ZERO_ADDRESS);
//         await expect(tx)
//           .to.emit(marketplace, "EditOffer")
//           .withArgs(user2.address, 0, ethers.utils.parseUnits("2", "18"), ZERO_ADDRESS);
//       });
//       it("fail: trying to edit a non-existent offer", async () => {
//         const { user2, marketplace } = await loadFixture(standardPrepare);

//         await expect(
//           marketplace
//             .connect(user2)
//             .editOffer(0, ethers.utils.parseUnits("2", "18"), ZERO_ADDRESS)
//         ).to.be.revertedWithCustomError(marketplace, "NotActiveOffer");
//       });
//       it("fail: attempt to edit the offer by user1", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);
//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           0,
//           100000
//         );
//         await expect(
//           marketplace
//             .connect(user1)
//             .editOffer(0, ethers.utils.parseUnits("2", "18"), ZERO_ADDRESS)
//         ).to.be.revertedWithCustomError(marketplace, "NotAnOwner");
//       });
//       it("fail: attempt to edit the offer with zero price", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);
//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           0,
//           100000
//         );
//         await expect(
//           marketplace.connect(user2).editOffer(0, 0, ZERO_ADDRESS)
//         ).to.be.revertedWithCustomError(marketplace, "OnlyPositivePrice");
//       });
//       it("fail: attempt to edit the offer with unsupported sale token", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);
//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           0,
//           100000
//         );
//         await expect(
//           marketplace
//             .connect(user2)
//             .editOffer(0, ethers.utils.parseUnits("2", "18"), myToken721.address)
//         ).to.be.revertedWithCustomError(marketplace, "UnsupportedSaleToken");
//       });
//     });
//     describe("Accept offer", function () {
//       it("success: user1 accept offer with token", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           1,
//           1000000
//         );

//         await myToken20.connect(user1).approve(marketplace.address, 1000000);
//         expect(await myToken721.ownerOf(1)).to.eq(user2.address);
//         const tx = await marketplace.connect(user1).acceptOffer(0);

//         await expect(tx).to.changeTokenBalances(
//           myToken20,
//           [user2, marketplace, user1],
//           [900000, 100000, -1000000]
//         );

//         expect(await myToken721.ownerOf(1)).to.eq(user1.address);

//         await expect(tx).to.emit(marketplace, "AcceptOffer").withArgs(user1.address, 0);
//       });
//       it("success: user1 accept offer with Ether", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           ZERO_ADDRESS,
//           1,
//           ethers.utils.parseUnits("1", "18")
//         );

//         expect(await myToken721.ownerOf(1)).to.eq(user2.address);
//         const tx = await marketplace
//           .connect(user1)
//           .acceptOffer(0, { value: ethers.utils.parseUnits("1", "18") });

//         await expect(tx).to.changeEtherBalances(
//           [user2, marketplace, user1],
//           [
//             ethers.utils.parseUnits("9", "17"),
//             ethers.utils.parseUnits("1", "17"),
//             ethers.utils.parseUnits("-1", "18"),
//           ]
//         );

//         expect(await myToken721.ownerOf(1)).to.eq(user1.address);

//         await expect(tx).to.emit(marketplace, "AcceptOffer").withArgs(user1.address, 0);
//       });
//       it("fail: trying to accept a non-existent offer", async () => {
//         const { user1, marketplace } = await loadFixture(standardPrepare);

//         await expect(
//           marketplace.connect(user1).acceptOffer(0)
//         ).to.be.revertedWithCustomError(marketplace, "NotActiveOffer");
//       });
//       it("fail: attempt to edit the offer by owner of NFT", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);
//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           0,
//           100000
//         );
//         await expect(
//           marketplace.connect(user2).acceptOffer(0)
//         ).to.be.revertedWithCustomError(marketplace, "ExceptOwner");
//       });
//       it("fail: user1 accept offer 1 with token & ether", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           1,
//           100000
//         );

//         await expect(
//           marketplace.connect(user1).acceptOffer(0, { value: 100000 })
//         ).to.be.revertedWithCustomError(marketplace, "WithoutEther");
//       });
//       it("fail: user1 accepts offer with Ether but doesn't send it", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           ZERO_ADDRESS,
//           1,
//           1000000
//         );

//         await expect(
//           marketplace.connect(user1).acceptOffer(0)
//         ).to.be.revertedWithCustomError(marketplace, "InvalidPrice");
//       });
//     });
//     describe("Withdraw market fee", function () {
//       it("success: withdraw all ETH", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         let value = ethers.utils.parseUnits("1", "18");
//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           ZERO_ADDRESS,
//           0,
//           ethers.utils.parseUnits("1", "18")
//         );

//         await marketplace
//           .connect(user1)
//           .acceptOffer(0, { value: ethers.utils.parseUnits("1", "18") });

//         const tx = await marketplace.connect(owner).unlockETH();

//         await expect(tx).to.changeEtherBalances(
//           [marketplace, owner],
//           [ethers.utils.parseUnits("-1", "17"), ethers.utils.parseUnits("1", "17")]
//         );
//         await expect(tx)
//           .to.emit(marketplace, "Withdraw")
//           .withArgs(ZERO_ADDRESS, ethers.utils.parseUnits("1", "17"));
//       });
//       it("success: withdraw all tokens", async () => {
//         const { owner, user1, user2, myToken721, myToken20, marketplace } =
//           await loadFixture(standardPrepare);

//         await createOffer(
//           owner,
//           user1,
//           user2,
//           marketplace,
//           myToken20,
//           myToken721,
//           myToken20.address,
//           1,
//           1000000
//         );

//         await myToken20.connect(user1).approve(marketplace.address, 1000000);
//         expect(await myToken721.ownerOf(1)).to.eq(user2.address);
//         await marketplace.connect(user1).acceptOffer(0);

//         const tx = await marketplace.connect(owner).unlockTokens(myToken20.address);
//         await expect(tx).to.changeTokenBalances(
//           myToken20,
//           [marketplace, owner],
//           [-100000, 100000]
//         );
//         await expect(tx)
//           .to.emit(marketplace, "Withdraw")
//           .withArgs(myToken20.address, 100000);
//       });
//       it("fail: zero balance ETH", async () => {
//         const { owner, marketplace } = await loadFixture(standardPrepare);
//         await expect(
//           marketplace.connect(owner).unlockETH()
//         ).to.be.revertedWithCustomError(marketplace, "ZeroBalance");
//       });
//       it("fail: zero balance in token", async () => {
//         const { owner, marketplace, myToken20 } = await loadFixture(standardPrepare);
//         await expect(
//           marketplace.connect(owner).unlockTokens(myToken20.address)
//         ).to.be.revertedWithCustomError(marketplace, "ZeroBalance");
//       });
//     });
//   });
// });
