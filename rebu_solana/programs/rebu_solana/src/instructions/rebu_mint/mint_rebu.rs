use anchor_lang::prelude::*;

use anchor_lang::{
    system_program::{Transfer, transfer },
    solana_program::native_token::LAMPORTS_PER_SOL
};

use anchor_spl::{
    token_interface::{mint_to, Mint, MintTo, TokenInterface, TokenAccount},
};


#[derive(Accounts)]
pub struct MintRebuTo<'info> {
    #[account(mut)]
    signer: Signer<'info>,

    // Mint account address is a PDA
    #[account(
        mut,
        seeds = [b"rebu123".as_ref(), b"mint".as_ref()],
        bump,
    )]
    mint: InterfaceAccount<'info, Mint>,

    // Create Associated Token Account, if needed
    // This is the account that will hold the minted tokens
    #[account(
        mut,
        // init_if_needed,
        // payer = payer,
        // associated_token::mint = mint,
        // associated_token::authority = payer,
    )]
    recipient: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"rebu123".as_ref(),
            b"vault".as_ref()
        ],
        bump
    )]
    vault: SystemAccount<'info>,

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
}


pub fn mint_rebu(ctx: &Context<MintRebuTo>, amount: u64) -> Result<()> {
    // PDA signer seeds
    let signer_seeds: &[&[&[u8]]] = &[&[b"rebu123".as_ref(), b"mint".as_ref(), &[ctx.bumps.mint]]];

    // Invoke the mint_to instruction on the token program
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
                authority: ctx.accounts.mint.to_account_info(), // PDA mint authority, required as signer
            },
        )
        .with_signer(signer_seeds), // using PDA to sign
        amount * 10u64.pow(ctx.accounts.mint.decimals as u32), // Mint tokens, adjust for decimals
    )?;

    msg!("Token minted successfully.");

    Ok(())
}

pub fn deposit_sol(ctx: Context<MintRebuTo>, amount: u64) -> Result<()> {
    let discounted_amount = 0.5 * amount as f64;
    let lamports_amount = discounted_amount * LAMPORTS_PER_SOL as f64;

    let transfer_accounts = Transfer {
        from: ctx.accounts.signer.to_account_info(),
        to: ctx.accounts.vault.to_account_info()
    };
    let transfer_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        transfer_accounts
    );
    transfer(transfer_ctx, lamports_amount as u64)
}


