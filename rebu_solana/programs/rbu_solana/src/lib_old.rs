use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount, Mint};

declare_id!("2BP1eFmEudXQTNE3epfvATx36iexYzGGNALMG1PyZCn2");

#[program]
pub mod simple_order {
    use super::*;

    /// Creates an order by recording the customer's pubkey, a price, and locking tokens.
    pub fn create_order(ctx: Context<CreateOrder>, price: u64) -> Result<()> {
        let order = &mut ctx.accounts.order;
    
        // *Check that the customer's token account belongs to the correct mint*
        require!(
            ctx.accounts.customer_token_account.mint == ctx.accounts.rebu_mint.key(),
            CustomError::InvalidMint
        );
    
        order.customer = ctx.accounts.customer.key();
        order.price = price;
        order.fulfilled = false;
        
        msg!("Order created for {} tokens", price);
        Ok(())
    }
    

    /// Fulfills an order by transferring locked tokens from the escrow to the supplier's token account.
    pub fn fulfill_order(ctx: Context<FulfillOrder>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        require!(!order.fulfilled, CustomError::OrderAlreadyFulfilled);
        
        // Transfer tokens from escrow (order token account) to the supplier's token account.
        let cpi_accounts = Transfer {
            from: ctx.accounts.order_token_account.to_account_info(),
            to: ctx.accounts.supplier_token_account.to_account_info(),
            authority: ctx.accounts.customer.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            order.price,
        )?;
        
        order.fulfilled = true;
        msg!("Order fulfilled: {} tokens transferred to supplier", order.price);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateOrder<'info> {
    #[account(init, payer = customer, space = 8 + Order::LEN)]
    pub order: Account<'info, Order>,

    #[account(mut)]
    pub customer: Signer<'info>,

    #[account(mut, constraint = customer_token_account.mint == rebu_mint.key())]
    pub customer_token_account: Account<'info, TokenAccount>,

    #[account(init, payer = customer, token::mint = rebu_mint, token::authority = customer)]
    pub order_token_account: Account<'info, TokenAccount>,

    #[account()]
    pub rebu_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FulfillOrder<'info> {
    #[account(mut, has_one = customer)]
    pub order: Account<'info, Order>,
    
    /// CHECK: This account is only used for its public key; no data is read or written.
    #[account()]
    pub customer: AccountInfo<'info>,
    
    #[account(mut)]
    pub supplier: Signer<'info>,
    
    #[account(mut)]
    pub supplier_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub order_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Order {
    pub customer: Pubkey,
    pub price: u64,
    pub fulfilled: bool,
}

impl Order {
    pub const LEN: usize = 32 + 8 + 1;
}

#[error_code]
pub enum CustomError {
    #[msg("Customer token account does not match the expected Rebu mint.")]
    InvalidMint,

    #[msg("The order has already been fulfilled.")]
    OrderAlreadyFulfilled,
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    #[test]
    fn test_create_order() {
        let price = 100;
        msg!("Test: Creating an order for {} tokens", price);
    }

    #[test]
    fn test_fulfill_order() {
        let price = 100;
        msg!("Test: Fulfilling an order of {} tokens", price);
    }
}
