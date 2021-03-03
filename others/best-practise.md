> Avoid a floating pragma version

(`i.e pragma solidity ^0.6.2` or `version >=0.6.2`) instead specidy pragram version without using the caret symbol, i.e `pragma solidity 0.6.2;`


> Use natspec comment

Solidity contracts can use a special form of comments to provide rich documentation for functions, return variables and more. This special form is named the Ethereum Natural Language Specification Format (NatSpec).

- Note: a public state variable is equivalent to a function for the purposes of NatSpec.
- For Solidity you may choose `///` for single or multi-line comments, or `/**` and ending with `*/`.

--- 

- [Natspec](https://docs.soliditylang.org/en/latest/natspec-format.html)
- [Smart contract best practise](https://consensys.github.io/)smart-contract-best-practices/
- [Known attacks](https://consensys.github.io/smart-contract-best-practices/known_attacks/) 