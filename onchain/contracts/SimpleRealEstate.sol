// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleRealEstate {
    struct Listing {
        address payable seller;
        uint256 price;        // in wei
        string  image;        // URL or IPFS hash
        string  title;        // "2BHK in Pune"
        string  location_;    // "Wakad, Pune"
        bool    sold;
        address buyer;
    }

    Listing[] private listings;

    event Listed(uint256 indexed id, address indexed seller, uint256 price);
    event Purchased(uint256 indexed id, address indexed buyer, uint256 price);

    // Create a listing
    function list(
        uint256 priceWei,
        string calldata image,
        string calldata title,
        string calldata location_
    ) external returns (uint256 id) {
        require(priceWei > 0, "price=0");
        listings.push(Listing(payable(msg.sender), priceWei, image, title, location_, false, address(0)));
        id = listings.length - 1;
        emit Listed(id, msg.sender, priceWei);
    }

    // Anyone can read a listing
    function get(uint256 id) external view returns (
        address seller,
        uint256 price,
        string memory image,
        string memory title,
        string memory location_,
        bool sold,
        address buyer
    ) {
        Listing storage l = listings[id];
        return (l.seller, l.price, l.image, l.title, l.location_, l.sold, l.buyer);
    }

    function total() external view returns (uint256) { return listings.length; }

    // Buy the property at fixed price (direct payout to seller)
    function buy(uint256 id) external payable {
        Listing storage l = listings[id];
        require(!l.sold, "sold");
        require(msg.value == l.price, "price mismatch");
        l.sold = true;
        l.buyer = msg.sender;

        // minimal reentrancy protection: state change before transfer + call pattern
        (bool ok, ) = l.seller.call{value: msg.value}("");
        require(ok, "payout failed");

        emit Purchased(id, msg.sender, msg.value);
    }
}
