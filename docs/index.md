# Solidity API

## Marketplace

### ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### UPGRADER_ROLE

```solidity
bytes32 UPGRADER_ROLE
```

### OWNER_MARKETPLACE_ROLE

```solidity
bytes32 OWNER_MARKETPLACE_ROLE
```

### TEN_PERCENTS

```solidity
uint32 TEN_PERCENTS
```

### OfferData

```solidity
struct OfferData {
  address creator;
  uint256 price;
  address token;
  uint256 tokenId;
  address saleToken;
  bool active;
}
```

### offers

```solidity
mapping(uint256 => struct Marketplace.OfferData) offers
```

### _offersCounter

```solidity
struct CountersUpgradeable.Counter _offersCounter
```

### ethBalance

```solidity
uint256 ethBalance
```

### tokenBalances

```solidity
mapping(address => uint256) tokenBalances
```

### UnequalLength

```solidity
error UnequalLength()
```

### UnsupportedNFT

```solidity
error UnsupportedNFT()
```

### UnsupportedSaleToken

```solidity
error UnsupportedSaleToken()
```

### NotApproved

```solidity
error NotApproved()
```

### NotActiveOffer

```solidity
error NotActiveOffer()
```

### ExceptOwner

```solidity
error ExceptOwner()
```

### NotAnOwner

```solidity
error NotAnOwner()
```

### InvalidPrice

```solidity
error InvalidPrice()
```

### EtherNotSended

```solidity
error EtherNotSended()
```

### OnlyPositivePrice

```solidity
error OnlyPositivePrice()
```

### ZeroBalance

```solidity
error ZeroBalance()
```

### OfferNotExist

```solidity
error OfferNotExist()
```

### WithoutEther

```solidity
error WithoutEther()
```

### CreatedOffer

```solidity
event CreatedOffer(uint256 offerId, address user, address token, uint256 tokenId, address saleToken)
```

### OfferCanceled

```solidity
event OfferCanceled(address user, uint256 offerId)
```

### EditOffer

```solidity
event EditOffer(address user, uint256 offerId, uint256 price, address saleToken)
```

### AcceptOffer

```solidity
event AcceptOffer(address user, uint256 offerId)
```

### AddToWhiteList

```solidity
event AddToWhiteList(address[] tokens, bool[] specific)
```

### RemoveFromWhiteList

```solidity
event RemoveFromWhiteList(address[] tokens, bool[] specific)
```

### Withdraw

```solidity
event Withdraw(address token, uint256 amount)
```

### receive

```solidity
receive() external payable
```

### fallback

```solidity
fallback() external payable
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize() public
```

Initializes the Marketplace contract with the specified parameters.

### addTokensToWhitelist

```solidity
function addTokensToWhitelist(address[] tokens, bool[] tokensType) external
```

Adds addresses to the whitelist.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokens | address[] | Array of addresses. |
| tokensType | bool[] | Array of types. |

### removeTokensFromWhitelist

```solidity
function removeTokensFromWhitelist(address[] tokens, bool[] tokensType) external
```

Removes addresses from the whitelist.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokens | address[] | Array of addresses. |
| tokensType | bool[] | Array of types. |

### getWhitelistedTokens

```solidity
function getWhitelistedTokens(bool tokenType) external view returns (address[])
```

Shows which addresses are on the whitelist.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenType | bool | Type of addresses |

### isOfferActive

```solidity
function isOfferActive(uint256 offerId) public view returns (bool)
```

Сhecks if the offer is active.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offerId | uint256 | Id of the offer. |

### getOfferInfo

```solidity
function getOfferInfo(uint256 offerId) public view returns (struct Marketplace.OfferData)
```

Shows all info about offer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offerId | uint256 | Id of the offer. |

### createOffer

```solidity
function createOffer(address token, uint256 tokenId, address saleToken, uint256 price) external
```

Сreates the offer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | Address of NFT token. |
| tokenId | uint256 | ID of NFT token. |
| saleToken | address | Sale token address |
| price | uint256 | NFT price. |

### acceptOffer

```solidity
function acceptOffer(uint256 offerId) external payable
```

Accept the offer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offerId | uint256 | Id of the offer. |

### cancelOffer

```solidity
function cancelOffer(uint256 id) external
```

Cancel the offer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | Id of the offer. |

### editOffer

```solidity
function editOffer(uint256 offerId, uint256 price, address saleToken) external
```

Edit the offer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offerId | uint256 | Id of the offer. |
| price | uint256 | New selling price for the NFT. |
| saleToken | address | New selling currency for NFT. |

### unlockETH

```solidity
function unlockETH() external
```

Withdraw Ether from the contract to the owner.

### unlockTokens

```solidity
function unlockTokens(contract IERC20Upgradeable tokenAddress) external
```

Withdraw token from the contract to the owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | contract IERC20Upgradeable | Token Address. |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
{upgradeTo} and {upgradeToAndCall}.

Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.

```solidity
function _authorizeUpgrade(address) internal override onlyOwner {}
```_

### __gap

```solidity
uint256[100] __gap
```

## MyToken

### PAUSER_ROLE

```solidity
bytes32 PAUSER_ROLE
```

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### UPGRADER_ROLE

```solidity
bytes32 UPGRADER_ROLE
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(string _name, string _symbol) public
```

### pause

```solidity
function pause() public
```

### unpause

```solidity
function unpause() public
```

### mint

```solidity
function mint(address to, uint256 amount) public
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
{upgradeTo} and {upgradeToAndCall}.

Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.

```solidity
function _authorizeUpgrade(address) internal override onlyOwner {}
```_

### __gap

```solidity
uint256[100] __gap
```

## MyTokenV2

### PAUSER_ROLE

```solidity
bytes32 PAUSER_ROLE
```

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### UPGRADER_ROLE

```solidity
bytes32 UPGRADER_ROLE
```

### constructor

```solidity
constructor() public
```

### pause

```solidity
function pause() public
```

### unpause

```solidity
function unpause() public
```

### mint2

```solidity
function mint2(address to, uint256 amount) public
```

### mint

```solidity
function mint(address to, uint256 amount) public
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
{upgradeTo} and {upgradeToAndCall}.

Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.

```solidity
function _authorizeUpgrade(address) internal override onlyOwner {}
```_

### __gap

```solidity
uint256[100] __gap
```

## MyToken721

### PAUSER_ROLE

```solidity
bytes32 PAUSER_ROLE
```

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### UPGRADER_ROLE

```solidity
bytes32 UPGRADER_ROLE
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(string name, string symbol) public
```

### pause

```solidity
function pause() public
```

### unpause

```solidity
function unpause() public
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId, string uri) public
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
{upgradeTo} and {upgradeToAndCall}.

Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.

```solidity
function _authorizeUpgrade(address) internal override onlyOwner {}
```_

### _burn

```solidity
function _burn(uint256 tokenId) internal
```

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view returns (string)
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

## MyToken721V2

### PAUSER_ROLE

```solidity
bytes32 PAUSER_ROLE
```

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### UPGRADER_ROLE

```solidity
bytes32 UPGRADER_ROLE
```

### constructor

```solidity
constructor() public
```

### pause

```solidity
function pause() public
```

### unpause

```solidity
function unpause() public
```

### safeMint

```solidity
function safeMint(address to, uint256 tokenId, string uri) public
```

### safeMint2

```solidity
function safeMint2(address to, uint256 tokenId, string uri) public
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
{upgradeTo} and {upgradeToAndCall}.

Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.

```solidity
function _authorizeUpgrade(address) internal override onlyOwner {}
```_

### _burn

```solidity
function _burn(uint256 tokenId) internal
```

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view returns (string)
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

