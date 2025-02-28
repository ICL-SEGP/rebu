use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;


declare_id!("BhitfXGo3bXsyF5AXQhvnSM28u2tqUkbGabtFPBdoYJc");

#[program]
pub mod rebu_solana {
    use super::*;

    pub fn make_purchase(ctx: Context<MakePurchase>, x_amount: u64, y_amount: u64) -> Result<()> {
        instructions::make_purchase::send_tokens_to_escrow(&ctx, x_amount, y_amount)?;
        instructions::make_purchase::save_purchase(ctx, x_amount, y_amount)
    }

    pub fn complete_purchase(ctx: Context<CompletePurchase>) -> Result<()> {
        instructions::complete_purchase::withdraw_tokens(&ctx);
        instructions::complete_purchase::finalize_purchase(ctx)
    }
}
