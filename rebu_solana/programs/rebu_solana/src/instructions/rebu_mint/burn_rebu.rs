use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct BurnRebu {
    
}


pub fn burn(_ctx: &Context<BurnRebu>, _amount: u64) -> Result<()> {
    Ok(())
}

pub fn withdraw_sol(_ctx: Context<BurnRebu>, _amount: u64) -> Result<()> {
    Ok(())
}
