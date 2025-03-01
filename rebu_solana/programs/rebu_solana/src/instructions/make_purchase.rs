#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*; 
use anchor_spl::{ 
    token_interface::{ Mint, TokenAccount, TokenInterface }, 
    // associated_token::AssociatedToken,
};

use crate::{ ANCHOR_DISCRIMINATOR, ProductListing, RebuError };

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct AddListing<'info> {

    /// Affiliate
    #[account(mut)]
    signer: Signer<'info>,

    /// Rebu mint
    #[account(mut)]
    mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    seller: SystemAccount<'info>,

    /// ATA of seller 
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = seller,
    )] 
    seller_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init, 
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + ProductListing::INIT_SPACE,
        seeds = [
            b"product".as_ref(), b"listing".as_ref(), 
            seller.key().as_ref(), 
            id.to_le_bytes().as_ref()
        ],
        bump,
    )]
    product_listing: Account<'info, ProductListing>,

    // associated_token_program: Program<'info, AssociatedToken>,
    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
}

pub fn save_listing(ctx: Context<AddListing>, id: u64, stock: u64, price: u64) -> Result<()> {
    require!(stock > 0 && price > 0, RebuError::InvalidListing);

    ctx.accounts.product_listing.set_inner(
        ProductListing {
            seller: ctx.accounts.seller.key(),
            mint: ctx.accounts.mint.key(),
            id,
            stock,
            price,
            bump: ctx.bumps.product_listing,
        });
    Ok(())
}
