defmodule RebuWebApiWeb.AuthController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Accounts
  alias RebuWebApi.Auth.Guardian

  action_fallback RebuWebApiWeb.FallbackController

  def register(conn, %{"role" => "user", "user" => user_params}) do
    with {:ok, user} <- Accounts.register_user(user_params),
         {:ok, token, _claims} <- Guardian.encode_and_sign(user) do
      conn
      |> put_status(:created)
      |> json(%{user: user, token: token})
    end
  end

  def register(conn, %{"role" => "affiliate", "affiliate" => affiliate_params}) do
    with {:ok, affiliate} <- Accounts.register_affiliate(affiliate_params),
         {:ok, token, _claims} <- Guardian.encode_and_sign(affiliate) do
      conn
      |> put_status(:created)
      |> json(%{user: affiliate, token: token})
    end
  end

  def sign_in(conn, %{"email" => email, "password" => password}) do
    with {:ok, user, token} <- Accounts.authenticate_sign_in(email, password) do
      conn
      |> json(%{user: user, token: token})
    end
  end

  def sign_out(conn, _params) do
    token = Guardian.Plug.current_token(conn)
    Guardian.revoke(token)

    conn
    |> Plug.Conn.clear_session()
    |> json(%{message: "Signed out successfully.", status: "success"})
  end
end
