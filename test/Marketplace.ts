import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken, MyToken721, Marketplace } from "../types/typechain-types";
import { ZERO_ADDRESS } from "./utils/constants";
import { Contract } from "ethers";

describe("TEST Marketplace", function () {
  async function standardPrepare() {
    const [owner, user1, user2]: SignerWithAddress[] = await ethers.getSigners();

    const Test721Box = await ethers.getContractFactory("MyToken721");
    const Test721Box2 = await ethers.getContractFactory("MyToken721V2");
    // eslint-disable-next-line camelcase
    const Test721Beacon = await upgrades.deployBeacon(Test721Box);
    const instance721: MyToken721 = await upgrades.deployBeaconProxy(
      Test721Beacon,
      Test721Box,
      ["MatrixNFT", "MTR"]
    );

    const Test20Box = await ethers.getContractFactory("MyToken");
    const Test20Box2 = await ethers.getContractFactory("MyTokenV2");
    // eslint-disable-next-line camelcase
    const Test20Beacon = await upgrades.deployBeacon(Test20Box);
    // this is proxy contract. All data is stored here.
    const instance20: MyToken = await upgrades.deployBeaconProxy(
      Test20Beacon,
      Test20Box,
      ["MatrixToken", "MTR"]
    );

    const MarketBox = await ethers.getContractFactory("Marketplace");
    // eslint-disable-next-line camelcase
    const MarketBeacon = await upgrades.deployBeacon(MarketBox);
    // this is proxy contract. All data is stored here.
    const instanceMarket: Marketplace = await upgrades.deployBeaconProxy(
      MarketBeacon,
      MarketBox,
      []
    );

    return {
      owner,
      user1,
      user2,
      instance721,
      instance20,
      instanceMarket,
    };
  }

  async function mintingForTests(
    owner: SignerWithAddress,
    buyer: SignerWithAddress,
    seller: SignerWithAddress,
    erc20: MyToken,
    erc721: MyToken721
  ) {
    await erc20.connect(owner).mint(buyer.address, 100_000_000);

    for (let i = 0; i < 3; i++) {
      await erc721.connect(owner).safeMint(seller.address, i, "someURI");
    }
  }
  async function setDataMarketplace(
    owner: SignerWithAddress,
    market: Marketplace,
    arrAddress: string[],
    arrBool: boolean[]
  ) {
    await market.connect(owner).addTokensToWhitelist(arrAddress, arrBool);
  }
  async function createOffer(
    owner: SignerWithAddress,
    buyer: SignerWithAddress,
    seller: SignerWithAddress,
    market: Marketplace,
    erc20: MyToken,
    erc721: MyToken721,
    sellerToken: string,
    id: number,
    amount: number
  ) {
    await mintingForTests(owner, buyer, seller, erc20, erc721);
    await setDataMarketplace(
      owner,
      market,
      [erc20.address, erc721.address],
      [false, true]
    );
    await erc721.connect(seller).approve(market.address, id);

    await market.connect(seller).createOffer(erc721.address, id, sellerToken, amount);
  }
  async function acceptOffer(
    buyer: SignerWithAddress,
    erc20: MyToken | typeof ZERO_ADDRESS,
    market: Marketplace,
    id: number,
    price: number
  ) {
    if (ZERO_ADDRESS != erc20) {
      await erc20.connect(buyer).approve(market.address, price);
      await market.connect(buyer).acceptOffer(id);
    } else {
      await market.connect(buyer).acceptOffer(id, { value: price });
    }
  }
  describe("Main Test", function () {
    it("success: should be deployed!", async function () {
      const { instance20, instanceMarket, instance721 } = await loadFixture(
        standardPrepare
      );

      expect(instance721.address).to.be.properAddress;
      expect(instance20.address).to.be.properAddress;
      expect(instanceMarket.address).to.be.properAddress;
    });
    describe("Set data", function () {
      it("success: mint erc20 for user1", async function () {
        const { instance20, user1 } = await loadFixture(standardPrepare);

        const value = 100_000_000;
        await instance20.mint(user1.address, value);
        expect(await instance20.balanceOf(user1.address)).to.eq(value);
      });
      it("success: mint erc721 for user2", async function () {
        const { instance721, user2 } = await loadFixture(standardPrepare);

        for (let i = 0; i < 3; i++) {
          await instance721.safeMint(user2.address, i, "someURI");
        }
        expect(await instance721.balanceOf(user2.address)).to.eq(3);
      });
    });
    describe("Whitelist", function () {
      it("success: add tokens to whitelist by owner", async function () {
        const { owner, instance721, instance20, instanceMarket } = await loadFixture(
          standardPrepare
        );

        const tx = await instanceMarket
          .connect(owner)
          .addTokensToWhitelist([instance20.address, instance721.address], [false, true]);

        await expect(tx)
          .to.emit(instanceMarket, "AddToWhiteList")
          .withArgs([instance20.address, instance721.address], [false, true]);
      });
      it("fail: add tokens to whitelist with incorrect data", async function () {
        const { owner, instance721, instance20, instanceMarket } = await loadFixture(
          standardPrepare
        );
        await expect(
          instanceMarket
            .connect(owner)
            .addTokensToWhitelist(
              [instance20.address, instance721.address],
              [false, true, false]
            )
        ).to.be.revertedWithCustomError(instanceMarket, "UnequalLength");
      });
      it("success: check tokens in whitelist", async function () {
        const { owner, instance721, instance20, instanceMarket } = await loadFixture(
          standardPrepare
        );

        await setDataMarketplace(
          owner,
          instanceMarket,
          [instance20.address, ZERO_ADDRESS, instance721.address],
          [false, false, true]
        );

        const erc20 = await instanceMarket.getWhitelistedTokens(false);
        const erc721 = await instanceMarket.getWhitelistedTokens(true);

        expect(erc20.length).to.eq(2);
        expect(erc721.length).to.eq(1);
      });
      it("success: remove tokens from whitelist by owner", async function () {
        const { owner, instance721, instance20, instanceMarket } = await loadFixture(
          standardPrepare
        );

        await setDataMarketplace(
          owner,
          instanceMarket,
          [instance20.address, ZERO_ADDRESS, instance721.address],
          [false, false, true]
        );

        const tx = instanceMarket
          .connect(owner)
          .removeTokensFromWhitelist([ZERO_ADDRESS], [false]);
        await expect(tx)
          .to.emit(instanceMarket, "RemoveFromWhiteList")
          .withArgs([ZERO_ADDRESS], [false]);
      });
      it("fail: remove tokens from whitelist with incorrect data", async function () {
        const { owner, instance20, instanceMarket } = await loadFixture(standardPrepare);
        await expect(
          instanceMarket
            .connect(owner)
            .removeTokensFromWhitelist([instance20.address], [false, true, false])
        ).to.be.revertedWithCustomError(instanceMarket, "UnequalLength");
      });
    });
    describe("Create offer", function () {
      it("success: user2 create offer 0", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await mintingForTests(owner, user1, user2, instance20, instance721);
        await setDataMarketplace(
          owner,
          instanceMarket,
          [instance20.address, instance721.address],
          [false, true]
        );
        await instance721.connect(user2).approve(instanceMarket.address, 0);
        const tx = await instanceMarket
          .connect(user2)
          .createOffer(instance721.address, 0, instance20.address, 100000);
        expect(await instanceMarket.isOfferActive(0)).to.eq(true);
        expect(await instanceMarket.isOfferActive(1)).to.eq(false);
        expect(await instance721.ownerOf(0)).to.eq(user2.address);
        await expect(tx)
          .to.emit(instanceMarket, "CreatedOffer")
          .withArgs(0, user2.address, instance721.address, 0, instance20.address);
      });
      it("fail: trying to create offer with unsupported NFT address", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await mintingForTests(owner, user1, user2, instance20, instance721);

        await expect(
          instanceMarket
            .connect(user2)
            .createOffer(instance721.address, 0, instance20.address, 100000)
        ).to.be.revertedWithCustomError(instanceMarket, "UnsupportedNFT");
      });
      it("fail: trying to create offer with unsupported sale token", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await mintingForTests(owner, user1, user2, instance20, instance721);
        await setDataMarketplace(owner, instanceMarket, [instance721.address], [true]);
        await expect(
          instanceMarket
            .connect(user2)
            .createOffer(instance721.address, 0, instance20.address, 100000)
        ).to.be.revertedWithCustomError(instanceMarket, "UnsupportedSaleToken");
      });
      it("fail: trying to create offer without approve", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await mintingForTests(owner, user1, user2, instance20, instance721);
        await setDataMarketplace(
          owner,
          instanceMarket,
          [instance20.address, instance721.address],
          [false, true]
        );

        await expect(
          instanceMarket
            .connect(user2)
            .createOffer(instance721.address, 0, instance20.address, 100000)
        ).to.be.revertedWithCustomError(instanceMarket, "NotApprowed");
      });
    });
    describe("Cancel offer", function () {
      it("success: user2 cancel offer 0", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          0,
          100000
        );
        expect(await instanceMarket.isOfferActive(0)).to.eq(true);
        const tx = await instanceMarket.connect(user2).cancelOffer(0);
        expect(await instanceMarket.isOfferActive(0)).to.eq(false);
        await expect(tx)
          .to.emit(instanceMarket, "OfferCanceled")
          .withArgs(user2.address, 0);
      });
      it("fail: trying to cancel a non-existent offer", async function () {
        const { user2, instanceMarket } = await loadFixture(standardPrepare);

        await expect(
          instanceMarket.connect(user2).cancelOffer(0)
        ).to.be.revertedWithCustomError(instanceMarket, "NotActiveOffer");
      });
      it("fail: attempt to cancel the offer by user1", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);
        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          0,
          100000
        );
        await expect(
          instanceMarket.connect(user1).cancelOffer(0)
        ).to.be.revertedWithCustomError(instanceMarket, "OnlyOwner");
      });
    });
    describe("Edit offer", function () {
      it("success: user2 edit offer 1", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          0,
          100000
        );

        const tx = await instanceMarket
          .connect(user2)
          .editOffer(0, ethers.utils.parseUnits("2", "18"), ZERO_ADDRESS);

        const res = await instanceMarket.getOfferInfo(0);

        expect(res.price).to.eq(BigInt(ethers.utils.parseUnits("2", "18")));
        expect(res.saleToken).to.eq(ZERO_ADDRESS);
        await expect(tx)
          .to.emit(instanceMarket, "EditOffer")
          .withArgs(user2.address, 0, ethers.utils.parseUnits("2", "18"), ZERO_ADDRESS);
      });
      it("fail: trying to edit a non-existent offer", async function () {
        const { user2, instanceMarket } = await loadFixture(standardPrepare);

        await expect(
          instanceMarket
            .connect(user2)
            .editOffer(0, ethers.utils.parseUnits("2", "18"), ZERO_ADDRESS)
        ).to.be.revertedWithCustomError(instanceMarket, "NotActiveOffer");
      });
      it("fail: attempt to edit the offer by user1", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);
        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          0,
          100000
        );
        await expect(
          instanceMarket
            .connect(user1)
            .editOffer(0, ethers.utils.parseUnits("2", "18"), ZERO_ADDRESS)
        ).to.be.revertedWithCustomError(instanceMarket, "OnlyOwner");
      });
      it("fail: attempt to edit the offer with zero price", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);
        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          0,
          100000
        );
        await expect(
          instanceMarket.connect(user2).editOffer(0, 0, ZERO_ADDRESS)
        ).to.be.revertedWithCustomError(instanceMarket, "OnlyPositivePrice");
      });
      it("fail: attempt to edit the offer with unsupported sale token", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);
        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          0,
          100000
        );
        await expect(
          instanceMarket
            .connect(user2)
            .editOffer(0, ethers.utils.parseUnits("2", "18"), instance721.address)
        ).to.be.revertedWithCustomError(instanceMarket, "UnsupportedSaleToken");
      });
    });
    describe("Accept offer", function () {
      it("success: user1 accept offer with token", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          1,
          1000000
        );

        await instance20.connect(user1).approve(instanceMarket.address, 1000000);
        expect(await instance721.ownerOf(1)).to.eq(user2.address);
        const tx = await instanceMarket.connect(user1).acceptOffer(0);

        await expect(tx).to.changeTokenBalances(
          instance20,
          [user2, instanceMarket, user1],
          [900000, 100000, -1000000]
        );

        expect(await instance721.ownerOf(1)).to.eq(user1.address);

        await expect(tx)
          .to.emit(instanceMarket, "AcceptOffer")
          .withArgs(user1.address, 0);
      });
      it("success: user1 accept offer with Ether", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          ZERO_ADDRESS,
          1,
          ethers.utils.parseUnits("1", "18")
        );

        expect(await instance721.ownerOf(1)).to.eq(user2.address);
        const tx = await instanceMarket
          .connect(user1)
          .acceptOffer(0, { value: ethers.utils.parseUnits("1", "18") });

        await expect(tx).to.changeEtherBalances(
          [user2, instanceMarket, user1],
          [
            BigInt(ethers.utils.parseUnits("9", "17")),
            BigInt(ethers.utils.parseUnits("1", "17")),
            -BigInt(ethers.utils.parseUnits("1", "18")),
          ]
        );

        expect(await instance721.ownerOf(1)).to.eq(user1.address);

        await expect(tx)
          .to.emit(instanceMarket, "AcceptOffer")
          .withArgs(user1.address, 0);
      });
      it("fail: trying to accept a non-existent offer", async function () {
        const { user1, instanceMarket } = await loadFixture(standardPrepare);

        await expect(
          instanceMarket.connect(user1).acceptOffer(0)
        ).to.be.revertedWithCustomError(instanceMarket, "NotActiveOffer");
      });
      it("fail: attempt to edit the offer by owner of NFT", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);
        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          0,
          100000
        );
        await expect(
          instanceMarket.connect(user2).acceptOffer(0)
        ).to.be.revertedWithCustomError(instanceMarket, "ExceptOwner");
      });
      it("fail: user1 accept offer 1 with token & ether", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          1,
          100000
        );

        await expect(
          instanceMarket.connect(user1).acceptOffer(0, { value: 100000 })
        ).to.be.revertedWithCustomError(instanceMarket, "WithoutEther");
      });
      it("fail: user1 accepts offer with Ether but doesn't send it", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          ZERO_ADDRESS,
          1,
          1000000
        );

        await expect(
          instanceMarket.connect(user1).acceptOffer(0)
        ).to.be.revertedWithCustomError(instanceMarket, "InvalidPrice");
      });
    });
    describe("Withdraw market fee", function () {
      it("success: withdraw all ETH", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          ZERO_ADDRESS,
          0,
          ethers.utils.parseUnits("1", "18")
        );

        await acceptOffer(
          user1,
          ZERO_ADDRESS,
          instanceMarket,
          0,
          ethers.utils.parseUnits("1", "18")
        );
        const tx = await instanceMarket.connect(owner).unlockETH();

        await expect(tx).to.changeEtherBalances(
          [instanceMarket, owner],
          [
            -BigInt(ethers.utils.parseUnits("1", "17")),
            BigInt(ethers.utils.parseUnits("1", "17")),
          ]
        );
        await expect(tx)
          .to.emit(instanceMarket, "Withdraw")
          .withArgs(ZERO_ADDRESS, ethers.utils.parseUnits("1", "17"));
      });
      it("success: withdraw all tokens", async function () {
        const { owner, user1, user2, instance721, instance20, instanceMarket } =
          await loadFixture(standardPrepare);

        await createOffer(
          owner,
          user1,
          user2,
          instanceMarket,
          instance20,
          instance721,
          instance20.address,
          1,
          1000000
        );

        await acceptOffer(user1, instance20, instanceMarket, 0, 1000000);

        const tx = await instanceMarket.connect(owner).unlockTokens(instance20.address);
        await expect(tx).to.changeTokenBalances(
          instance20,
          [instanceMarket, owner],
          [-100000, 100000]
        );
        await expect(tx)
          .to.emit(instanceMarket, "Withdraw")
          .withArgs(instance20.address, 100000);
      });
      it("fail: zero balance ETH", async function () {
        const { owner, instanceMarket } = await loadFixture(standardPrepare);
        await expect(
          instanceMarket.connect(owner).unlockETH()
        ).to.be.revertedWithCustomError(instanceMarket, "ZeroBalance");
      });
      it("fail: zero balance in token", async function () {
        const { owner, instanceMarket, instance20 } = await loadFixture(standardPrepare);
        await expect(
          instanceMarket.connect(owner).unlockTokens(instance20.address)
        ).to.be.revertedWithCustomError(instanceMarket, "ZeroBalance");
      });
    });
  });
});
