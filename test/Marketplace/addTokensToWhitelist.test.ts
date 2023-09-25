import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken, MyToken721, Marketplace } from "../../types/typechain-types";
import { ZERO_ADDRESS } from "../utils/constants";
import { ContractTransaction } from "ethers";
import { standardPrepare } from "@test-utils";

describe("Method: addTokensToWhitelist", () => {
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let myToken20: MyToken;
  let myToken721: MyToken721;
  let marketplace: Marketplace;
  let result: ContractTransaction;
  let arrayOfWhitelistedTokens: string[];
  const arrayOfSpecific = [false, false, true];

  before(async () => {
    const deploy = await loadFixture(standardPrepare);
    owner = deploy.owner;
    buyer = deploy.buyer;
    marketplace = deploy.marketplace;
    myToken20 = deploy.myToken20;
    myToken721 = deploy.myToken721;
    arrayOfWhitelistedTokens = [myToken20.address, ZERO_ADDRESS, myToken721.address];
  });

  describe("When one of parameters is incorrect", () => {
    it("When caller not admin", async () => {
      const adminRole = await marketplace.ADMIN_ROLE();

      await expect(
        marketplace
          .connect(buyer)
          .addTokensToWhitelist(arrayOfWhitelistedTokens, arrayOfSpecific)
      ).to.be.revertedWith(
        `AccessControl: account ${buyer.address.toLowerCase()} is missing role ${adminRole}`
      );
    });

    it("When arrays are not the same length", async () => {
      await expect(
        marketplace
          .connect(owner)
          .addTokensToWhitelist(
            [myToken20.address, myToken721.address],
            [false, true, false]
          )
      ).to.be.revertedWithCustomError(marketplace, "UnequalLength");
    });
  });

  describe("When all parameters correct", () => {
    before(async () => {
      result = await marketplace
        .connect(owner)
        .addTokensToWhitelist(arrayOfWhitelistedTokens, arrayOfSpecific);
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should return supported tokens", async () => {
      const arrayOfERC20 = await marketplace.getWhitelistedTokens(false);
      const arrayOfERC721 = await marketplace.getWhitelistedTokens(true);

      expect(arrayOfERC20.length).to.eq(2);
      expect(arrayOfERC721.length).to.eq(1);
    });

    it("should emit AddToWhiteList event", async () => {
      await expect(result)
        .to.emit(marketplace, "AddToWhiteList")
        .withArgs(arrayOfWhitelistedTokens, arrayOfSpecific);
    });
  });
});
