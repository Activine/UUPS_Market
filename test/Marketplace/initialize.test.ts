import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Marketplace, Marketplace__factory } from "../../types/typechain-types";
import { Contract } from "ethers";

describe("Method: initialize", () => {
  let deployer: SignerWithAddress;
  let MarketplaceInstance: Marketplace__factory;
  let MarketplaceBeacon: Contract;
  let marketplace: Marketplace;

  before(async () => {
    [deployer] = await ethers.getSigners();

    MarketplaceInstance = await ethers.getContractFactory("Marketplace");
    MarketplaceBeacon = await upgrades.deployBeacon(MarketplaceInstance);
    marketplace = (await upgrades.deployBeaconProxy(
      MarketplaceBeacon,
      MarketplaceInstance,
      []
    )) as Marketplace;
  });

  describe("When all parameters correct", () => {
    it("should be deployed", () => {
      expect(marketplace.address).to.be.properAddress;
    });

    it("should admin get DEFAULT_ADMIN_ROLE", async () => {
      const defaultAdminRole = await marketplace.DEFAULT_ADMIN_ROLE();
      const roleStatus = await marketplace.hasRole(defaultAdminRole, deployer.address);

      expect(roleStatus).to.true;
    });

    it("should admin get ADMIN_ROLE", async () => {
      const adminRole = await marketplace.ADMIN_ROLE();
      const roleStatus = await marketplace.hasRole(adminRole, deployer.address);

      expect(roleStatus).to.true;
    });

    it("should admin get MINTER_ROLE", async () => {
      const minterRole = await marketplace.MINTER_ROLE();
      const roleStatus = await marketplace.hasRole(minterRole, deployer.address);

      expect(roleStatus).to.true;
    });

    it("should admin get UPGRADER_ROLE", async () => {
      const upgraderRole = await marketplace.UPGRADER_ROLE();
      const roleStatus = await marketplace.hasRole(upgraderRole, deployer.address);

      expect(roleStatus).to.true;
    });
  });
});
