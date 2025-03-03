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


declare_id!("BhitfXGo3bXsyF5AXQhvnSM28u2tqUkbGabtFPBdoYJc");

#[program]
pub mod rebu_solana {
    use super::*;

    pub fn add_listing(ctx: Context<AddListing>, id: u64, stock: u64, price: u64) -> Result<()> {
        instructions::make_purchase::save_listing(ctx, id, stock, price)
    }

    pub fn complete_purchase(mut ctx: Context<CompletePurchase>, id: u64) -> Result<()> {
        instructions::complete_purchase::decrement_stock(&mut ctx, id)?;
        instructions::complete_purchase::transfer_tokens(&ctx, id)?;
        instructions::complete_purchase::save_purchase(ctx, id)
    }

    pub fn verify_purchase(ctx: Context<VerifyPurchase>, id: u64) -> Result<()> {
        instructions::verify_purchase::verify_and_close(ctx, id)
    }
}
