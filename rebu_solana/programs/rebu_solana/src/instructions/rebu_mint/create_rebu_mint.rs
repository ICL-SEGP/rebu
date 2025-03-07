use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    native_token::LAMPORTS_PER_SOL,
    rent::{
    DEFAULT_EXEMPTION_THRESHOLD, DEFAULT_LAMPORTS_PER_BYTE_YEAR 
    },
};
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token_interface::{
    token_metadata_initialize, Mint, Token2022, TokenMetadataInitialize,
};
use anchor_spl::token_2022_extensions::spl_token_metadata_interface::state::TokenMetadata;
use spl_type_length_value::variable_len_pack::VariableLenPack;


#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account(
        init,
        seeds = [b"rebu123".as_ref(), b"mint".as_ref()],
        bump,
        payer = payer,
        mint::decimals = 2,
        mint::authority = mint.key(),
        mint::freeze_authority = mint.key(),
        extensions::metadata_pointer::authority = payer,
        extensions::metadata_pointer::metadata_address = mint,
    )]
    mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [
            b"rebu123".as_ref(),
            b"vault".as_ref(),
        ],
        bump,
    )]
    vault: SystemAccount<'info>,

    token_program: Program<'info, Token2022>,
    system_program: Program<'info, System>,
}

pub fn init_mint(ctx: Context<CreateToken>, uri: String) -> Result<()> {
    msg!("Creating metadata account");

    // PDA signer seeds
    let signer_seeds: &[&[&[u8]]] = &[&[b"rebu123", b"mint", &[ctx.bumps.mint]]];
    let name = "Rebu Token".to_string();
    let symbol = "REBU".to_string(); 

    // Define token metadata
    let token_metadata = TokenMetadata {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
        ..Default::default()
    };

    // Add 4 extra bytes for size of MetadataExtension (2 bytes for type, 2 bytes for length)
    let data_len = 4 + token_metadata.get_packed_len()?;

    // Calculate lamports required for the additional metadata
    let lamports =
        data_len as u64 * DEFAULT_LAMPORTS_PER_BYTE_YEAR * DEFAULT_EXEMPTION_THRESHOLD as u64;

    // Transfer additional lamports to mint account
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.mint.to_account_info(),
            },
        ),
        lamports,
    )?;

    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        LAMPORTS_PER_SOL as u64,
    )?;

    // Initialize token metadata
    token_metadata_initialize(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TokenMetadataInitialize {
                token_program_id: ctx.accounts.token_program.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                metadata: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.mint.to_account_info(),
                update_authority: ctx.accounts.payer.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        name,
        symbol,
        uri,
    )?;
    Ok(())
}
