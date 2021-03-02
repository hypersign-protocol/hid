# HID

- Solidity version: `0.6.2`
- Node version: `v13.12.0`
- Truffle Version: `v5.2.0`

## Run local blockchain

```
ganache-cli -m <mnemonics>
```

## setup

```
npm i
```

## compile
```
truffle compile
```

## Deploy

### Developement 
```
truffle migrate --network development
```

### Ropsten

```
INFURA_KEY=<your_infura_project_key> truffle migrate --network ropsten
```

## Test

```
truffle test
```

## Deployed Contract

- At Ropsten @2021-03-02: [0x163f294318d7f38590191304a2e0a7cee6fbf92a](https://ropsten.etherscan.io/address/0x163f294318d7f38590191304a2e0a7cee6fbf92a#code)