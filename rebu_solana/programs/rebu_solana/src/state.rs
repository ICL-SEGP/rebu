use anchor_lang::prelude::*;

#[account]
pub struct Offer {
    pub id: u64,
    pub authority: Pubkey,
    pub escrowed_tokens: Pubkey,
    pub product_id: u64,
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 32 + 8;
}
