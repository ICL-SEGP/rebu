defmodule RebuWebApiWeb.AuthController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Accounts
  alias RebuWebApi.Auth.Guardian

  action_fallback RebuWebApiWeb.FallbackController

  def register(conn, params) do
    with {:ok, user} <- Accounts.register_user(params),
         {:ok, token, claims} <- Guardian.encode_and_sign(user) do
      dbg(claims)

      conn
      |> put_status(:created)
      |> render(:auth_success, user: user, token: token)
    end
  end

  def sign_in(conn, %{"email" => email, "password" => password}) do
    with {:ok, user, token} <- Accounts.authenticate_sign_in(email, password) do
      conn
      |> Plug.Conn.put_session(:user_id, user.id)
      |> put_status(200)
      |> render(:auth_success, user: user, token: token)
    end
  end
end
