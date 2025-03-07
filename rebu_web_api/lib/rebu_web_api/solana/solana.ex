defmodule RebuWebApi.Solana do
  import Ecto.Query, warn: false
  alias RebuWebApi.Repo
  alias RebuWebApi.SolanaApi

  def update_key(user, key) do
    user
    |> Ecto.Changeset.change(%{solana_pub_key: key})
    |> Repo.update()
  end

  def set_up_blockchain_account(key) do
    mint_user(key, 1, true)
  end

  def mint_user(key, value, new \\ false) do
    RebuWebApi.SolanaApi.mint_tokens_to_user(
      Application.get_env(:solana_keys, :owner_keypair),
      key,
      value,
      new
    )
  end

  def make_listing(product_id, qty, price) do
    SolanaApi.new_product_listing(Application.get_env(:solana_keys, :owner_keypair), product_id, qty, price)
  end
end
