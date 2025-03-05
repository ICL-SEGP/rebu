#![allow(deprecated)]
#![allow(unused_attributes)]

pub mod api_funcs;

pub use api_funcs::*;

rustler::init!(
    "Elixir.RebuWebApi.SolanaApi", 
    [mint_str, new_product_listing, modify_product_listing, make_purchase, verify_purchase, get_user_token_balance, mint_tokens_to_user]);
