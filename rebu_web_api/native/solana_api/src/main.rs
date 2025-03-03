// mod api_funcs;
// use api_funcs::*;


// use anchor_client::{
//     solana_client::rpc_client::RpcClient,
//     solana_sdk::{
//         commitment_config::CommitmentConfig, native_token::LAMPORTS_PER_SOL, signature::Keypair,
//         signer::Signer, system_program,
//     },
//     Client, Cluster,
// };
// use anchor_lang::prelude::*;
 



fn main() {
    // let program_id = "2GdZ4irJV2ikmSafsxaGhjJnoMarAsckThqPxEXdxiK5";
    // let rebu_solana_pda = Pubkey::find_program_address()

    // let local_rpc_url = String::from("http://127.0.0.1:8899");

//     let client = RpcClient::new_with_commitment(local_rpc_url, CommitmentConfig::confirmed());
    
//     let folder_path = "/home/astrobyte/personalProjects/segp/rebu/token-info/.config/solana/";
//     let owner_path = format!("{}{}", folder_path, "owner_keypair.json");
//     let mint_path = format!("{}{}", folder_path, "mint_keypair.json");

//     let owner = get_keypair_from_file(&owner_path);
//     println!("Owner account: {:?}", &owner.get_pubkey());

//     let mint = get_keypair_from_file(&mint_path);
//     println!("Mint account: {:?}", &mint.get_pubkey());

//     let user_pubkey = get_pubkey_from_str("6nyYhkrgDfb3f1eVCaAjTPoPkVRxx5sev9tzr5f1mCDY");
//     println!("User account: {:?}", user_pubkey);
    
//     let owner_token_account = get_token_account(&owner.get_pubkey(), &mint.get_pubkey());
//     println!("Owner token account: {:?}", owner_token_account);

//     let user_token_account = get_token_account(&user_pubkey, &mint.get_pubkey());
//     println!("User token account: {:?}", user_token_account);

//     let airdrop_amount = 1_000_000_000; // 1 SOL
//     let signature = client
//         .request_airdrop(&owner.get_pubkey(), airdrop_amount)
//         .expect("Failed to request airdrop");

//     while !client.confirm_transaction(&signature).unwrap() {}

//     let provider = Client::new_with_options(
//         Cluster::Localnet,
//         Rc::new(payer),
//         CommitmentConfig::confirmed(),
//     );

//     // On Solana every data are stored in Accounts
//     // There are seversal types of accounts which we will cover later
//     // So programs are stored as "binary" codes in "executable" accounts
//     // if !program_info.executable {
//     //     panic!(
//     //         "program with keypair ({}) is not executable",
//     //         program_keypair_path
//     //     );
//     // }

//     // let instruction = Instruction::new_with_borsh(
//     //     program_id,
//     //     &(),
//     //     vec![],
//     // );

//     // let mut transaction = Transaction::new_with_payer(&[instruction], Some(&payer.pubkey()));
//     // transaction.sign(&[&payer], client.get_latest_blockhash().unwrap());

//     // match client.send_and_confirm_transaction(&transaction) {
//     //     Ok(signature) => println!("Transaction Signature: {}", signature),
//     //     Err(err) => eprintln!("Error sending transaction: {}", err),
//     // }

//     // let balance = get_user_token_balance("6nyYhkrgDfb3f1eVCaAjTPoPkVRxx5sev9tzr5f1mCDY".to_string(), "mntSPLHmrFAELUiNxDC31Nm44TofrAs7VXBknPoqiBY".to_string());
//     // println!("User token balance: {:?}", balance);
    
//     // let result = mint_tokens_to_user(
//     //     &client, &owner, 
//     //     &mint.get_pubkey(), &user_pubkey,
//     //     10, fa
//     // );

//     // println!("Result: {:?}", result);
}


// // pub fn get_keypair_from_file(path: &str) -> Keypair {
// //     read_keypair_file(path).map_err(|e| {
// //         panic!("Failed to read keypair file ({}): ({})", path, e)
// //     }).unwrap()
// // }
