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
    associated_token::{
        self,
        spl_associated_token_account::{
        instruction::create_associated_token_account,
        get_associated_token_address_with_program_id 
        },
    },
    token_2022::spl_token_2022,
};

declare_program!(rebu_solana);
use rebu_solana::client::{accounts, args};

const LAMPORTS_PER_SOL: f64 = 1_000_000_000.0;

const MINT_URI: &str = "https://raw.githubusercontent.com/ICL-SEGP/rebu-token-info/refs/heads/main/token_metadata.json";

pub trait PublicKey {
    fn get_pubkey(&self) -> Pubkey;
}

impl PublicKey for Keypair {
    fn get_pubkey(&self) -> Pubkey {
        self.pubkey()
    }
}

pub fn new_rpc_client() -> RpcClient {
    // RpcClient::new("http://127.0.0.1:8899")
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

pub fn mint_str() -> String {
    Pubkey::find_program_address(
        &[
            b"rebu123".as_ref(),
            b"mint".as_ref(),
        ], 
        &rebu_solana::ID)
        .0
        .to_string()
}

#[rustler::nif]
pub fn mint_str() -> String {
    Pubkey::find_program_address(
        &[
            b"rebu123".as_ref(),
            b"mint".as_ref(),
        ], 
        &rebu_solana::ID)
        .0
        .to_string()
}

#[rustler::nif]
pub fn new_product_listing(
    owner_keypair: String, id: u64, 
    stock: u64, price: u64,
) -> Result<(), String> {

    let mint_pubkey = mint_str();

    let owner_keypair = &get_keypair_from_str(owner_keypair);
    let mint = &get_pubkey_from_str(&mint_pubkey);

    let provider = Client::new(Cluster::Devnet, Rc::new(owner_keypair));
    println!("Rebu pid: {:?}", &rebu_solana::ID);
    let program = provider
        .program(rebu_solana::ID)
        .map_err(|_| "Error: rebu_solana could not be loaded as a client program.".to_string())?;

    let (product_listing, _) = Pubkey::find_program_address(
        &[
            b"product".as_ref(),
            b"listing".as_ref(),
            program.payer().as_ref(),
            id.to_le_bytes().as_ref()
        ], 
        &rebu_solana::ID);

    let new_product_listing_ix = program
        .request()
        .signer(owner_keypair)
        .accounts(accounts::AddListing {
            mint: mint.clone(),
            seller: program.payer(),
            seller_ata: get_token_account(&program.payer(), mint),
            product_listing: product_listing,
            associated_token_program: associated_token::ID,
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
            .map_err(|e| format!("Error: Product Listing initialization. {}", e))
    })?};

    Ok(())
}

#[rustler::nif]
pub fn modify_product_listing( // TODO: extract duplicate code
    owner_keypair: String, id: u64, 
    stock: u64, price: u64,
) -> Result<(), String> {

    let owner_keypair = &get_keypair_from_str(owner_keypair);

    let provider = Client::new(Cluster::Devnet, Rc::new(owner_keypair));
    println!("Rebu pid: {:?}", &rebu_solana::ID);
    let program = provider
        .program(rebu_solana::ID)
        .map_err(|_| "Error: rebu_solana could not be loaded as a client program.".to_string())?;

    let (product_listing, _) = Pubkey::find_program_address(
        &[
            b"product".as_ref(),
            b"listing".as_ref(),
            program.payer().as_ref(),
            id.to_le_bytes().as_ref()
        ], 
        &rebu_solana::ID);

    let new_product_listing_ix = program
        .request()
        .signer(owner_keypair)
        .accounts(accounts::ModifyListing {
            seller: program.payer(),
            product_listing: product_listing,
            token_program: spl_token_2022::ID,
            system_program: system_program::ID,
        })
        .args(args::ModifyListing {
            id,
            stock,
            price
        });

    let rt = Runtime::new().expect("Error when creating tokio runtime.");
    let _transaction: Signature = { rt.block_on(async { 
        new_product_listing_ix
            .send()
            .await 
            .map_err(|e| format!("Error: Product Listing modification. {}", e))
    })?};

    Ok(())
}

#[rustler::nif]
pub fn make_purchase(customer_keypair: String, owner_keypair: String, id: u64) -> Result<(), String> {
    // TODO: extract duplicate code

    let owner = get_keypair_from_str(owner_keypair).pubkey();
    let mint_pubkey = mint_str();

    let customer_keypair = &get_keypair_from_str(customer_keypair);
    let mint = get_pubkey_from_str(&mint_pubkey);
    let customer_ata = get_token_account(&customer_keypair.pubkey(), &mint);
    let owner_ata = get_token_account(&owner, &mint);

    let provider = Client::new(Cluster::Devnet, Rc::new(customer_keypair));
    let program = provider
        .program(rebu_solana::ID)
        .map_err(|_| "Error: rebu_solana could not be loaded as a client program.".to_string())?;

    let (product_listing, _) = Pubkey::find_program_address(
        &[
            b"product".as_ref(),
            b"listing".as_ref(),
            owner.as_ref(),
            id.to_le_bytes().as_ref()
        ], 
        &rebu_solana::ID);

    let (product_purchase, _) = Pubkey::find_program_address(
        &[
            b"product".as_ref(),
            b"purchase".as_ref(),
            owner.as_ref(),
            id.to_le_bytes().as_ref(),
            program.payer().as_ref(),
        ], 
        &rebu_solana::ID);

    let new_product_listing_ix = program
        .request()
        .signer(customer_keypair)
        .accounts(accounts::MakePurchase {
            customer: program.payer(),
            customer_ata,
            mint,
            seller: owner,
            seller_ata: owner_ata,
            product_listing,
            product_purchase,
            associated_token_program: associated_token::ID,
            token_program: spl_token_2022::ID,
            system_program: system_program::ID,
        })
        .args(args::MakePurchase {
            id
        });

    let rt = Runtime::new().expect("Error when creating tokio runtime.");
    let _transaction: Signature = { rt.block_on(async { 
        new_product_listing_ix
            .send()
            .await 
            .map_err(|e| format!("Error: Purchase. {}", e))
    })?};

    Ok(())
}

#[rustler::nif]
pub fn verify_purchase(owner_keypair: String, customer_pubkey: String, id: u64) -> Result<(), String> {

    let customer = get_pubkey_from_str(&customer_pubkey);
    let owner = &get_keypair_from_str(owner_keypair);

    let provider = Client::new(Cluster::Devnet, Rc::new(owner));
    let program = provider
        .program(rebu_solana::ID)
        .map_err(|_| "Error: rebu_solana could not be loaded as a client program.".to_string())?;

    let (product_purchase, _) = Pubkey::find_program_address(
        &[
            b"product".as_ref(),
            b"purchase".as_ref(),
            owner.pubkey().as_ref(),
            id.to_le_bytes().as_ref(),
            customer.as_ref(),
        ], 
        &rebu_solana::ID);

    let verify_purchase_ix = program
        .request()
        .signer(owner)
        .accounts(accounts::VerifyPurchase {
            seller: owner.pubkey(),
            customer: customer,
            product_purchase
        })
        .args(args::VerifyPurchase {
            id
        });

    let rt = Runtime::new().expect("Error when creating tokio runtime.");
    let _transaction: Signature = { rt.block_on(async { 
        verify_purchase_ix
            .send()
            .await 
            .map_err(|e| format!("Error: Verifying purchase. {}", e))
    })?};

    Ok(())
}

#[rustler::nif]
pub fn get_user_token_balance(user_pubkey: String) -> u64 {
    let mint_pubkey = mint_str();
    let rpc_client = &new_rpc_client();
    let mint_pubkey = &get_pubkey_from_str(&mint_pubkey);
    let user_pubkey = &get_pubkey_from_str(&user_pubkey);
    let user_ata_pubkey = get_token_account(user_pubkey, mint_pubkey);

    let amount = rpc_client
                   .get_token_account_balance(&user_ata_pubkey)
                   .expect("Something went wrong when getting user balance.");

    amount.ui_amount.expect("Something went wrong when getting user ui amount balance.") as u64
}

pub fn init_mint(owner_keypair: String) -> Result<(), String> {

    let owner_keypair = &get_keypair_from_str(owner_keypair);

    let mint = get_pubkey_from_str(&mint_str());

    let (vault, _) = Pubkey::find_program_address(
        &[
            b"rebu123".as_ref(),
            b"vault".as_ref(),
        ], 
        &rebu_solana::ID);

    let provider = Client::new(Cluster::Devnet, Rc::new(owner_keypair));
    let program = provider
        .program(rebu_solana::ID)
        .map_err(|_| "Error: rebu_solana could not be loaded as a client program.".to_string())?;

    let create_token_ix = program
        .request()
        .signer(owner_keypair)
        .accounts(accounts::CreateToken {
            payer: program.payer(),
            mint,
            vault,
            token_program: spl_token_2022::ID,
            system_program: system_program::ID,
        })
        .args(args::CreateToken {
            uri: MINT_URI.to_string(),
        });

    let rt = Runtime::new().expect("Error when creating tokio runtime.");
    let _transaction: Signature = { rt.block_on(async { 
        create_token_ix
            .send()
            .await 
            .map_err(|e| format!("Error: Mint initialization. {}", e))
    })?};

    Ok(())
}

#[rustler::nif]
pub fn mint_tokens_to_user(
    owner_keypair: String, user_pubkey: String, 
    amount: u64, is_new_user: bool,
) -> Result<(), String> {

    let owner_keypair = &get_keypair_from_str(owner_keypair);
    let user_pubkey = &get_pubkey_from_str(&user_pubkey);

    let mint = get_pubkey_from_str(&mint_str());

    let (vault, _) = Pubkey::find_program_address(
        &[
            b"rebu123".as_ref(),
            b"vault".as_ref(),
        ], 
        &rebu_solana::ID);

    if is_new_user {
        let rpc_client = new_rpc_client();
        let airdrop_amount = 500_000_000; // 0.5 SOL
        let signature = rpc_client
            .request_airdrop(user_pubkey, airdrop_amount)
            .expect("Failed to request airdrop");

        while !rpc_client.confirm_transaction(&signature).unwrap() {}

        let mint_transaction = Transaction::new_signed_with_payer(
            &[create_associated_token_account(
                &owner_keypair.pubkey(),
                user_pubkey,
                &mint,
                &spl_token_2022::ID,
            )],
            Some(&owner_keypair.pubkey()),
            &[&owner_keypair],
            rpc_client.get_latest_blockhash().expect("Something went wrong with getting blockhash.")
        );
        
        rpc_client
            .send_and_confirm_transaction_with_spinner(&mint_transaction)
            .expect("Something went wrong in comfirming the transaction.");
        println!("Created account");
    }

    let provider = Client::new(Cluster::Localnet, Rc::new(owner_keypair));
    let program = provider
        .program(rebu_solana::ID)
        .map_err(|_| "Error: rebu_solana could not be loaded as a client program.".to_string())?;

    let mint_token_ix = program
        .request()
        .signer(owner_keypair)
        .accounts(accounts::MintRebuTo {
            signer: program.payer(),
            mint,
            recipient: get_token_account(user_pubkey, &mint),
            vault,
            token_program: spl_token_2022::ID,
            system_program: system_program::ID,
        })
        .args(args::MintRebuTo {
            amount: amount,
        });

    let rt = Runtime::new().expect("Error when creating tokio runtime.");
    let _transaction: Signature = { rt.block_on(async { 
        mint_token_ix
            .send()
            .await 
            .map_err(|e| format!("Error: Mint initialization. {}", e))
    })?};

    Ok(())
}

pub fn burn_rebu(user_keypair: String, amount: u64) -> Result<(), String> {

    let user_keypair = &get_keypair_from_str(user_keypair);

    let mint = get_pubkey_from_str(&mint_str());

    let (vault, _) = Pubkey::find_program_address(
        &[
            b"rebu123".as_ref(),
            b"vault".as_ref(),
        ], 
        &rebu_solana::ID);

    let provider = Client::new(Cluster::Localnet, Rc::new(user_keypair));
    let program = provider
        .program(rebu_solana::ID)
        .map_err(|_| "Error: rebu_solana could not be loaded as a client program.".to_string())?;

    let burn_token_ix = program
        .request()
        .signer(user_keypair)
        .accounts(accounts::BurnRebu {
            signer: program.payer(),
            mint,
            token_account: get_token_account(&user_keypair.pubkey(), &mint),
            vault,
            token_program: spl_token_2022::ID,
            system_program: system_program::ID,
        })
        .args(args::BurnRebu {
            amount: amount,
        });

    let rt = Runtime::new().expect("Error when creating tokio runtime.");
    let _transaction: Signature = { rt.block_on(async { 
        burn_token_ix
            .send()
            .await 
            .map_err(|e| format!("Error: Burning . {}", e))
    })?};

    Ok(())
}

mod atoms {
    rustler::atoms! {
        ok,
        error
    }
}
