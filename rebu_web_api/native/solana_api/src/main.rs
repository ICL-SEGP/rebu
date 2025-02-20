mod api_funcs;
use api_funcs::*;

// use solana_sdk::{
//     pubkey::Pubkey,
//     signature::Signer,
//     signer::keypair::{read_keypair_file, Keypair},
// };


fn main() {
    let client = new_rpc_client();
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

    // let balance = get_user_token_balance("6nyYhkrgDfb3f1eVCaAjTPoPkVRxx5sev9tzr5f1mCDY".to_string(), "mntSPLHmrFAELUiNxDC31Nm44TofrAs7VXBknPoqiBY".to_string());
    // println!("User token balance: {:?}", balance);
    
    // let result = mint_tokens_to_user(
    //     &client, &owner, 
    //     &mint.get_pubkey(), &user_pubkey,
    //     10, fa
    // );

    // println!("Result: {:?}", result);
}


// pub fn get_keypair_from_file(path: &str) -> Keypair {
//     read_keypair_file(path).map_err(|e| {
//         panic!("Failed to read keypair file ({}): ({})", path, e)
//     }).unwrap()
// }
