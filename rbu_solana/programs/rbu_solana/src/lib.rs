use anchor_lang::prelude::*;

declare_id!("6L9XizWmkwxBgLAmB76bHACipTHvpn6jYg8Pznc8FgNw"); // Ensure this matches your deployed program ID

pub mod instructions;
pub mod state;

use instructions::*;

#[program]
pub mod rbu_solana {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        create::create_user(ctx)
    }

    pub fn create_admin(ctx: Context<CreateAdmin>) -> Result<()> {
        create::create_admin(ctx)
    }

    pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
        create::initialize_mint(ctx)
    }

    pub fn create_token(ctx: Context<CreateToken>, token_name: String, token_symbol: String, token_uri: String) -> Result<()> {
        create::create_token(ctx, token_name, token_symbol, token_uri)
    }

    pub fn mint_tokens(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        mint::mint_token(ctx, amount)
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        transfer::transfer_tokens(ctx, amount)
    }
}
