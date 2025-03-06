defmodule RebuWebApi.SolanaApi do
  use Rustler, otp_app: :rebu_web_api, crate: "solana_api"

  # When your NIF is loaded, it will override this function.
  def mint_str(), do: :erlang.nif_error(:nif_not_loaded)

  def new_product_listing(_owner_keypair, _id, _stock, _price),
    do: :erlang.nif_error(:nif_not_loaded)

  def modify_product_listing(_owner_keypair, _id, _stock, _price),
    do: :erlang.nif_error(:nif_not_loaded)

  def make_purchase(_customer_keypair, _owner_keypair, _id),
    do: :erlang.nif_error(:nif_not_loaded)

  def verify_purchase(_owner_keypair, _customer_pubkey, _id),
    do: :erlang.nif_error(:nif_not_loaded)

  def get_user_token_balance(_user_pubkey), do: :erlang.nif_error(:nif_not_loaded)

  def mint_tokens_to_user(_owner_keypair, _user_pubkey, _amount, _is_new_user),
    do: :erlang.nif_error(:nif_not_loaded)
end
