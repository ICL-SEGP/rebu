defmodule RebuWebApiWeb.UserController do
  use RebuWebApiWeb, :controller

  alias RebuWebApi.Accounts
  alias RebuWebApiWeb.ErrorResponse

  action_fallback RebuWebApiWeb.FallbackController

  # user

  def get_profile(conn, _params) do
    user = Guardian.Plug.current_resource(conn)

    conn
    |> json(user)
  end

  def update_profile(conn, %{"user" => user_params}) do
    user = Guardian.Plug.current_resource(conn)

    {:ok, user} = Accounts.update_user(user, user_params)

    conn
    |> json(user)
  end

  def get_balance(conn, _params) do
    user = Guardian.Plug.current_resource(conn)

    conn
    |> json(%{balance: user.token_balance})
  end

  # Affiliate functions

  def get_linked_users(conn, _params) do
    affiliate = Guardian.Plug.current_resource(conn)

    users = Accounts.get_affiliate_linked_users(affiliate.id)

    conn
    |> json(users)
  end

  def manual_create_user(conn, %{"user" => user_params}) do
    with {:ok, user} <- Accounts.register_user(user_params) do
      conn
      |> put_status(:created)
      |> json(user)
    end
  end

  def get(conn, %{"id" => id}) do
    affiliate = Guardian.Plug.current_resource(conn)
    user = Accounts.get_user!(id)

    if not (user.affiliate_id == affiliate.id) do
      raise ErrorResponse.Unauthorized
    end

    conn
    |> json(user)
  end

  def update(conn, %{"user" => user_params, "id" => id}) do
    affiliate = Guardian.Plug.current_resource(conn)
    user = Accounts.get_user!(id)

    if not (user.affiliate_id == affiliate.id) do
      raise ErrorResponse.Unauthorized
    end

    {:ok, user} = Accounts.update_user(user, user_params)

    conn
    |> json(user)
  end
end
