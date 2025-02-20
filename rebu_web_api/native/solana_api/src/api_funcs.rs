#![allow(dead_code)]
// use rustler;

use std::error::Error;

use solana_client::rpc_client::RpcClient;
use spl_associated_token_account::{
    instruction::create_associated_token_account,
    get_associated_token_address_with_program_id,
};

use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer, Signature},
    signer::keypair::read_keypair_file,
    transaction::Transaction,
};
use spl_token_2022::{
    id, instruction,
};


const LAMPORTS_PER_SOL: f64 = 1_000_000_000.0;

pub trait PublicKey {
    fn get_pubkey(&self) -> Pubkey;
}

impl PublicKey for Keypair {
    fn get_pubkey(&self) -> Pubkey {
        self.pubkey()
    }
}

pub fn new_rpc_client() -> RpcClient {
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

pub fn get_keypair_from_file(path: &str) -> Keypair {
    read_keypair_file(path).map_err(|e| {
        panic!("Failed to read keypair file ({}): ({})", path, e)
    }).unwrap()
}

fn get_keypair_from_str(kp_str: String) -> Keypair {
    Keypair::from_base58_string(&kp_str)
}

pub fn get_pubkey_from_file(path: &str) -> Pubkey {
    get_keypair_from_file(path).pubkey()
}

pub fn get_pubkey_from_str(key_str: &str) -> Pubkey {
    Pubkey::from_str_const(key_str)
}

pub fn get_token_account(user_pubkey: &Pubkey, mint_pubkey: &Pubkey) -> Pubkey {
    get_associated_token_address_with_program_id(user_pubkey, mint_pubkey, &id())
}

#[rustler::nif]
pub fn get_user_token_balance(user_pubkey: String, mint_pubkey: String) -> u64 {
    let rpc_client = &new_rpc_client();
    let mint_pubkey = &get_pubkey_from_str(&mint_pubkey);
    let user_pubkey = &get_pubkey_from_str(&user_pubkey);
    let user_ata_pubkey = get_token_account(user_pubkey, mint_pubkey);

    let amount = rpc_client
                   .get_token_account_balance(&user_ata_pubkey)
                   .expect("Something went wrong when getting user balance.");

    amount.ui_amount.expect("Something went wrong when getting user ui amount balance.") as u64
}

#[rustler::nif]
pub fn mint_tokens_to_user(
    owner: String, mint_pubkey: String,
    user_pubkey: String, amount: u64, 
    is_new_user: bool,
) -> Result<(), String> {

    let rpc_client = &new_rpc_client();
    let owner = &get_keypair_from_str(owner);
    let mint_pubkey = &get_pubkey_from_str(&mint_pubkey);
    let user_pubkey = &get_pubkey_from_str(&user_pubkey);
    
    let user_ata_pubkey = get_token_account(user_pubkey, mint_pubkey);

    let mint_instruction = instruction::mint_to(
        &id(),
        &mint_pubkey,
        &user_ata_pubkey,
        &owner.pubkey(),
        &[&owner.pubkey()],
        amount * LAMPORTS_PER_SOL as u64,
    ).expect("Something went wrong with mint instruction.");

    let instrs = if !is_new_user {
        vec![mint_instruction]
    } else {
        let create_ata_instruction = create_associated_token_account(
            &owner.pubkey(),
            user_pubkey,
            mint_pubkey,
            &id(),
        );

        vec![create_ata_instruction, mint_instruction]
    };

    let mint_transaction = Transaction::new_signed_with_payer(
        &instrs,
        Some(&owner.pubkey()),
        &[&owner],
        rpc_client.get_latest_blockhash().expect("Something went wrong with getting blockhash.")
    );

    println!("Mint Transaction: {:?}", &mint_transaction);

    // if requires_airdrop(rpc_client, &owner.pubkey())? {
    //     request_airdrop(rpc_client, &owner.pubkey(), 1.0)?;
    // }

    rpc_client.send_and_confirm_transaction_with_spinner(&mint_transaction).expect("Something went wrong in comfirming the transaction.");

    Ok(())
}


mod atoms {
    rustler::atoms! {
        ok,
        error
    }
}
