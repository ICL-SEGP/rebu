#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token_interface::{Mint, TokenAccount, TokenInterface},
// };

#[derive(Accounts)]
pub struct CompletePurchase {

    // pub affiliate: Signer<'info>,

    // #[account(
    //     mut,
    //     seeds = ["escrow6".as_bytes(), escrow.authority.as_ref()],
    //     bump = escrow.bump,
    // )]
    // pub escrow: Account<'info, Escrow>,

    // #[account(mut, constraint = escrowed_tokens.key() == escrow.escrowed_tokens)]
    // pub escrowed_tokens: Account<'info, TokenAccount>,

    // #[account(mut, constraint = affiliate_tokens.mint == escrowed_tokens.mint)]
    // pub affiliate_tokens: Account<'info, TokenAccount>,

    // pub token_program: Program<'info, Token>,
}

pub fn withdraw_tokens(_ctx: &Context<CompletePurchase>) -> Result<()> {
    Ok(())
}

pub fn finalize_purchase(_ctx: Context<CompletePurchase>) -> Result<()>{
    // // transfer escrowd_x_token to buyer
    // anchor_spl::token::transfer(
    //     CpiContext::new_with_signer(
    //         ctx.accounts.token_program.to_account_info(),
    //         anchor_spl::token::Transfer {
    //             from: ctx.accounts.escrowed_x_tokens.to_account_info(),
    //             to: ctx.accounts.buyer_x_tokens.to_account_info(),
    //             authority: ctx.accounts.escrow.to_account_info(),
    //         },
    //         &[&["escrow6".as_bytes(), ctx.accounts.escrow.authority.as_ref(), &[ctx.accounts.escrow.bump]]],
    //     ),
    //     ctx.accounts.escrowed_x_tokens.amount,
    // )?;

    // // transfer buyer's y_token to seller
    // anchor_spl::token::transfer(
    //     CpiContext::new(
    //         ctx.accounts.token_program.to_account_info(),
    //         anchor_spl::token::Transfer {
    //             from: ctx.accounts.buyer_y_tokens.to_account_info(),
    //             to: ctx.accounts.sellers_y_tokens.to_account_info(),
    //             authority: ctx.accounts.buyer.to_account_info(),
    //         },
    //     ),
    //     ctx.accounts.escrow.y_amount,
    // )?;

    Ok(())
}