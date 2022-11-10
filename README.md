# Hypersign Identity Token (HID)

- Solidity version: `0.6.2`
- Node version: `v13.12.0`
- Truffle Version: `v5.2.0`

## Setup Project

### Private blockchain

```bash
sudo npm i ganache-cli -g   # Install ganachen
ganache-cli -m "alley correct gorilla file try tattoo garden horse life build reward code" -b 10  # Run private blockchain network
```

### Install Truffle

``bash
npm install -g truffle
```

### Setup repository

```bash
# clone repo
git clone https://github.com/Vishwas1/hid

# change dir
cd hid

# install required packages
npm i 
```

## Compilation

```bash
truffle compile
```

## Deployment

### Private Net

```bash
truffle migrate --network development
```

### TestNet: Ropsten

```bash
MNEMONIC=<Your seed phrase> INFURA_API_KEY=<Your Infura project key> truffle migrate --network ropsten 
```


MNEMONIC="alley correct gorilla file try tattoo garden horse life build reward code" INFURA_API_KEY="f15df5a5d6784e368ea34e80fc6613f8" truffle migrate --network sepolia 

### Mainnet

```bash
truffle migrate --network mainnet
```

## Testing

**Run all tests**

```bash
truffle test
```
**Run all tests and show events**

```bash
truffle test --show-events
```

**Run specific test**

```bash
truffle test <test_file_path> #  truffle test ./test/HIDSeedAndPrivateInvestors.test.js
```

### Report

![img](./others/test_report_03022021.png)


## Deployed Contract

- https://sepolia.etherscan.io/address/0xa4Ec847Ef7bE1E0FE53047Bf90c332da88474a3E
- https://sepolia.etherscan.io/address/0x801a3D204817390a318B2ff702D2958B90CBfB00#readContract


#