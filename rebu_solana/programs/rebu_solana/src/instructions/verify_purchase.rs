use anchor_lang::prelude::*;

use crate::ProductPurchase;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct VerifyPurchase<'info> {
    #[account(mut)]
    signer: Signer<'info>,

    #[account(mut)]
    customer: SystemAccount<'info>,

    #[account(
        mut, 
        seeds = [
            b"product".as_ref(), b"purchase".as_ref(), 
            signer.key().as_ref(), 
            id.to_le_bytes().as_ref(),
            customer.key().as_ref()
        ],
        bump = product_purchase.bump,
        close = signer
    )]
    product_purchase: Account<'info, ProductPurchase>,
}

pub fn verify_and_close(_ctx: Context<VerifyPurchase>, _id: u64) -> Result<()> {
    Ok(())
}