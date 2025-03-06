mod api_funcs;
use api_funcs::*;


use anchor_client::{
    solana_client::rpc_client::RpcClient,
    solana_sdk::{
        commitment_config::CommitmentConfig, signature::Keypair,
    },
};

fn main() {
    let local_rpc_url = String::from("http://127.0.0.1:8899");

    let client = RpcClient::new_with_commitment(local_rpc_url, CommitmentConfig::confirmed());
    
    let folder_path = "/home/astrobyte/personalProjects/segp/rebu/token-info/.config/solana/";
    let owner_path = format!("{}{}", folder_path, "owner_keypair.json");
    let mint_path = format!("{}{}", folder_path, "mint_keypair.json");

    let owner = get_keypair_from_file(&owner_path);
    println!("Owner account: {:?}", &owner.get_pubkey());

    let mint = get_keypair_from_file(&mint_path);
    println!("Mint account: {:?}", &mint.get_pubkey());

    let user_pubkey = get_pubkey_from_str("6nyYhkrgDfb3f1eVCaAjTPoPkVRxx5sev9tzr5f1mCDY");
    println!("User account: {:?}", user_pubkey);
    
    let owner_token_account = get_token_account(&owner.get_pubkey(), &mint.get_pubkey());
    println!("Owner token account: {:?}", owner_token_account);

    let user_token_account = get_token_account(&user_pubkey, &mint.get_pubkey());
    println!("User token account: {:?}", user_token_account);

    let new_user = Keypair::new();

    let airdrop_amount = 1_000_000_000; // 1 SOL
    let signature = client
        .request_airdrop(&new_user.get_pubkey(), airdrop_amount)
        .expect("Failed to request airdrop");

    while !client.confirm_transaction(&signature).unwrap() {}

    // let balance = client.get_balance(&owner.get_pubkey()).unwrap();
    // println!("Owner balance: {:?}", balance);

    let user_pubkey_str = format!("{:?}", &user_pubkey);
    println!("New User: {}", &new_user.get_pubkey());

    let _result = mint_tokens_to_user(
        owner.to_base58_string(),
        new_user.get_pubkey().to_string(),
        50,
        true
    );
    
    // println!("Minted\n ");

    let id = 101;

    let result = new_product_listing(
        owner.to_base58_string(),
        id,
        5,
        50
    );

    // println!("New listing result: {:?}", result);

    let result = make_purchase(
        new_user.to_base58_string(),
        owner.to_base58_string(),
        id
    );

    println!("New purchase result: {:?}", result);

    let result = verify_purchase(
        owner.to_base58_string(),
        new_user.get_pubkey().to_string(),
        id
    );

    // println!("Verifying: {:?}", result);

}