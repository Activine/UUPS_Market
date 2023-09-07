import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken, MyToken721, Marketplace } from "../../types/typechain-types";
import { ZERO_ADDRESS } from "../utils/constants";
import { ContractTransaction } from "ethers";
import { standardPrepare } from "@test-utils";

describe("Method: removeTokensFromWhitelist", () => {
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let myToken20: MyToken;
  let myToken721: MyToken721;
  let marketplace: Marketplace;
  let resultOne: ContractTransaction;
  let resultTwo: ContractTransaction;
  let arrayOfWhitelistedTokens: string[];
  let arrayOfSpecific = [false, false, true];

  before(async () => {
    const deploy = await loadFixture(standardPrepare);
    owner = deploy.owner;
    buyer = deploy.buyer;
    marketplace = deploy.marketplace;
    myToken20 = deploy.myToken20;
    myToken721 = deploy.myToken721;
    arrayOfWhitelistedTokens = [myToken20.address, ZERO_ADDRESS, myToken721.address];

    await marketplace
      .connect(owner)
      .addTokensToWhitelist(arrayOfWhitelistedTokens, arrayOfSpecific);
  });

  describe("When one of parameters is incorrect", () => {
    it("When caller not admin", async () => {
      const adminRole = await marketplace.ADMIN_ROLE();
      await expect(
        marketplace.connect(buyer).removeTokensFromWhitelist([ZERO_ADDRESS], [false])
      ).to.be.revertedWith(
        `AccessControl: account ${buyer.address.toLowerCase()} is missing role ${adminRole}`
      );
    });

    it("When arrays are not the same length", async () => {
      await expect(
        marketplace
          .connect(owner)
          .removeTokensFromWhitelist(
            [myToken20.address, myToken721.address],
            [false, true, false]
          )
      ).to.be.revertedWithCustomError(marketplace, "UnequalLength");
    });
  });

  describe("When all parameters correct", () => {
    before(async () => {
      resultOne = await marketplace
        .connect(owner)
        .removeTokensFromWhitelist([ZERO_ADDRESS], [false]);

      resultTwo = await marketplace
        .connect(owner)
        .removeTokensFromWhitelist([myToken721.address], [true]);
    });

    it("should not reverted", async () => {
      await expect(resultOne).to.be.not.reverted;
      await expect(resultTwo).to.be.not.reverted;
    });

    it("should return supported sale tokens after removing", async () => {
      const arrayOfERC20 = await marketplace.getWhitelistedTokens(false);
      expect(arrayOfERC20.length).to.eq(1);
    });

    it("should return supported NFT tokens after removing", async () => {
      const arrayOfERC721 = await marketplace.getWhitelistedTokens(true);
      expect(arrayOfERC721.length).to.eq(0);
    });

    it("should emit RemoveFromWhiteList event", async () => {
      await expect(resultOne)
        .to.emit(marketplace, "RemoveFromWhiteList")
        .withArgs([ZERO_ADDRESS], [false]);
    });

    it("should emit RemoveFromWhiteList event", async () => {
      await expect(resultTwo)
        .to.emit(marketplace, "RemoveFromWhiteList")
        .withArgs([myToken721.address], [true]);
    });
  });
});
