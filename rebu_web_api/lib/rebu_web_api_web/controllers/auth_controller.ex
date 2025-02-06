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
      dbg(user.id)

      conn
      |> put_status(200)
      |> render(:auth_success, user: user, token: token)
    end
  end

  def sign_in(conn, %{"email" => email, "password" => password}) do
    conn =
      with {:ok, user, token} <- Accounts.authenticate_sign_in(email, password) do
        conn
        |> Plug.Conn.put_session(:user_id, user.id)
        |> put_status(200)
        |> render(:auth_success, user: user, token: token)
      end

    IO.inspect(Plug.Conn.get_session(conn, :user_id), label: "🔍 Session user_id after setting")
    conn
  end

  def sign_out(conn, %{}) do
    user = conn.assigns[:user]
    token = Guardian.Plug.current_token(conn)
    Guardian.revoke(token)

    conn
    |> Plug.Conn.clear_session()
    |> put_status(:ok)
    |> render(:signed_out, %{user: user, token: nil})
  end

  def get_balance(conn, %{}) do
    user = Guardian.Plug.current_resource(conn)

    balance = Accounts.get_user_balance!(user.id)

    conn
    |> put_status(:ok)
    |> render(:balance, %{balance: balance})
  end
end
