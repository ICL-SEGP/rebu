use anchor_lang::prelude::*;

declare_id!("6L9XizWmkwxBgLAmB76bHACipTHvpn6jYg8Pznc8FgNw");

#[program]
pub mod rbu_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
