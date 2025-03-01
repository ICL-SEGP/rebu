#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::{ ProductListing, ProductPurchase, ANCHOR_DISCRIMINATOR, RebuError };

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CompletePurchase<'info> {

    /// Affiliate
    #[account(mut)]
    signer: Signer<'info>,

    /// Rebu mint
    #[account(mut)]
    mint: InterfaceAccount<'info, Mint>,

    seller: SystemAccount<'info>,

    /// ATA of seller 
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = seller,
    )] 
    seller_ata: InterfaceAccount<'info, TokenAccount>,

    customer: SystemAccount<'info>,

    /// ATA of customer 
    #[account(
        mut,
        constraint = customer_ata.owner == customer.key(),
        constraint = customer_ata.mint == mint.key()
    )] 
    customer_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"product".as_ref(), b"listing".as_ref(), 
            seller.key().as_ref(), 
            id.to_le_bytes().as_ref()
        ],
        bump = product_listing.bump,
        close = seller,
    )]
    product_listing: Account<'info, ProductListing>,

    #[account(
        init, 
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + ProductPurchase::INIT_SPACE,
        seeds = [
            b"product".as_ref(), b"purchase".as_ref(), 
            seller.key().as_ref(), 
            id.to_le_bytes().as_ref(),
            customer.key().as_ref()
        ],
        bump,
    )]
    product_purchase: Account<'info, ProductPurchase>,

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
}

pub fn decrement_stock(ctx: &mut Context<CompletePurchase>) -> Result<()> {
    require!(ctx.accounts.product_listing.stock > 0, RebuError::OutOfStock);

    let product_listing = &mut ctx.accounts.product_listing;
    product_listing.stock -= 1;

    if product_listing.stock == 0 {
        todo!("create cancel cpi");
    }


    Ok(())
}

pub fn transfer_tokens(_ctx: &Context<CompletePurchase>) -> Result<()> {
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
    Ok(())
}

pub fn save_purchase(_ctx: &Context<CompletePurchase>) -> Result<()> {
    Ok(())
}


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
