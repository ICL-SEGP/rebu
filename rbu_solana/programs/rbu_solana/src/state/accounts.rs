use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CustomerAccount {
    pub id: u64,
    pub rbu_balance: u64,
}


#[account]
#[derive(InitSpace)]
pub struct Redeem {
    pub id: u64,
    pub maker: PubKey,
    pub token_mint: PubKey,
    pub product_id: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Product {
    pub id: u64,
    #[max_len(32)]
    pub product_name: String,
    pub rbu_cost: u64,
}