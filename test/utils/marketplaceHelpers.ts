import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MyToken, MyToken721, Marketplace } from "../../types/typechain-types";
import { BigNumber } from "ethers";

export async function standardPrepare() {
  const [owner, buyer, seller]: SignerWithAddress[] = await ethers.getSigners();

  const MyToken721Instance = await ethers.getContractFactory("MyToken721");
  const MyToken721Beacon = await upgrades.deployBeacon(MyToken721Instance);

  // this is proxy contract. All data is stored here.
  const myToken721 = (await upgrades.deployBeaconProxy(
    MyToken721Beacon,
    MyToken721Instance,
    ["MatrixNFT", "MTR"]
  )) as MyToken721;

  const MyToken20Instance = await ethers.getContractFactory("MyToken");
  const MyToken20Beacon = await upgrades.deployBeacon(MyToken20Instance);

  // this is proxy contract. All data is stored here.
  const myToken20 = (await upgrades.deployBeaconProxy(
    MyToken20Beacon,
    MyToken20Instance,
    ["MatrixToken", "MTR"]
  )) as MyToken;

  const MarketplaceInstance = await ethers.getContractFactory("Marketplace");
  const MarketplaceBeacon = await upgrades.deployBeacon(MarketplaceInstance);

  // this is proxy contract. All data is stored here.
  const marketplace = (await upgrades.deployBeaconProxy(
    MarketplaceBeacon,
    MarketplaceInstance,
    []
  )) as Marketplace;

  return {
    owner,
    buyer,
    seller,
    myToken721,
    myToken20,
    marketplace,
  };
}

export async function mintingForTests(
  owner: SignerWithAddress,
  buyer: SignerWithAddress,
  seller: SignerWithAddress,
  erc20: MyToken,
  erc721: MyToken721
) {
  await erc20.connect(owner).mint(buyer.address, 100_000_000);

  for (let i = 0; i < 3; i++) {
    await erc721.connect(owner).safeMint(seller.address, i, "someURI");
  }
}

export async function createOffer(
  owner: SignerWithAddress,
  buyer: SignerWithAddress,
  seller: SignerWithAddress,
  market: Marketplace,
  erc20: MyToken,
  erc721: MyToken721,
  sellerToken: string,
  id: number,
  amount: BigNumber | number
) {
  await mintingForTests(owner, buyer, seller, erc20, erc721);
  await market
    .connect(owner)
    .addTokensToWhitelist([erc20.address, erc721.address], [false, true]);
  await erc721.connect(seller).approve(market.address, id);
  await market.connect(seller).createOffer(erc721.address, id, sellerToken, amount);
}
