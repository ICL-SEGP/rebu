#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{ 
        self, Mint, TokenAccount, 
        TokenInterface, TransferChecked,
    },
};

use crate::{ ProductListing, PurchaseReceipt, ANCHOR_DISCRIMINATOR, RebuError };

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct MakePurchase<'info> {

    /// Customer
    #[account(mut)]
    customer: Signer<'info>,

    /// Rebu mint
    #[account(mut)]
    mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    seller: SystemAccount<'info>,

    /// ATA of seller 
    #[account(
        mut,
        // associated_token::mint = mint,
        // associated_token::authority = seller,
    )] 
    seller_ata: InterfaceAccount<'info, TokenAccount>,

    /// ATA of customer 
    #[account(
        mut
        // associated_token::mint = mint,
        // associated_token::authority = customer,
    )] 
    customer_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        // has_one = seller,
        seeds = [
            b"product".as_ref(), b"listing".as_ref(), 
            seller.key().as_ref(), 
            id.to_le_bytes().as_ref()
        ],
        bump = product_listing.bump,
    )]
    product_listing: Account<'info, ProductListing>,

    #[account(
        init, 
        payer = customer,
        space = ANCHOR_DISCRIMINATOR + PurchaseReceipt::INIT_SPACE,
        // has_one = customer,
        seeds = [
            b"product".as_ref(), b"purchase".as_ref(),
            seller.key().as_ref(),
            id.to_le_bytes().as_ref(),
            customer.key().as_ref()
        ],
        bump,
    )]
    product_purchase: Account<'info, PurchaseReceipt>, // TODO

    associated_token_program: Program<'info, AssociatedToken>,
    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
}

pub fn decrement_stock(ctx: Context<MakePurchase>, _id: u64) -> Result<()> {
    require!(ctx.accounts.product_listing.stock > 0, RebuError::OutOfStock);

    let product_listing = &mut ctx.accounts.product_listing;
    product_listing.stock -= 1;

    // if product_listing.stock == 0 {
    //     product_listing.close(ctx.accounts.seller.to_account_info())?;
    // }
    msg!("Stock decreased");
    Ok(())
}

pub fn transfer_tokens(ctx: &Context<MakePurchase>, _id: u64) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.customer_ata.to_account_info().clone(),
        mint: ctx.accounts.mint.to_account_info().clone(),
        to: ctx.accounts.seller_ata.to_account_info().clone(),
        authority: ctx.accounts.customer.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    let amount = ctx.accounts.product_listing.price;
    token_interface::transfer_checked(cpi_context, amount, ctx.accounts.mint.decimals)?;
    msg!("Tokens transfered");
    Ok(())
}

pub fn save_purchase(ctx: Context<MakePurchase>, id: u64) -> Result<()> {
    ctx.accounts.product_purchase.set_inner(
        PurchaseReceipt {
            seller: ctx.accounts.seller.key(),
            customer: ctx.accounts.customer.key(),
            product_id: ctx.accounts.product_listing.id,
            bump: ctx.bumps.product_purchase,
        });
    decrement_stock(ctx, id)?;

    msg!("Purchase saved");
    Ok(())
}
