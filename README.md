# HID

- Solidity version: `0.6.2`
- Node version: `v13.12.0`
- Truffle Version: `v5.2.0`

## Setup Project

### Private blockchain

```
ganache-cli -m <mnemonics>  # Run private blockchain network
```

### Setup repository

```bash
# clone repo
git clone https://github.com/Vishwas1/hid

# change dir
cd hid

# install required packages
npm i 

# create file to store mnemonics
echo "<mnemonics>" > .secret 
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
INFURA_KEY=<your_infura_project_key> truffle migrate --network ropsten
```

## Testing

```bash
truffle test
```

### Report

![img](./others/test_report_03022021.png)


## Deployed Contract

- At Ropsten @2021-03-02: [0x163f294318d7f38590191304a2e0a7cee6fbf92a](https://ropsten.etherscan.io/address/0x163f294318d7f38590191304a2e0a7cee6fbf92a#code)