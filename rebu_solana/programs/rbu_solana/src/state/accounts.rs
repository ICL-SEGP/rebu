use anchor_lang::prelude::*;

#[account]
pub struct UserAccount {
    pub id: u64,
    pub deposited_rbu: u64,
}