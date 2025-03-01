#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

use anchor_spl::token_interface::{ 
    self, Mint, TokenAccount, 
    TokenInterface, TransferChecked
};

use crate::{ ProductListing, ProductPurchase, ANCHOR_DISCRIMINATOR, RebuError };

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CompletePurchase<'info> {

    /// Customer
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

pub fn decrement_stock(ctx: &mut Context<CompletePurchase>, _id: u64) -> Result<()> {
    require!(ctx.accounts.product_listing.stock > 0, RebuError::OutOfStock);

    let product_listing = &mut ctx.accounts.product_listing;
    product_listing.stock -= 1;

    if product_listing.stock == 0 {
        product_listing.close(ctx.accounts.seller.to_account_info())?;
    }
    msg!("Stock decreased");
    Ok(())
}

pub fn transfer_tokens(ctx: &Context<CompletePurchase>, _id: u64) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.customer_ata.to_account_info().clone(),
        mint: ctx.accounts.mint.to_account_info().clone(),
        to: ctx.accounts.seller_ata.to_account_info().clone(),
        authority: ctx.accounts.signer.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    let amount = ctx.accounts.product_listing.price;
    token_interface::transfer_checked(cpi_context, amount, ctx.accounts.mint.decimals)?;
    msg!("Tokens transfered");
    Ok(())
}

pub fn save_purchase(ctx: Context<CompletePurchase>, _id: u64) -> Result<()> {
    ctx.accounts.product_purchase.set_inner(
        ProductPurchase {
            seller: ctx.accounts.seller.key(),
            customer: ctx.accounts.customer.key(),
            product_id: ctx.accounts.product_listing.id,
            bump: ctx.bumps.product_purchase,
        });

    msg!("Purchase saved");
    Ok(())
}
