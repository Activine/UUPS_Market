import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken, MyToken721, Marketplace } from "../../types/typechain-types";
import { ZERO_ADDRESS } from "../utils/constants";
import { ContractTransaction } from "ethers";
import { standardPrepare, mintingForTests } from "@test-utils";

describe("Method: createOffer", () => {
  let arrayOfSpecific = [false, false, true];

  async function deployMarketplace() {
    const deploy = await standardPrepare();

    let arrayOfWhitelistedTokens = [
      deploy.myToken20.address,
      ZERO_ADDRESS,
      deploy.myToken721.address,
    ];

    await deploy.marketplace
      .connect(deploy.owner)
      .addTokensToWhitelist(arrayOfWhitelistedTokens, arrayOfSpecific);

    return {
      ...deploy,
      arrayOfSpecific,
      arrayOfWhitelistedTokens,
    };
  }

  describe("When one of parameters is incorrect", () => {
    it("When trying to sell unsupported NFT tokens", async () => {
      const { seller, myToken721, myToken20, marketplace } = await loadFixture(
        standardPrepare
      );

      await expect(
        marketplace
          .connect(seller)
          .createOffer(myToken721.address, 0, myToken20.address, 100000)
      ).to.be.revertedWithCustomError(marketplace, "UnsupportedNFT");
    });

    it("When trying to sell for unsupported tokens", async () => {
      const { seller, myToken721, marketplace } = await loadFixture(standardPrepare);

      await expect(
        marketplace
          .connect(seller)
          .createOffer(myToken721.address, 0, myToken721.address, 100000)
      ).to.be.revertedWithCustomError(marketplace, "UnsupportedNFT");
    });

    it("When trying to sell without approving", async () => {
      const { owner, buyer, seller, myToken721, myToken20, marketplace } =
        await loadFixture(standardPrepare);

      await mintingForTests(owner, buyer, seller, myToken20, myToken721);

      await marketplace
        .connect(owner)
        .addTokensToWhitelist(
          [myToken20.address, ZERO_ADDRESS, myToken721.address],
          arrayOfSpecific
        );

      await expect(
        marketplace
          .connect(seller)
          .createOffer(myToken721.address, 0, myToken20.address, 1000000)
      ).to.be.revertedWithCustomError(marketplace, "NotApproved");
    });
  });

  describe("When all parameters correct", () => {
    describe("When sale for ETH", () => {
      let owner: SignerWithAddress;
      let buyer: SignerWithAddress;
      let seller: SignerWithAddress;
      let myToken20: MyToken;
      let myToken721: MyToken721;
      let marketplace: Marketplace;
      let result: ContractTransaction;
      let price = 100_000_000;
      let tokenId = 0;

      before(async () => {
        const { ...res } = await loadFixture(deployMarketplace);
        owner = res.owner;
        buyer = res.buyer;
        seller = res.seller;
        myToken20 = res.myToken20;
        myToken721 = res.myToken721;
        marketplace = res.marketplace;

        await mintingForTests(owner, buyer, seller, myToken20, myToken721);
        await myToken721.connect(seller).approve(marketplace.address, tokenId);

        result = await marketplace
          .connect(seller)
          .createOffer(myToken721.address, tokenId, ZERO_ADDRESS, price);
        await result.wait();
      });

      it("should not reverted", async () => {
        await expect(result).to.be.not.reverted;
      });

      it("should create offer", async () => {
        let info = await marketplace.getOfferInfo(0);

        expect(info.creator).to.eq(seller.address);
        expect(info.price).to.eq(price);
        expect(info.token).to.eq(myToken721.address);
        expect(info.tokenId).to.eq(tokenId);
        expect(info.saleToken).to.eq(ZERO_ADDRESS);

        expect(await marketplace.isOfferActive(0)).to.eq(true);
        expect(await marketplace.isOfferActive(1)).to.eq(false);
        expect(await myToken721.ownerOf(0)).to.eq(seller.address);
      });

      it("should emit CreatedOffer event", async () => {
        await expect(result)
          .to.emit(marketplace, "CreatedOffer")
          .withArgs(0, seller.address, myToken721.address, 0, ZERO_ADDRESS);
      });
    });

    describe("When sale for token in whitelist", () => {
      let owner: SignerWithAddress;
      let buyer: SignerWithAddress;
      let seller: SignerWithAddress;
      let myToken20: MyToken;
      let myToken721: MyToken721;
      let marketplace: Marketplace;
      let result: ContractTransaction;
      let price = 100_000_000;
      let tokenId = 0;

      before(async () => {
        const { ...res } = await loadFixture(deployMarketplace);
        owner = res.owner;
        buyer = res.buyer;
        seller = res.seller;
        myToken20 = res.myToken20;
        myToken721 = res.myToken721;
        marketplace = res.marketplace;

        await mintingForTests(owner, buyer, seller, myToken20, myToken721);
        await myToken721.connect(seller).approve(marketplace.address, tokenId);

        result = await marketplace
          .connect(seller)
          .createOffer(myToken721.address, tokenId, myToken20.address, price);
        await result.wait();
      });

      it("should not reverted", async () => {
        await expect(result).to.be.not.reverted;
      });

      it("should create offer", async () => {
        let info = await marketplace.getOfferInfo(0);

        expect(info.creator).to.eq(seller.address);
        expect(info.price).to.eq(price);
        expect(info.token).to.eq(myToken721.address);
        expect(info.tokenId).to.eq(tokenId);
        expect(info.saleToken).to.eq(myToken20.address);

        expect(await marketplace.isOfferActive(0)).to.eq(true);
        expect(await marketplace.isOfferActive(1)).to.eq(false);
        expect(await myToken721.ownerOf(0)).to.eq(seller.address);
      });

      it("should emit CreatedOffer event", async () => {
        await expect(result)
          .to.emit(marketplace, "CreatedOffer")
          .withArgs(0, seller.address, myToken721.address, 0, myToken20.address);
      });
    });
  });
});
