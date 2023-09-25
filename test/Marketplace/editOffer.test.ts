import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken, MyToken721, Marketplace } from "../../types/typechain-types";
import { ZERO_ADDRESS } from "../utils/constants";
import { ContractTransaction } from "ethers";
import { standardPrepare, createOffer } from "@test-utils";

describe("Method: editOffer", () => {
  async function deployMarketplace() {
    const deploy = await standardPrepare();

    await createOffer(
      deploy.owner,
      deploy.buyer,
      deploy.seller,
      deploy.marketplace,
      deploy.myToken20,
      deploy.myToken721,
      deploy.myToken20.address,
      0,
      100_000_000
    );

    return {
      ...deploy,
    };
  }

  describe("When one of parameters is incorrect", () => {
    it("When editing not active offer", async () => {
      const { seller, myToken20, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(seller).editOffer(1, 100_000, myToken20.address)
      ).to.be.revertedWithCustomError(marketplace, "NotActiveOffer");
    });

    it("When editing by a non-owner", async () => {
      const { buyer, myToken20, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(buyer).editOffer(0, 100_000, myToken20.address)
      ).to.be.revertedWithCustomError(marketplace, "NotAnOwner");
    });

    it("When editing with zero price", async () => {
      const { seller, myToken20, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(seller).editOffer(0, 0, myToken20.address)
      ).to.be.revertedWithCustomError(marketplace, "OnlyPositivePrice");
    });

    it("When editing with unsupported sale token", async () => {
      const { seller, myToken721, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(seller).editOffer(0, 100_000_000, myToken721.address)
      ).to.be.revertedWithCustomError(marketplace, "UnsupportedSaleToken");
    });
  });

  describe("When all parameters correct", () => {
    let seller: SignerWithAddress;
    let myToken20: MyToken;
    let myToken721: MyToken721;
    let marketplace: Marketplace;
    let resultOne: ContractTransaction;
    let resultTwo: ContractTransaction;
    const price = 100_000_000_000;

    before(async () => {
      const { ...res } = await loadFixture(deployMarketplace);
      seller = res.seller;
      myToken20 = res.myToken20;
      myToken721 = res.myToken721;
      marketplace = res.marketplace;

      await myToken721.connect(seller).approve(marketplace.address, 1);

      await marketplace
        .connect(seller)
        .createOffer(myToken721.address, 1, ZERO_ADDRESS, price);

      resultOne = await marketplace.connect(seller).editOffer(0, price, ZERO_ADDRESS);
      await resultOne.wait();

      resultTwo = await marketplace
        .connect(seller)
        .editOffer(1, price, myToken20.address);
      await resultTwo.wait();
    });

    describe("When changing the payment to ETH", () => {
      it("should not reverted", async () => {
        await expect(resultOne).to.be.not.reverted;
      });

      it("should edit offer", async () => {
        const info = await marketplace.getOfferInfo(0);

        expect(info.creator).to.eq(seller.address);
        expect(info.price).to.eq(price);
        expect(info.token).to.eq(myToken721.address);
        expect(info.tokenId).to.eq(0);
        expect(info.saleToken).to.eq(ZERO_ADDRESS);

        expect(await marketplace.isOfferActive(0)).to.eq(true);
        expect(await myToken721.ownerOf(0)).to.eq(seller.address);
      });

      it("should emit EditOffer event", async () => {
        await expect(resultOne)
          .to.emit(marketplace, "EditOffer")
          .withArgs(seller.address, 0, price, ZERO_ADDRESS);
      });
    });

    describe("When changing the payment to token in whitelist", () => {
      it("should not reverted", async () => {
        await expect(resultTwo).to.be.not.reverted;
      });

      it("should edit offer", async () => {
        const info = await marketplace.getOfferInfo(1);

        expect(info.creator).to.eq(seller.address);
        expect(info.price).to.eq(price);
        expect(info.token).to.eq(myToken721.address);
        expect(info.tokenId).to.eq(1);
        expect(info.saleToken).to.eq(myToken20.address);

        expect(await marketplace.isOfferActive(1)).to.eq(true);
        expect(await myToken721.ownerOf(1)).to.eq(seller.address);
      });

      it("should emit EditOffer event", async () => {
        await expect(resultTwo)
          .to.emit(marketplace, "EditOffer")
          .withArgs(seller.address, 1, price, myToken20.address);
      });
    });
  });
});
