defmodule RebuWebApi.Auth.SetAccountPlug do
  use Plug.Builder

  alias RebuWebApi.Accounts

  plug :fetch_account

  def fetch_account(conn, _opts) do
    if Map.has_key?(conn.assigns, :user) do
      conn
    else
      user_id = Plug.Conn.get_session(conn, :user_id)
      if user_id == nil, do: raise(RebuWebApi.Auth.ErrorResponse.Unauthorized)

      user = Accounts.get_user!(user_id)

      dbg(user)

      cond do
        user && user_id -> assign(conn, :user, user)
        true -> raise(RebuWebApi.Auth.ErrorResponse.NotFound)
      end
    end
  end
end
