use anchor_lang::prelude::*;

use anchor_spl::{
    token::Token,
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::Escrow;

#[derive(Accounts)]
pub struct MakePurchase<'info> {

    /// `seller`, who is willing to sell his token_x for token_y
    #[account(mut)]
    user: Signer<'info>,

    /// Token x mint for ex. USDC
    mint: Account<'info, Mint>,

    /// ATA of x_mint 
    #[account(mut, constraint = user_token.mint == mint.key() && user_token.owner == seller.key())] 
    user_token: Account<'info, TokenAccount>,

    #[account(
        init, 
        payer = user,
        space=Escrow::LEN,
        seeds = ["escrow6".as_bytes(), user.key().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        init,
        payer = user,
        token::mint = mint,
        token::authority = escrow,
    )]
    escrowed_tokens: Account<'info, TokenAccount>,

    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
    system_program: Program<'info, System>,
}


pub fn send_tokens_to_escrow(ctx: &Context<Initialize>, x_amount: u64, y_amount: u64) -> Result<()> {
    Ok(())
}

pub fn save_purchase(ctx: Context<Initialize>, x_amount: u64, y_amount: u64) -> Result<()> {
    // let escrow = &mut ctx.accounts.escrow;
    // escrow.bump = ctx.bumps.escrow;
    // escrow.authority = ctx.accounts.seller.key();
    // escrow.escrowed_x_tokens = ctx.accounts.escrowed_x_tokens.key();
    // escrow.y_amount = y_amount; // number of token sellers wants in exchange
    // escrow.y_mint = ctx.accounts.y_mint.key(); // token seller wants in exchange

    // // Transfer seller's x_token in program owned escrow token account
    // anchor_spl::token::transfer(
    //     CpiContext::new(
    //         ctx.accounts.token_program.to_account_info(),
    //         anchor_spl::token::Transfer {
    //             from: ctx.accounts.seller_x_token.to_account_info(),
    //             to: ctx.accounts.escrowed_x_tokens.to_account_info(),
    //             authority: ctx.accounts.seller.to_account_info(),
    //         },
    //     ),
    //     x_amount,
    // )?;

    Ok(())
}
