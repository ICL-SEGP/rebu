#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*; 
use anchor_spl::{ 
    token_interface::{ Mint, TokenAccount, TokenInterface }, 
    associated_token::AssociatedToken,
};

use crate::{ ProductListing, RebuError };

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct ModifyListing<'info> {

    /// Affiliate
    #[account(mut)]
    seller: Signer<'info>,

    /// Rebu mint
    #[account(mut)]
    mint: InterfaceAccount<'info, Mint>,

    /// ATA of seller 
    #[account(
        associated_token::mint = mint,
        associated_token::authority = seller,
    )] 
    seller_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        has_one = seller,
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

pub fn modify_product_listing(ctx: Context<ModifyListing>, _id: u64, stock: u64, price: u64) -> Result<()> {
    msg!("(Modified) Got to this point, stock: {}, price: {}", stock, price);
    require!(stock > 0 && price > 0, RebuError::InvalidListing);

    let product_listing = &mut ctx.accounts.product_listing;

    product_listing.stock = stock;
    product_listing.price = price;
    Ok(())
}
