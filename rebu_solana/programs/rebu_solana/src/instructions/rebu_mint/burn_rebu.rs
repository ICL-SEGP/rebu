use anchor_lang::prelude::*;

use anchor_lang::{
    system_program::{Transfer, transfer },
    solana_program::native_token::LAMPORTS_PER_SOL,
};

use anchor_spl::token_interface::{ 
        burn, Burn, Mint, TokenAccount, 
        TokenInterface,
        
};

#[derive(Accounts)]
pub struct BurnRebu<'info> {
    #[account(mut)]
    signer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"rebu123".as_ref(),
            b"mint".as_ref(),
            ],
        bump,
    )]
    mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"rebu123".as_ref(),
            b"vault".as_ref(),
        ],
        bump,
    )]
    vault: SystemAccount<'info>,    

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
}


pub fn burn_tokens(ctx: &Context<BurnRebu>, amount: f64) -> Result<()> {
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = Burn {
        mint: ctx.accounts.mint.to_account_info(),
        from: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };
    let signer_seeds: &[&[&[u8]]] = &[&[b"rebu123".as_ref(), b"mint".as_ref(), &[ctx.bumps.mint]]];

    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
    burn(cpi_ctx, (amount * (10u64.pow(ctx.accounts.mint.decimals as u32) as f64)) as u64)?;
    Ok(())
}

pub fn withdraw_sol(ctx: Context<BurnRebu>, amount: f64) -> Result<()> {
    let discounted_amount = 0.5 * amount;
    let lamports_amount = discounted_amount * (LAMPORTS_PER_SOL / 100) as f64;

    let transfer_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.signer.to_account_info()
    };

    let seeds = &[b"rebu123".as_ref(), b"vault".as_ref(), &[ctx.bumps.vault]];

    let pda_signer = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        transfer_accounts,
        pda_signer
    );
    transfer(transfer_ctx, lamports_amount as u64)?;
    Ok(())
}
