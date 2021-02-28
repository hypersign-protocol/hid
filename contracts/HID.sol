// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "./interface/IERC20.sol";

contract HID  is IERC20{
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    
    /// Optional Variables
    
    string public name;                   
    uint8 public decimals;                
    string public symbol;  
    uint256 public totalSupply;
    
    constructor(
        uint256 _totalSupply,
        string memory _tokenName,
        uint8 _decimals,
        string memory _tokenSymbol){
            balances[msg.sender] = _totalSupply;
            totalSupply = _totalSupply;
            name = _tokenName;
            symbol = _tokenSymbol;
            decimals = _decimals;
    }
    
    modifier checkBalance(address _balanceOf, uint256 _value){
        require(balances[_balanceOf] >= _value, 'Insufficient balance');
        _;
    }
    modifier checkAddress(address _addr){
        require(_addr == address(0), 'Invalid address');
        _;
    }
    
    function balanceOf(address _owner) 
    public 
    override
    view returns (uint256 balance){
        return balances[_owner];
    }
    
    function transfer(address _to, uint256 _value) 
    checkBalance(msg.sender, _value) 
    checkAddress(_to)
    public 
    override
    returns (bool success){
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) 
    checkBalance(_from, _value)
    checkAddress(_to)
    public 
    override
    returns (bool success) {
        require(allowed[_from][msg.sender] >= _value, 'You are not allowed to transfer');
        
        balances[_from] -= _value;
        balances[_to] += _value;
        allowed[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) 
    checkBalance(msg.sender, _value) 
    public 
    override
    returns (bool success){
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function allowance(address _owner, address _spender) 
    public 
    override
    view 
    returns (uint256 remaining){
        return allowed[_owner][_spender];
    }
    
}