#![allow(dead_code)]
use rustler;

use std::str::FromStr;
use std::rc::Rc;
use std::result::Result;
use tokio::runtime::Runtime;

use anchor_lang::prelude::*;

use anchor_client::{
    Client,
    Cluster,
    solana_client::rpc_client::RpcClient,
    solana_sdk::{
        pubkey::Pubkey,
        signature::{Keypair, Signer, Signature},
        signer::keypair::read_keypair_file,
        system_program,
        transaction::Transaction,
    }
};
use anchor_spl::{
    associated_token::spl_associated_token_account::{
        instruction::create_associated_token_account,
        get_associated_token_address_with_program_id,
    },
    token_2022::spl_token_2022,
};

declare_program!(rebu_solana);
use rebu_solana::client::{accounts, args};

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

// fn request_airdrop(rpc_client: &RpcClient, pub_key: &Pubkey, amount_sol: f64) -> Result<Signature, Box<dyn Error>> {
//     let sig = rpc_client.request_airdrop(&pub_key, (amount_sol * LAMPORTS_PER_SOL) as u64)?;
//     while !rpc_client.confirm_transaction(&sig)? {}
//     Ok(sig)
// }

// fn requires_airdrop(rpc_client: &RpcClient, pub_key: &Pubkey) -> Result<bool, Box<dyn Error>> {
//     Ok(rpc_client.get_balance(&pub_key)? < (LAMPORTS_PER_SOL * 0.01) as u64)
// }

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
    Pubkey::from_str(key_str).expect("Error parsing pubkey")
}

pub fn get_token_account(user_pubkey: &Pubkey, mint_pubkey: &Pubkey) -> Pubkey {
    get_associated_token_address_with_program_id(
        user_pubkey, mint_pubkey, 
        &spl_token_2022::ID
    )
}

#[rustler::nif]
pub fn new_product_listing(
    owner: String, mint_pubkey: String,
    id: u64, stock: u64, price: u64,
) -> Result<(), String> {

    let owner_keypair = &get_keypair_from_str(owner);
    let mint = &get_pubkey_from_str(&mint_pubkey);

    let provider = Client::new(Cluster::Localnet, Rc::new(owner_keypair));
    let program = provider
        .program(rebu_solana::ID)
        .map_err(|_| "Error: rebu_solana could not be loaded as a client program.".to_string())?;

    let product_listing = Keypair::new();

    let new_product_listing_ix = program
        .request()
        .signer(owner_keypair)
        .accounts(accounts::AddListing {
            mint: mint.clone(),
            signer: program.payer(),
            seller_ata: get_token_account(&program.payer(), mint),
            product_listing: product_listing.pubkey(),
            token_program: spl_token_2022::ID,
            system_program: system_program::ID,
        })
        .args(args::AddListing {
            id,
            stock,
            price
        });

    let rt = Runtime::new().expect("Error when creating tokio runtime.");
    let _transaction: Signature = { rt.block_on(async { 
        new_product_listing_ix
            .send()
            .await 
            .map_err(|_| "Error: Product Listing initialization".to_string())
    })?};

    Ok(())
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
    let owner_keypair = &get_keypair_from_str(owner);
    let mint_pubkey = &get_pubkey_from_str(&mint_pubkey);
    let user_pubkey = &get_pubkey_from_str(&user_pubkey);
    
    let user_ata_pubkey = get_token_account(user_pubkey, mint_pubkey);

    let mint_instruction = spl_token_2022::instruction::mint_to(
        &spl_token_2022::ID,
        &mint_pubkey,
        &user_ata_pubkey,
        &owner_keypair.pubkey(),
        &[&owner_keypair.pubkey()],
        amount * LAMPORTS_PER_SOL as u64,
    ).expect("Something went wrong with mint instruction.");

    let instrs = if !is_new_user {
        vec![mint_instruction]
    } else {
        let create_ata_instruction = create_associated_token_account(
            &owner_keypair.pubkey(),
            user_pubkey,
            mint_pubkey,
            &spl_token_2022::ID,
        );

        vec![create_ata_instruction, mint_instruction]
    };

    let mint_transaction = Transaction::new_signed_with_payer(
        &instrs,
        Some(&owner_keypair.pubkey()),
        &[&owner_keypair],
        rpc_client.get_latest_blockhash().expect("Something went wrong with getting blockhash.")
    );

    println!("Mint Transaction: {:?}", &mint_transaction);

    // if requires_airdrop(rpc_client, &owner.pubkey())? {
    //     request_airdrop(rpc_client, &owner.pubkey(), 1.0)?;
    // }

    rpc_client
        .send_and_confirm_transaction_with_spinner(&mint_transaction)
        .expect("Something went wrong in comfirming the transaction.");

    Ok(())
}


mod atoms {
    rustler::atoms! {
        ok,
        error
    }
}
