// SPDX-License-Identifier: MIT
pragma solidity >=0.5.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTLabStore is ERC721URIStorage, ERC721Enumerable {
    struct NFTLab {
        string cid;
        string metadataCid;
    }

    struct NFTTransaction {
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 timestamp;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => NFTLab) private _nfts;
    mapping(string => uint256) private _hashToId;
    mapping(uint256 => NFTTransaction[]) private _history;

    event Minted(address artist, string hash, string metadata);
    event Transferred(
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 timestamp
    );

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return
            ERC721Enumerable.supportsInterface(interfaceId) ||
            ERC721.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._beforeTokenTransfer(from, to, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function mint(NFTLab memory nft) public {
        require(_hashToId[nft.cid] == 0, "Token already exists");

        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, nft.cid);

        _nfts[newTokenId] = nft;
        _hashToId[nft.cid] = newTokenId;

        NFTTransaction memory transaction = NFTTransaction({
            tokenId: newTokenId,
            seller: address(0),
            buyer: msg.sender,
            timestamp: block.timestamp
        });

        _history[newTokenId].push(transaction);

        emit Minted(msg.sender, nft.cid, nft.metadataCid);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        super.safeTransferFrom(from, to, tokenId);

        NFTTransaction memory transaction = NFTTransaction({
            tokenId: tokenId,
            seller: msg.sender,
            buyer: to,
            timestamp: block.timestamp
        });

        _history[tokenId].push(transaction);

        emit Transferred(tokenId, msg.sender, to, block.timestamp);
    }

    function getHistory(uint256 tokenId)
        public
        view
        returns (NFTTransaction[] memory)
    {
        require(
            _exists(tokenId),
            "Unable to get the history of a non-existent NFT."
        );

        return _history[tokenId];
    }

    function getTokenId(string memory hash) public view returns (uint256) {
        require(
            _hashToId[hash] != 0,
            "Unable to get the ID of a non-existent NFT."
        );
        return _hashToId[hash];
    }

    function getNFTByHash(string memory hash)
        public
        view
        returns (NFTLab memory)
    {
        require(_hashToId[hash] != 0, "Unable to get a non-existent NFT.");

        return _nfts[_hashToId[hash]];
    }

    function getNFTById(uint256 id) public view returns (NFTLab memory) {
        require(_exists(id), "Unable to get a non-existent NFT.");

        return _nfts[id];
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://cloudflare-ipfs.com/ipfs/";
    }
}
