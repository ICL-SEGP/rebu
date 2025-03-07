#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod constants;
pub mod error;

pub use instructions::*;
pub use state::*;
pub use constants::*;
pub use error::*;


declare_id!("5b8N346ZbwB3PbpYthoUTLtrdw9qpbKue52S1bDCBter");

#[program]
pub mod rebu_solana {
    use super::*;

    pub fn create_token(ctx: Context<CreateToken>, uri: String) -> Result<()> {
        instructions::rebu_mint::create_rebu_mint::init_mint(ctx, uri)
    }

    pub fn mint_rebu_to(ctx: Context<MintRebuTo>, amount: u64) -> Result<()> {
        instructions::rebu_mint::mint_rebu::mint_rebu(&ctx, amount)?;
        instructions::rebu_mint::mint_rebu::deposit_sol(ctx, amount)
    } 

    pub fn burn_rebu(ctx: Context<BurnRebu>, amount: u64) -> Result<()> {
        instructions::rebu_mint::burn_rebu::burn_tokens(&ctx, amount)?;
        instructions::rebu_mint::burn_rebu::withdraw_sol(ctx, amount)
    } 

    pub fn add_listing(ctx: Context<AddListing>, id: u64, stock: u64, price: u64) -> Result<()> {
        instructions::make_listing::add_product_listing(ctx, id, stock, price)
    }

    pub fn modify_listing(ctx: Context<ModifyListing>, id: u64, stock: u64, price: u64) -> Result<()> {
        instructions::modify_listing::modify_product_listing(ctx, id, stock, price)
    }

    pub fn make_purchase(ctx: Context<MakePurchase>, id: u64) -> Result<()> {
        instructions::make_purchase::transfer_tokens(&ctx, id)?;
        instructions::make_purchase::save_purchase(ctx, id)
    }

    pub fn verify_purchase(ctx: Context<VerifyPurchase>, id: u64) -> Result<()> {
        instructions::verify_purchase::verify_and_close(ctx, id)
    }
}
