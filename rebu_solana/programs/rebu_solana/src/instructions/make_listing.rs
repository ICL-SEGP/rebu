#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*; 
use anchor_spl::{ 
    token_interface::{ Mint, TokenAccount, TokenInterface }, 
    associated_token::AssociatedToken,
};

use crate::{ ANCHOR_DISCRIMINATOR, ProductListing, RebuError };

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct AddListing<'info> {

    /// Affiliate
    #[account(mut)]
    seller: Signer<'info>,

    /// Rebu mint
    #[account(
        mut,
        // address = 
    )]
    mint: InterfaceAccount<'info, Mint>,

    /// ATA of seller 
    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = mint,
        associated_token::authority = seller,
    )] 
    seller_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init, 
        payer = seller,
        space = ANCHOR_DISCRIMINATOR + ProductListing::INIT_SPACE,
        // has_one = seller,
        seeds = [
            b"product".as_ref(), b"listing".as_ref(), 
            seller.key().as_ref(), 
            id.to_le_bytes().as_ref()
        ],
        bump,
    )]
    product_listing: Account<'info, ProductListing>,

    associated_token_program: Program<'info, AssociatedToken>,
    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
}

pub fn add_product_listing(ctx: Context<AddListing>, id: u64, stock: u64, price: f64) -> Result<()> {
    msg!("Got to this point, stock: {}, price: {}", stock, price);
    require!(stock > 0 && price > 0.0, RebuError::InvalidListing);

    ctx.accounts.product_listing.set_inner(
        ProductListing {
            seller: ctx.accounts.seller.key(),
            mint: ctx.accounts.mint.key(),
            id,
            stock,
            price: price * 10u64.pow(ctx.accounts.mint.decimals as u32) as f64,
            bump: ctx.bumps.product_listing,
        });
    Ok(())
}
