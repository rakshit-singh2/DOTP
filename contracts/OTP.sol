// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TwoFactorAuth {
    
    struct User {
        address publicKey;
        uint256 otpSeed;
        uint256 lastGeneratedTime;
        uint256 nonce;
    }
    uint256 private randNonce = 0;
    mapping(string => User) private users; 


    function registerUser(string memory username, uint256 otpSeed) public returns (uint256) {
        require(users[username].publicKey == address(0), "User already exists");
        
        users[username].publicKey = msg.sender;
        users[username].otpSeed = otpSeed;       
        return generateOTP(username);
    }
    
    function generateOTP(string memory username) public returns (uint256) {
        uint currentTime = block.timestamp;
        require(users[username].publicKey != address(0), "User not registered");
        require(currentTime - users[username].lastGeneratedTime >= 120 seconds, "Wait for OTP expiration");
        users[username].lastGeneratedTime = currentTime;  
        randNonce++;
        users[username].nonce = randNonce;
        uint256 otp = uint256(keccak256(abi.encodePacked(users[username].lastGeneratedTime, msg.sender, users[username].nonce, users[username].otpSeed))) % 1000000;
        return otp; 
    }
    function getOTP(string memory username) public view returns  (uint256){
        uint currentTime = block.timestamp;
        require(users[username].publicKey == msg.sender, "Invalid public key");
        require(currentTime - users[username].lastGeneratedTime <= 150 seconds, "Otp Expired");
        return uint256(keccak256(abi.encodePacked(users[username].lastGeneratedTime, msg.sender, users[username].nonce, users[username].otpSeed))) % 1000000;
    }
    function authenticate(string memory username, uint256 otp) public view returns (bool) {
        require(users[username].publicKey != address(0), "User not registered");
        require(users[username].publicKey == msg.sender, "Invalid public key");
        uint256 generatedOTP = uint256(keccak256(abi.encodePacked(users[username].lastGeneratedTime, msg.sender, users[username].nonce, users[username].otpSeed))) % 1000000;
        require(generatedOTP == otp, "Invalid OTP");
        return true;
    }
}
