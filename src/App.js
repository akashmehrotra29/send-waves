import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  // Just a state variable we use to store our user's public wallet.
  const [currentAccount, setCurrentAccount] = useState("");
  const [mode, setMode] = useState("light");
  const [allWaves, setAllWaves] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const contractAddress = "0x3Bc3A766fbf71700FA4e0389A6244e9936f624C7";
  const contractABI = abi.abi;

  const getAllWaves = async () => { 
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Call the getAllWaves method from your Smart Contract
        const waves = await wavePortalContract.getAllWaves();
        
        // picking out address, timestamp, and message for our UI 
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
  
        // Store data in React State
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      // First make sure we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    setInputMessage("");
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
        // Execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave(inputMessage, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const toggleMode = () => {
    setMode((prev) => prev === "light" ? "dark": "light");
  }

  // This runs our function when the page loads due to empty dependency array.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [allWaves])

  return (
    <div className={`${mode}`}>
      <button onClick={toggleMode}>{mode=== "light" ? "dark mode" : "light mode"}</button>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
          👋 Hey there!
          </div>

          <div className="bio">
            I am akash and I like to explore technologies out there. Connect your Ethereum wallet and wave at me with your favourite article, book name, newsletter or any other resource. 
          </div>

          <input placeholder="your wave message" value={inputMessage} onChange={(e)=>setInputMessage(e.target.value)}/>

          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
          
          {/*
          * If there is no currentAccount render this button
          */}
          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}

          {allWaves.map((wave, index) => {
            return (
              <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>)
          })}
        </div>
      </div>
    </div>
  );
}

export default App