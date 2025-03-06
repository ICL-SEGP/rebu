use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{mint_to, Mint, MintTo, TokenInterface, TokenAccount},
};


#[derive(Accounts)]
pub struct MintRebuTo<'info> {
    // Mint account address is a PDA
    #[account(
        mut,
        seeds = [b"rebu", b"mint"],
        bump,
    )]
    pub mint_account: InterfaceAccount<'info, Mint>,

    // Create Associated Token Account, if needed
    // This is the account that will hold the minted tokens
    #[account(
        mut,
        // init_if_needed,
        // payer = payer,
        // associated_token::mint = mint_account,
        // associated_token::authority = payer,
    )]
    pub recipient: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}


pub fn mint_rebu(ctx: &Context<MintRebuTo>, amount: u64) -> Result<()> {
    // PDA signer seeds
    let signer_seeds: &[&[&[u8]]] = &[&[b"rebu", b"mint", &[ctx.bumps.mint_account]]];

    // Invoke the mint_to instruction on the token program
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
                authority: ctx.accounts.mint_account.to_account_info(), // PDA mint authority, required as signer
            },
        )
        .with_signer(signer_seeds), // using PDA to sign
        amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32), // Mint tokens, adjust for decimals
    )?;

    msg!("Token minted successfully.");

    Ok(())
}

pub fn deposit_sol(_ctx: Context<MintRebuTo>, _amount: u64) -> Result<()> {
    // let transfer_cpi = CpiContext::new(

    // )
    Ok(())
}
