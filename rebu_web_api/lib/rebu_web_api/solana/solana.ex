defmodule RebuWebApi.Solana do
  import Ecto.Query, warn: false
  alias RebuWebApi.Repo
  alias RebuWebApi.SolanaApi

  @blockchain_offset 2000
  @mnt "CSWoyRACpM1tFJaCAZGKqytMjCXrT6iWJgkgpPHRZCPx"

  def update_key(user, key) do
    user
    |> Ecto.Changeset.change(%{solana_pub_key: key})
    |> Repo.update()
  end

  def verify_purchase(key, product_id) do
    dbg(key)
    dbg(product_id)

    RebuWebApi.SolanaApi.verify_purchase(
      Application.get_env(:solana_keys, :owner_keypair),
      "6nyYhkrgDfb3f1eVCaAjTPoPkVRxx5sev9tzr5f1mCDY",
      product_id + @blockchain_offset
    )
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
    SolanaApi.new_product_listing(
      Application.get_env(:solana_keys, :owner_keypair),
      product_id + @blockchain_offset,
      qty,
      price
    )
  end

  def mnt(), do: @mnt

  def modify_listing(product_id, qty, price) do
    SolanaApi.modify_product_listing(
      Application.get_env(:solana_keys, :owner_keypair),
      product_id + @blockchain_offset,
      qty,
      price
    )
  end
end
