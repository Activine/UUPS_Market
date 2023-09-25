// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {AccessControlEnumerableUpgradeable, EnumerableSetUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import {CountersUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {SafeERC20Upgradeable, IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {IERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC721Upgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Marketplace is
    AccessControlEnumerableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE"); // Representing the admin role.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // Representing the minter role.
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE"); // Representing the upgrader role.
    bytes32 public constant OWNER_MARKETPLACE_ROLE = keccak256("OWNER_MARKETPLACE_ROLE"); // Representing the owner marketplace role.

    uint32 public constant TEN_PERCENTS = 1000; // 10%
    EnumerableSetUpgradeable.AddressSet private whitelistedTokens20; // Supported ERC20 tokens for sale.
    EnumerableSetUpgradeable.AddressSet private whitelistedTokens721; // Supported ERC721 tokens for sale.

    struct OfferData {
        address creator;
        uint256 price;
        address token;
        uint256 tokenId;
        address saleToken;
        bool active;
    }

    mapping(uint256 => OfferData) public offers; // offers structure info
    CountersUpgradeable.Counter internal _offersCounter; // offers counter

    uint256 public ethBalance; // eth balance on contract (like fee)
    mapping(address => uint256) public tokenBalances; // token balance on contract (like fee)

    error UnequalLength();
    error UnsupportedNFT();
    error UnsupportedSaleToken();
    error NotApproved();
    error NotActiveOffer();
    error ExceptOwner();
    error NotAnOwner();
    error InvalidPrice();
    error EtherNotSended();
    error OnlyPositivePrice();
    error ZeroBalance();
    error OfferNotExist();
    error WithoutEther();

    event CreatedOffer(
        uint256 offerId,
        address user,
        address token,
        uint256 tokenId,
        address saleToken
    );
    event OfferCanceled(address user, uint256 offerId);
    event EditOffer(address user, uint256 offerId, uint256 price, address saleToken);
    event AcceptOffer(address user, uint256 offerId);
    event AddToWhiteList(address[] tokens, bool[] specific);
    event RemoveFromWhiteList(address[] tokens, bool[] specific);
    event Withdraw(address token, uint256 amount);

    receive() external payable {}

    fallback() external payable {}

    /// @custom:oz-upgrades-unsafe-allow constructor
    // solhint-disable-next-line
    constructor() {
        _disableInitializers();
    }

    /**
     * Initializes the Marketplace contract with the specified parameters.
     */
    function initialize() public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    /**
     * @notice Adds addresses to the whitelist.
     * @param tokens Array of addresses.
     * @param tokensType Array of types.
     */
    function addTokensToWhitelist(
        address[] calldata tokens,
        bool[] calldata tokensType
    ) external onlyRole(ADMIN_ROLE) {
        if (tokens.length != tokensType.length) revert UnequalLength();
        for (uint256 i; i < tokens.length; ++i) {
            if (!tokensType[i]) {
                whitelistedTokens20.add(tokens[i]);
            } else {
                whitelistedTokens721.add(tokens[i]);
            }
        }
        emit AddToWhiteList(tokens, tokensType);
    }

    /**
     * @notice Removes addresses from the whitelist.
     * @param tokens Array of addresses.
     * @param tokensType Array of types.
     */
    function removeTokensFromWhitelist(
        address[] calldata tokens,
        bool[] calldata tokensType
    ) external onlyRole(ADMIN_ROLE) {
        if (tokens.length != tokensType.length) revert UnequalLength();
        for (uint256 i; i < tokens.length; ++i) {
            if (!tokensType[i]) {
                whitelistedTokens20.remove(tokens[i]);
            } else {
                whitelistedTokens721.remove(tokens[i]);
            }
        }
        emit RemoveFromWhiteList(tokens, tokensType);
    }

    /**
     * @notice Shows which addresses are on the whitelist.
     * @param tokenType Type of addresses
     */
    function getWhitelistedTokens(
        bool tokenType
    ) external view returns (address[] memory) {
        if (tokenType) {
            return whitelistedTokens721.values();
        } else {
            return whitelistedTokens20.values();
        }
    }

    /**
     * @notice Сhecks if the offer is active.
     * @param offerId Id of the offer.
     */
    function isOfferActive(uint256 offerId) public view returns (bool) {
        return offers[offerId].active;
    }

    /**
     * @notice Shows all info about offer.
     * @param offerId Id of the offer.
     */
    function getOfferInfo(uint256 offerId) public view returns (OfferData memory) {
        if (offerId > _offersCounter.current()) revert OfferNotExist();
        return offers[offerId];
    }

    /**
     * @notice Сreates the offer.
     * @param token Address of NFT token.
     * @param tokenId ID of NFT token.
     * @param saleToken Sale token address
     * @param price NFT price.
     */
    function createOffer(
        address token,
        uint256 tokenId,
        address saleToken,
        uint256 price
    ) external nonReentrant {
        if (!whitelistedTokens721.contains(token)) revert UnsupportedNFT();
        if (saleToken != address(0)) {
            if (!whitelistedTokens20.contains(saleToken)) revert UnsupportedSaleToken();
        }
        if (address(this) != IERC721Upgradeable(token).getApproved(tokenId))
            revert NotApproved();
        uint256 offerId = uint256(_offersCounter.current());
        offers[offerId] = OfferData(msg.sender, price, token, tokenId, saleToken, true);
        _offersCounter.increment();
        emit CreatedOffer(offerId, msg.sender, token, tokenId, saleToken);
    }

    /**
     * @notice Accept the offer.
     * @param offerId Id of the offer.
     */
    function acceptOffer(uint256 offerId) external payable nonReentrant {
        if (!isOfferActive(offerId)) revert NotActiveOffer();
        if (offers[offerId].creator == msg.sender) revert ExceptOwner();

        OfferData memory data = offers[offerId];
        // uint256 amount = offers[offerId].price;
        // address token = offers[offerId].token;
        // uint256 tokenId = offers[offerId].tokenId;
        // address saleToken = offers[offerId].saleToken;
        // address creator = offers[offerId].creator;
        offers[offerId].active = false;

        if (data.saleToken != address(0)) {
            if (msg.value != 0) revert WithoutEther();
            uint256 platformFee = (data.price * TEN_PERCENTS) / 10000;
            tokenBalances[data.saleToken] += platformFee;
            IERC20Upgradeable(data.saleToken).safeTransferFrom(
                msg.sender,
                address(this),
                platformFee
            );
            IERC20Upgradeable(data.saleToken).safeTransferFrom(
                msg.sender,
                data.creator,
                data.price - platformFee
            );
        } else {
            if (data.price != msg.value) revert InvalidPrice();
            uint256 feeValue = (data.price * TEN_PERCENTS) / 10000;
            ethBalance += feeValue;
            (bool sentFee, ) = payable(address(this)).call{value: feeValue}("");
            if (!sentFee) revert EtherNotSended();
            (bool sent, ) = payable(data.creator).call{value: msg.value - feeValue}("");
            if (!sent) revert EtherNotSended();
        }
        IERC721Upgradeable(data.token).safeTransferFrom(
            data.creator,
            msg.sender,
            data.tokenId,
            bytes("")
        );
        emit AcceptOffer(msg.sender, offerId);
    }

    /**
     * @notice Cancel the offer.
     * @param id Id of the offer.
     */
    function cancelOffer(uint256 id) external nonReentrant {
        if (!isOfferActive(id)) revert NotActiveOffer();
        if (offers[id].creator != msg.sender) revert NotAnOwner();
        offers[id].active = false;
        emit OfferCanceled(msg.sender, id);
    }

    /**
     * @notice Edit the offer.
     * @param offerId Id of the offer.
     * @param price New selling price for the NFT.
     * @param saleToken New selling currency for NFT.
     */
    function editOffer(
        uint256 offerId,
        uint256 price,
        address saleToken
    ) external nonReentrant {
        if (!isOfferActive(offerId)) revert NotActiveOffer();
        if (offers[offerId].creator != msg.sender) revert NotAnOwner();
        if (price == 0) revert OnlyPositivePrice();
        offers[offerId].price = price;
        if (saleToken == address(0)) {
            offers[offerId].saleToken = saleToken;
        } else {
            if (!whitelistedTokens20.contains(saleToken)) revert UnsupportedSaleToken();
            offers[offerId].saleToken = saleToken;
        }
        emit EditOffer(msg.sender, offerId, price, saleToken);
    }

    /**
     * @notice Withdraw Ether from the contract to the owner.
     */
    function unlockETH() external onlyRole(ADMIN_ROLE) {
        uint256 amount = ethBalance;
        if (amount == 0) revert ZeroBalance();
        ethBalance = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) revert EtherNotSended();
        emit Withdraw(address(0), amount);
    }

    /**
     * Withdraw token from the contract to the owner.
     * @param tokenAddress Token Address.
     */
    function unlockTokens(IERC20Upgradeable tokenAddress) external onlyRole(ADMIN_ROLE) {
        uint256 amount = tokenBalances[address(tokenAddress)];
        if (amount == 0) revert ZeroBalance();
        tokenBalances[address(tokenAddress)] = 0;
        tokenAddress.safeTransfer(msg.sender, amount);
        emit Withdraw(address(tokenAddress), amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {} // solhint-disable-line no-empty-blocks

    // solhint-disable-next-line
    uint256[100] __gap;
}
