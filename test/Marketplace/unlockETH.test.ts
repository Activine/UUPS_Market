import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Marketplace } from "../../types/typechain-types";
import { ContractTransaction } from "ethers";
import { ZERO_ADDRESS } from "../utils/constants";

import { standardPrepare, createOffer } from "@test-utils";

describe("Method: unlockETH", () => {
  let price: number = 100_000_000;
  let fee: number = 1000 // 1% = 100

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

    await deploy.marketplace.connect(deploy.buyer).acceptOffer(0, { value: price });
    return {
      ...deploy,
    };
  }

  describe("When conditions are incorrect", () => {
    it("When withdraw zero balance", async () => {
      const { owner, marketplace } = await loadFixture(standardPrepare);

      await expect(marketplace.connect(owner).unlockETH()).to.be.revertedWithCustomError(
        marketplace,
        "ZeroBalance"
      );
    });

    it("When withdrawing by a non-owner", async () => {
      const { seller, marketplace } = await loadFixture(standardPrepare);

      const adminRole = await marketplace.ADMIN_ROLE();
      await expect(marketplace.connect(seller).unlockETH()).to.be.revertedWith(
        `AccessControl: account ${seller.address.toLowerCase()} is missing role ${adminRole}`
      );
    });
  });

  describe("When conditions are correct", () => {
    let owner: SignerWithAddress;
    let marketplace: Marketplace;
    let result: ContractTransaction;

    before(async () => {
      const { ...res } = await loadFixture(deployMarketplace);
      owner = res.owner;
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
        [-(price * fee / 10000), (price * fee / 10000)]
      );
    });

    it("should emit Withdraw event", async () => {
      await expect(result)
        .to.emit(marketplace, "Withdraw")
        .withArgs(ZERO_ADDRESS, (price * fee / 10000));
    });
  });
});
