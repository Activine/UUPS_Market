import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken721, Marketplace, MyToken } from "../../types/typechain-types";
import { ContractTransaction } from "ethers";
import { standardPrepare, createOffer } from "@test-utils";

describe("Method: unlockTokens", () => {
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

    await deploy.myToken20
      .connect(deploy.buyer)
      .approve(deploy.marketplace.address, 100_000_000);
    await deploy.marketplace.connect(deploy.buyer).acceptOffer(0);
    return {
      ...deploy,
    };
  }

  describe("When conditions are incorrect", () => {
    it("When withdraw zero balance", async () => {
      const { owner, marketplace, myToken20 } = await loadFixture(standardPrepare);

      await expect(
        marketplace.connect(owner).unlockTokens(myToken20.address)
      ).to.be.revertedWithCustomError(marketplace, "ZeroBalance");
    });

    it("When withdrawing by a non-owner", async () => {
      const { seller, marketplace, myToken20 } = await loadFixture(standardPrepare);

      const adminRole = await marketplace.ADMIN_ROLE();
      await expect(
        marketplace.connect(seller).unlockTokens(myToken20.address)
      ).to.be.revertedWith(
        `AccessControl: account ${seller.address.toLowerCase()} is missing role ${adminRole}`
      );
    });
  });

  describe("When conditions are correct", () => {
    let owner: SignerWithAddress;
    let myToken20: MyToken;
    let marketplace: Marketplace;
    let result: ContractTransaction;

    before(async () => {
      const { ...res } = await loadFixture(deployMarketplace);
      owner = res.owner;
      myToken20 = res.myToken20;
      marketplace = res.marketplace;

      result = await marketplace.connect(owner).unlockTokens(myToken20.address);
      await result.wait();
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should withdraw token", async () => {
      await expect(result).to.changeTokenBalances(
        myToken20,
        [marketplace, owner],
        [-10_000_000, 10_000_000]
      );
    });

    it("should emit Withdraw event", async () => {
      await expect(result)
        .to.emit(marketplace, "Withdraw")
        .withArgs(myToken20.address, 10_000_000);
    });
  });
});
