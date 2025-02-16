#![allow(dead_code)]
// use rustler;

use std::error::Error;

use solana_client::rpc_client::RpcClient;
#[allow(unused_imports)]
use solana_sdk::{
    pubkey::Pubkey,
    system_transaction, 
    signature::{Keypair, Signature},
    signer::keypair::read_keypair_file};


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

fn get_user_pda(program_id: &Pubkey, username: &str, _mint_id: &Pubkey) -> Option<bool> {
    let (_user_pubkey, _user_bump) = Pubkey::try_find_program_address(
        &[b"rbu_token_user", username.as_bytes()],
        &program_id
    )?;
    todo!()

}

fn get_user_token_account(_user_pda: &Pubkey, _mint: &Pubkey) -> Result<Pubkey, Box<dyn Error>> {
    // get_associated_token_address(user_pda, mint);
    todo!()
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
