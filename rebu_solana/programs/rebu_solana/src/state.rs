use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ProductListing {
    pub seller: Pubkey,
    pub mint: Pubkey,
    pub id: u64,
    pub stock: u64,
    pub price: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ProductPurchase {
    pub seller: Pubkey,
    pub customer: Pubkey,
    pub product_id: u64,
    pub bump: u8,
}
