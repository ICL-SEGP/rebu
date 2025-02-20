pub mod api_funcs;

pub use api_funcs::*;

rustler::init!("Elixir.RebuWebApi.SolanaApi", [mint_tokens_to_user]);
