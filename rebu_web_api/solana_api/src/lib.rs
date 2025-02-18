#![allow(dead_code)]
// use rustler;

use std::error::Error;

use solana_client::rpc_client::RpcClient;
use spl_associated_token_account::get_associated_token_address;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer, Signature},
    signer::keypair::read_keypair_file,
    transaction::Transaction,
};
use spl_token::{
    id, instruction,
};


const LAMPORTS_PER_SOL: f64 = 1_000_000_000.0;

fn new_rpc_client() -> RpcClient {
    RpcClient::new("https://api.devnet.solana.com")
}


fn request_airdrop(rpc_client: &RpcClient, pub_key: &Pubkey, amount_sol: f64) -> Result<Signature, Box<dyn Error>> {
    let sig = rpc_client.request_airdrop(&pub_key, (amount_sol * LAMPORTS_PER_SOL) as u64)?;
    while !rpc_client.confirm_transaction(&sig)? {}
    Ok(sig)
}

fn requires_airdrop(rpc_client: &RpcClient, pub_key: &Pubkey) -> Result<bool, Box<dyn Error>> {
    Ok(rpc_client.get_balance(&pub_key)? < (LAMPORTS_PER_SOL * 0.01) as u64)
}

fn get_keypair_from_file(path: &str) -> Keypair {
    read_keypair_file(path).map_err(|e| {
        panic!("Failed to read keypair file ({}): ({})", path, e)
    }).unwrap()
}

fn get_pubkey_from_file(path: &str) -> Pubkey {
    get_keypair_from_file(path).pubkey()
}

fn get_user_pda(program_id: &Pubkey, username: &str, _mint_id: &Pubkey) -> Option<bool> {
    let (_user_pubkey, _user_bump) = Pubkey::try_find_program_address(
        &[b"rbu_token_user", username.as_bytes()],
        &program_id
    )?;
    todo!()

}

fn get_user_token_account(user_pubkey: &Pubkey, mint_pubkey: &Pubkey) -> Pubkey {
    get_associated_token_address(user_pubkey, mint_pubkey)
}

fn mint_tokens_to_user(admin: &Keypair, rpc_client: &RpcClient, mint_pubkey: &Pubkey, user_aca_pubkey: &Pubkey, amount: u64) -> Result<(), Box<dyn Error>> {
    let mint_transaction = instruction::mint_to(
        &id(),
        mint_pubkey,
        user_aca_pubkey,
        &admin.pubkey(),
        &[],
        amount * LAMPORTS_PER_SOL as u64,
    )?;

    let mint_transaction = Transaction::new_signed_with_payer(
        &[mint_transaction],
        Some(&admin.pubkey()),
        &[&admin],
        rpc_client.get_latest_blockhash()?
    );

    rpc_client.send_and_confirm_transaction(&mint_transaction)?;

    Ok(())
}

fn transfer_to_user(
    _rpc_client: &RpcClient, 
    _program_id: &Pubkey, 
    _username: &str,
    _mint_pubkey: &Pubkey,
    _account_pubkey: &Pubkey,
    _owner_pubkey: &Pubkey,
    _signer_pubkey: &Pubkey,
    _amount: u64) -> Result<Signature, Box<dyn Error>> {
    // let mint_to_instruction = mint_to(
    //     &spl_token::ID,
    //     mint_pubkey,
    //     owner_pubkey,
    //     signer_pubkey,
    //     &[signer_pubkey],
    //     amount,
    // )?;
    // while !rpc_client.confirm_transaction(&mint_to_instruction)? {}
    // Ok(mint_to_instruction)
    todo!()
}




mod atoms {
    rustler::atoms! {
        ok,
        error
    }
}
