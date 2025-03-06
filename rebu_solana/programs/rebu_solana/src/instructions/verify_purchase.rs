use anchor_lang::prelude::*;

use crate::PurchaseReceipt;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct VerifyPurchase<'info> {
    #[account(mut)]
    seller: Signer<'info>,

    #[account(mut)]
    customer: SystemAccount<'info>,

    #[account(
        mut, 
        has_one = seller,
        owner = crate::ID,
        seeds = [
            b"product".as_ref(), b"purchase".as_ref(), 
            seller.key().as_ref(), 
            id.to_le_bytes().as_ref(),
            customer.key().as_ref()
        ],
        bump = product_purchase.bump,
        close = seller,
    )]
    product_purchase: Account<'info, PurchaseReceipt>,
}

pub fn verify_and_close(_ctx: Context<VerifyPurchase>, _id: u64) -> Result<()> {
    Ok(())
}