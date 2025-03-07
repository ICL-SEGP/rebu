defmodule RebuWebApiWeb.AuthController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Accounts
  alias RebuWebApi.Auth.Guardian
  alias RebuWebApi.Repo

  action_fallback RebuWebApiWeb.FallbackController

  def register(conn, %{"user" => user_params, "referral_code" => code}) do
    affiliate =
      if code == "" do
        Repo.get_by(Accounts.Affiliate, email: "affiliate@test.com")
      else
        affiliate = Repo.get_by(Accounts.Affiliate, referral_code: code)

        if affiliate,
          do: affiliate,
          else: Repo.get_by(Accounts.Affiliate, email: "affiliate@test.com")
      end

    user_params = Map.put(user_params, "affiliate", affiliate)

    with {:ok, user} <- Accounts.register_user(user_params),
         {:ok, token, _claims} <- Guardian.encode_and_sign(user) do
      conn
      |> put_status(:created)
      |> render(:user, %{user: user, token: token})
    end
  end

  def register(conn, %{"affiliate" => affiliate_params}) do
    with {:ok, affiliate} <- Accounts.register_affiliate(affiliate_params),
         {:ok, token, _claims} <- Guardian.encode_and_sign(affiliate) do
      conn
      |> put_status(:created)
      |> render(:user, %{user: affiliate, token: token})
    end
  end

  def sign_in(conn, %{"email" => email, "password" => password}) do
    with {:ok, user, token} <- Accounts.authenticate_sign_in(email, password) do
      conn
      |> render(:user, %{user: user, token: token})
    end
  end

  def password_reset(conn, %{"password" => password, "new_password" => _new_password}) do
    user = Guardian.Plug.current_resource(conn)

    with true <- Bcrypt.verify_pass(password, user.hashed_password) do
      conn
      |> render(:user, %{user: user})
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
