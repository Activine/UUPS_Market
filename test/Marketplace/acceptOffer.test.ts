import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ZERO_ADDRESS } from "../utils/constants";
import { standardPrepare, createOffer } from "@test-utils";

describe("Method: acceptOffer", () => {
  const price = 100_000_000;
  const fee = 1000; // 1% = 100
  const amountFee = (price * fee) / 10000;

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
      price
    );

    await deploy.myToken721.connect(deploy.seller).approve(deploy.marketplace.address, 1);

    await deploy.marketplace
      .connect(deploy.seller)
      .createOffer(deploy.myToken721.address, 1, ZERO_ADDRESS, price);

    return {
      ...deploy,
    };
  }

  describe("When one of parameters is incorrect", () => {
    it("When accepting not active offer", async () => {
      const { buyer, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(buyer).acceptOffer(2)
      ).to.be.revertedWithCustomError(marketplace, "NotActiveOffer");
    });

    it("When accepting by owner of NFT", async () => {
      const { seller, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(seller).acceptOffer(0)
      ).to.be.revertedWithCustomError(marketplace, "ExceptOwner");
    });

    it("When buyer accept offer with token & ether", async () => {
      const { buyer, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(buyer).acceptOffer(0, { value: price })
      ).to.be.revertedWithCustomError(marketplace, "WithoutEther");
    });

    it("When accepts offer with Ether but doesn't send it", async () => {
      const { buyer, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(buyer).acceptOffer(1)
      ).to.be.revertedWithCustomError(marketplace, "InvalidPrice");
    });
  });

  describe("When all parameters correct", () => {
    it("When buyer accept offer with token", async () => {
      const { buyer, seller, myToken721, myToken20, marketplace } = await loadFixture(
        deployMarketplace
      );

      await myToken20.connect(buyer).approve(marketplace.address, price);

      expect(await myToken721.ownerOf(0)).to.eq(seller.address);

      const tx = await marketplace.connect(buyer).acceptOffer(0);

      await expect(tx).to.changeTokenBalances(
        myToken20,
        [seller, marketplace, buyer],
        [price - amountFee, amountFee, -price]
      );
      expect(await marketplace.isOfferActive(0)).to.eq(false);
      expect(await myToken721.ownerOf(0)).to.eq(buyer.address);
      await expect(tx).to.emit(marketplace, "AcceptOffer").withArgs(buyer.address, 0);
    });

    it("When buyer accept offer with ETH", async () => {
      const { buyer, seller, myToken721, marketplace } = await loadFixture(
        deployMarketplace
      );

      expect(await myToken721.ownerOf(1)).to.eq(seller.address);

      const tx = await marketplace.connect(buyer).acceptOffer(1, { value: price });

      await expect(tx).to.changeEtherBalances(
        [seller, marketplace, buyer],
        [price - amountFee, amountFee, -price]
      );
      expect(await marketplace.isOfferActive(1)).to.eq(false);
      expect(await myToken721.ownerOf(1)).to.eq(buyer.address);
      await expect(tx).to.emit(marketplace, "AcceptOffer").withArgs(buyer.address, 1);
    });
  });
});
