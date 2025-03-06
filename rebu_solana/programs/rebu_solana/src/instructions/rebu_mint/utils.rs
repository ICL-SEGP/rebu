use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct TransferLamports<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account(mut)]
    recipient: SystemAccount<'info>,

    system_program: Program<'info, System>,
}

pub fn transfer_sol(ctx: Context<TransferLamports>, amount: u64) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            },
        ),
        amount,
    )?;

    Ok(())
}
