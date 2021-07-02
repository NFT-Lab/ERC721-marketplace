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

    /**
     * @dev redirect to {ERC721Enumerable-supportsInterface} and
     * {ERC721URIStorage-supportsInterface}
     */
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

    /**
     * @dev redirect to {ERC721Enumerable-_beforeTokenTransfer}
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev redirect to {ERC721URIStorage-tokenURI}
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function _recordHistory(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        NFTTransaction memory transaction = NFTTransaction({
            tokenId: tokenId,
            seller: from,
            buyer: to,
            timestamp: block.timestamp
        });

        _history[tokenId].push(transaction);
    }

    /**
     * @dev mints an NFT out of thin air for the msg.sender, the msg
     * sender is now the owner of that NFT .
     * @param nft the struct describing the NFT, See
     * {xref-NFTLabStore-NFTLab} for reference
     */
    function mint(address to, NFTLab memory nft) public {
        require(_hashToId[nft.cid] == 0, "Token already exists");

        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, nft.cid);

        _nfts[newTokenId] = nft;
        _hashToId[nft.cid] = newTokenId;

        _recordHistory(address(0), to, newTokenId);

        emit Minted(to, nft.cid, nft.metadataCid);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        super.safeTransferFrom(from, to, tokenId);

        _recordHistory(from, to, tokenId);

        emit Transferred(tokenId, from, to, block.timestamp);
    }

    /**
     * @dev returns the history of an NFT, so all the transactions he
     * went trough
     * @param tokenId the tokenId of wich you want the history
     */
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

    /**
     * @dev returns the tokenId of an NFT with the provided cid,
     * reverts if no NFT has that cid
     * @param cid the ipfs content id of the NFT
     */
    function getTokenId(string memory cid) public view returns (uint256) {
        require(
            _hashToId[cid] != 0,
            "Unable to get the ID of a non-existent NFT."
        );
        return _hashToId[cid];
    }

    /**
     * @dev returns the whole NFT with the provided cid reverts if no
     * NFT has that cid
     * @param cid the ipfs content id of the NFT
     */
    function getNFTByHash(string memory cid)
        public
        view
        returns (NFTLab memory)
    {
        require(_hashToId[cid] != 0, "Unable to get a non-existent NFT.");

        return _nfts[_hashToId[cid]];
    }

    /**
     * @dev returns the whole NFT with the provided id reverts if no
     * NFT has that id
     * @param id the tokenId of the NFT
     */
    function getNFTById(uint256 id) public view returns (NFTLab memory) {
        require(_exists(id), "Unable to get a non-existent NFT.");

        return _nfts[id];
    }

    /**
     * @dev the base uri of nfts, gives access directly to ipfs
     */
    function _baseURI() internal pure override returns (string memory) {
        return "https://cloudflare-ipfs.com/ipfs/";
    }
}
