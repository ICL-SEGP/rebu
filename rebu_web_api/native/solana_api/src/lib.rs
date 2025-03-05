#![allow(deprecated)]
#![allow(unused_attributes)]

pub mod api_funcs;

pub use api_funcs::*;

rustler::init!(
    "Elixir.RebuWebApi.SolanaApi", 
    [new_product_listing, mint_tokens_to_user, get_user_token_balance, get_mint_str]);
