use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct MintRebuTo {

}


pub fn mint_to(_ctx: &Context<MintRebuTo>, _amount: u64) -> Result<()> {
    Ok(())
}

pub fn deposit_sol(_ctx: Context<MintRebuTo>, _amount: u64) -> Result<()> {
    Ok(())
}
