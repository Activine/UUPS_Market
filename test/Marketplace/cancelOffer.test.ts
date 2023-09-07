import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken721, Marketplace } from "../../types/typechain-types";
import { ContractTransaction } from "ethers";
import { standardPrepare, createOffer } from "@test-utils";

describe("Method: cancelOffer", () => {
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
    it("When canceling not active offer", async () => {
      const { seller, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(seller).cancelOffer(1)
      ).to.be.revertedWithCustomError(marketplace, "NotActiveOffer");
    });

    it("When canceled by a non-owner", async () => {
      const { buyer, marketplace } = await loadFixture(deployMarketplace);

      await expect(
        marketplace.connect(buyer).cancelOffer(0)
      ).to.be.revertedWithCustomError(marketplace, "NotAnOwner");
    });
  });

  describe("When all parameters correct", () => {
    let seller: SignerWithAddress;
    let myToken721: MyToken721;
    let marketplace: Marketplace;
    let result: ContractTransaction;

    before(async () => {
      const { ...res } = await loadFixture(deployMarketplace);
      seller = res.seller;
      myToken721 = res.myToken721;
      marketplace = res.marketplace;

      result = await marketplace.connect(seller).cancelOffer(0);
      await result.wait();
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should cancel offer", async () => {
      expect(await marketplace.isOfferActive(0)).to.eq(false);
      expect(await myToken721.ownerOf(0)).to.eq(seller.address);
    });

    it("should emit OfferCanceled event", async () => {
      await expect(result)
        .to.emit(marketplace, "OfferCanceled")
        .withArgs(seller.address, 0);
    });
  });
});
