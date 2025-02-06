use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(init, payer = user, space = 8 + 32)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>, // The user's wallet signing the transaction

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateAdmin<'info> {
    #[account(init, payer = admin, space = 8 + 32)]
    pub admin_account: Account<'info, AdminAccount>,

    #[account(mut)]
    pub admin: Signer<'info>, // Admin wallet signing the transaction

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(mut)]
    pub admin: Signer<'info>, // Admin wallet, must sign to create the mint

    #[account(init, payer = admin, mint::decimals = 6, mint::authority = admin)]
    pub mint_account: Account<'info, Mint>, // Token mint owned by admin

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserAccount {
    pub owner: Pubkey, // Store wallet address
}

#[account]
pub struct AdminAccount {
    pub owner: Pubkey, // Store admin's wallet address
}

pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
    let user = &mut ctx.accounts.user_account;
    user.owner = ctx.accounts.user.key(); // Set wallet address
    msg!("User account linked to wallet: {}", user.owner);
    Ok(())
}

pub fn create_admin(ctx: Context<CreateAdmin>) -> Result<()> {
    let admin = &mut ctx.accounts.admin_account;
    admin.owner = ctx.accounts.admin.key(); // Set wallet address
    msg!("Admin account linked to wallet: {}", admin.owner);
    Ok(())
}

pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
    msg!("Mint initialized with admin authority: {}", ctx.accounts.admin.key());
    Ok(())
}
