defmodule RebuWebApiWeb.SolanaController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Solana
  alias RebuWebApi.Marketplace

  action_fallback RebuWebApiWeb.FallbackController

  def update_key(conn, %{"public_key" => key}) do
    user = Guardian.Plug.current_resource(conn)

    # if is_nil(user.solana_pub_key) do
    #   dbg(Solana.set_up_blockchain_account(key))
    # end

    dbg(Solana.update_key(user, key))

    conn
    |> put_status(:ok)
    |> render(:success, %{})
  end

  def get_seller_pub_key(conn, %{
        "seller_id" => seller_id,
        "seller_type" => seller_type
      }) do
    {:ok, owner} = Marketplace.get_owner(seller_id, seller_type)

    conn
    |> json(%{seller_pub_key: owner.solana_pub_key})
  end

  def get_balance(conn, _params) do
    user = Guardian.Plug.current_resource(conn)
    balance = RebuWebApi.SolanaApi.get_user_token_balance(user.solana_pub_key)

    conn
    |> json(%{balance: balance})
  end
end
