defmodule RebuWebApiWeb.SolanaController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Solana

  action_fallback RebuWebApiWeb.FallbackController

  def update_key(conn, %{"public_key" => key}) do
    user = Guardian.Plug.current_resource(conn)

    Solana.update_key(user, key)

    conn
    |> put_status(:ok)
    |> render(:success, %{})
  end
end
