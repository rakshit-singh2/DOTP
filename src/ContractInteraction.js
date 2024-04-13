import React, { useState } from 'react';
const {Web3} = require('web3');

const ContractInteraction = () => {
    const [username, setUsername] = useState('');
    const [otpSeed, setOtpSeed] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [account, setAccount] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [web3, setWeb3] = useState(null);
    const contractAddress = '0xD9247941DE162F12ECC2b24Ce49E777e982E816b';  
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "username",
                    "type": "string"
                }
            ],
            "name": "generateOTP",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "username",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "otpSeed",
                    "type": "uint256"
                }
            ],
            "name": "registerUser",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "username",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "otp",
                    "type": "uint256"
                }
            ],
            "name": "authenticate",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "username",
                    "type": "string"
                }
            ],
            "name": "getOTP",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ] ;
 
    console.log(web3)
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                await setWeb3(new Web3(window.ethereum));
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
                setIsConnected(true);

                window.ethereum.on('accountsChanged', (newAccounts) => {
                    setAccount(newAccounts[0]);
                });
            } catch (error) {

            }
        }
    };

    const registerUser = async () => {
        try {
            const txObject = {
                from: account,
                to: contractAddress,
                gas: 500000,
                data: web3.eth.abi.encodeFunctionCall({
                    name: 'registerUser',
                    type: 'function',
                    inputs: [{ type: 'string', name: 'username' }, { type: 'uint256', name: 'otpSeed' }]
                }, [username, otpSeed])
            };
            
            const tx = await web3.eth.sendTransaction(txObject);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const otp = await contract.methods.getOTP(username).call({ from: account });
            setMessage(`User ${username} registered successfully.OTP is ${otp}`);
        } catch (error) {
            console.error('Error registering user:', error);
            setMessage('Error registering user');
        }
    };

    const generateOTP = async () => {
        try {
            const txObject = {
                from: account,
                to: contractAddress,
                gas: 500000,
                data: web3.eth.abi.encodeFunctionCall({
                    name: 'generateOTP',
                    type: 'function',
                    inputs: [{ type: 'string', name: 'username' }]
                }, [username])
            };
            
            const tx = await web3.eth.sendTransaction(txObject);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const otp = await contract.methods.getOTP(username).call({ from: account });
            setMessage(`OTP is ${otp}`);
        } catch (error) {
            console.error('Error generating OTP:', error);
            setMessage('Error generating OTP');
        }
    };

    const authenticate = async () => {
        try {
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const isValid = await contract.methods.authenticate(username, otp).call({ from: account });
            setMessage(`Authentication status: ${isValid}`);
        } catch (error) {
            console.error('Error authenticating user:', error);
            setMessage('Error authenticating user');
        }
    };

    return (
        <div>
            {/* Connect Wallet Button */}
            {!isConnected && (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}

            {/* Existing form */}
            {isConnected && (
                <div>
                    <div>
                        <label>Username: </label>
                        <input type="text" onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div>
                        <label>OTP Seed: </label>
                        <input type="text" onChange={e => setOtpSeed(e.target.value)} />
                    </div>

                    <button onClick={registerUser}>Register User</button>
                    <button onClick={generateOTP}>Generate OTP</button>

                    <div>
                        <label>OTP: </label>
                        <input type="text" value={otp} readOnly />
                    </div>

                    <div>
                        <label>Enter OTP for Authentication: </label>
                        <input type="text" onChange={e => setOtp(e.target.value)} />
                    </div>

                    <button onClick={authenticate}>Authenticate</button>
                </div>
            )}

            <div>
                <p>{message}</p>
            </div>
        </div>
    );
}

export default ContractInteraction;
