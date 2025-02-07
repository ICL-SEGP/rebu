defmodule RebuWebApi.Auth.AccountPlugs do
  use Plug.Builder

  alias RebuWebApi.Accounts

  plug :fetch_account
  plug :check_admin

  def fetch_account(conn, _opts) do
    # if Map.has_key?(conn.assigns, :user) do
    #   conn
    # else
    #   user_id = Plug.Conn.fetch_session(conn)

    #   dbg(user_id)

    #   if user_id == nil, do: raise(RebuWebApi.Auth.ErrorResponse.Unauthorized)

    #   user = Accounts.get_user!(user_id)

    #   dbg(user)

    #   cond do
    #     user && user_id -> assign(conn, :user, user)
    #     true -> raise(RebuWebApi.Auth.ErrorResponse.NotFound)
    #   end
    # end

    conn
  end

  def check_admin(conn, _opts) do
    user = Guardian.Plug.current_resource(conn)

    if not Accounts.is_admin(user) do
      raise(RebuWebApi.Auth.ErrorResponse.Unauthorized)
    end

    conn
  end
end
