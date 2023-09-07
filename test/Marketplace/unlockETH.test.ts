import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken721, Marketplace, MyToken } from "../../types/typechain-types";
import { ContractTransaction } from "ethers";
import { ZERO_ADDRESS } from "../utils/constants";

import { standardPrepare, createOffer } from "@test-utils";

describe("Method: unlockETH", () => {
  async function deployMarketplace() {
    const deploy = await standardPrepare();

    await createOffer(
      deploy.owner,
      deploy.buyer,
      deploy.seller,
      deploy.marketplace,
      deploy.myToken20,
      deploy.myToken721,
      ZERO_ADDRESS,
      0,
      100_000_000
    );

    await deploy.marketplace.connect(deploy.buyer).acceptOffer(0, { value: 100_000_000 });
    return {
      ...deploy,
    };
  }

  describe("When conditions are incorrect", () => {
    it("When withdraw zero balance", async () => {
      const { owner, marketplace, myToken20 } = await loadFixture(standardPrepare);

      await expect(marketplace.connect(owner).unlockETH()).to.be.revertedWithCustomError(
        marketplace,
        "ZeroBalance"
      );
    });

    it("When withdrawing by a non-owner", async () => {
      const { seller, marketplace, myToken20 } = await loadFixture(standardPrepare);

      const adminRole = await marketplace.ADMIN_ROLE();
      await expect(marketplace.connect(seller).unlockETH()).to.be.revertedWith(
        `AccessControl: account ${seller.address.toLowerCase()} is missing role ${adminRole}`
      );
    });
  });

  describe("When conditions are correct", () => {
    let owner: SignerWithAddress;
    let seller: SignerWithAddress;
    let myToken20: MyToken;
    let myToken721: MyToken721;
    let marketplace: Marketplace;
    let result: ContractTransaction;

    before(async () => {
      const { ...res } = await loadFixture(deployMarketplace);
      owner = res.owner;
      seller = res.seller;
      myToken20 = res.myToken20;
      myToken721 = res.myToken721;
      marketplace = res.marketplace;

      result = await marketplace.connect(owner).unlockETH();
      await result.wait();
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should withdraw ETH", async () => {
      await expect(result).to.changeEtherBalances(
        [marketplace, owner],
        [-10_000_000, 10_000_000]
      );
    });

    it("should emit Withdraw event", async () => {
      await expect(result)
        .to.emit(marketplace, "Withdraw")
        .withArgs(ZERO_ADDRESS, 10_000_000);
    });
  });
});
