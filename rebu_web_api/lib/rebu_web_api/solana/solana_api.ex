defmodule RebuWebApi.SolanaApi do
  use Rustler, otp_app: :rebu_web_api, crate: "solana_api"

  # When your NIF is loaded, it will override this function.
  def new_product_listing(_a, _b, _c, _d), do: :erlang.nif_error(:nif_not_loaded)
  def mint_tokens_to_user(_a, _b, _c, _d), do: :erlang.nif_error(:nif_not_loaded)
  def get_user_token_balance(_a), do: :erlang.nif_error(:nif_not_loaded)
  def mint_str(), do: :erlang.nif_error(:nif_not_loaded)

end
