defmodule RebuWebApi.SolanaApi do
  use Rustler, otp_app: :rebu_web_api, crate: "solana_api"

  # When your NIF is loaded, it will override this function.
  def mint_tokens_to_user(_a, _b, _c, _d, _e), do: :erlang.nif_error(:nif_not_loaded)
end
