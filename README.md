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
MNEMONIC=<Your seed phrase> INFURA_API_KEY=<Your Infura project key> truffle migrate --network ropsten truffle migrate --network ropsten
```


### Mainnet

```bash
truffle migrate --network mainnet
```

## Testing

```bash
truffle test
```

### Report

![img](./others/test_report_03022021.png)


## Deployed Contract

- At Ropsten @2021-03-02: [0x163f294318d7f38590191304a2e0a7cee6fbf92a](https://ropsten.etherscan.io/address/0x163f294318d7f38590191304a2e0a7cee6fbf92a#code)
