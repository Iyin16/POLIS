// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PolisAgentNFT
 * @notice ERC-721 contract for minting POLIS agents as sovereign on-chain identities.
 * 
 * Each agent NFT represents a persistent identity snapshot with:
 * - Agent name
 * - Ideology
 * - Faction
 * - Influence snapshot
 * - Creation turn
 * - Metadata URI (off-chain JSON)
 */

contract PolisAgentNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct AgentNFTData {
        string agentName;
        string ideology;
        string faction;
        uint256 influenceSnapshot;
        uint256 createdTurn;
        string metadataURI;
    }

    mapping(uint256 => AgentNFTData) public agentData;
    mapping(string => uint256) public agentIdToTokenId;

    event AgentMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string agentName,
        string faction,
        uint256 influenceSnapshot
    );

    event AgentSnapshotUpdated(
        uint256 indexed tokenId,
        uint256 newInfluence,
        string newFaction
    );

    /**
     * @dev Initialize contract with name and symbol
     */
    constructor() ERC721("PolisAgentNFT", "POLIS") {}

    /**
     * @notice Mint a new agent NFT
     * @param to Address to mint the NFT to
     * @param polisAgentId Off-chain POLIS agent ID for tracking
     * @param data Agent data snapshot
     */
    function mintAgentNFT(
        address to,
        string memory polisAgentId,
        AgentNFTData memory data
    ) public onlyOwner returns (uint256) {
        require(bytes(data.agentName).length > 0, "Agent name required");
        require(bytes(data.faction).length > 0, "Faction required");
        require(to != address(0), "Invalid recipient");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, data.metadataURI);

        agentData[tokenId] = data;
        agentIdToTokenId[polisAgentId] = tokenId;

        emit AgentMinted(
            tokenId,
            to,
            data.agentName,
            data.faction,
            data.influenceSnapshot
        );

        return tokenId;
    }

    /**
     * @notice Get agent data for a token ID
     */
    function getAgentData(uint256 tokenId)
        public
        view
        returns (AgentNFTData memory)
    {
        require(_exists(tokenId), "Token does not exist");
        return agentData[tokenId];
    }

    /**
     * @notice Update agent influence and faction snapshot
     * @dev Only owner can call this to reflect simulation state changes
     */
    function updateAgentSnapshot(
        uint256 tokenId,
        uint256 newInfluence,
        string memory newFaction
    ) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(bytes(newFaction).length > 0, "Faction required");

        agentData[tokenId].influenceSnapshot = newInfluence;
        agentData[tokenId].faction = newFaction;

        emit AgentSnapshotUpdated(tokenId, newInfluence, newFaction);
    }

    /**
     * @notice Get token ID for a POLIS agent ID
     */
    function getTokenIdForAgent(string memory polisAgentId)
        public
        view
        returns (uint256)
    {
        return agentIdToTokenId[polisAgentId];
    }

    /**
     * @notice Get total number of agents minted
     */
    function totalAgentsMinted() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // ========== ERC721 Overrides ==========

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
