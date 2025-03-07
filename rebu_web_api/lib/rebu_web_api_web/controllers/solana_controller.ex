defmodule RebuWebApiWeb.SolanaController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Solana
  alias RebuWebApi.Marketplace

  action_fallback RebuWebApiWeb.FallbackController

  def update_key(conn, %{"public_key" => key}) do
    user = Guardian.Plug.current_resource(conn)

    dbg(key)

    Solana.update_key(user, key)

    conn
    |> put_status(:ok)
    |> render(:success, %{})
  end

  def get_seller_pub_key(conn, %{
        "seller_id" => seller_id,
        "seller_type" => seller_type
      }) do
    {:ok, owner} = Marketplace.get_owner()

    conn
    |> json(%{seller_pub_key: owner.solana_pub_key})
  end
end
