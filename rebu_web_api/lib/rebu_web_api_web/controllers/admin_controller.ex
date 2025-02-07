defmodule RebuWebApiWeb.AdminController do
  alias RebuWebApi.Accounts
  use RebuWebApiWeb, :controller

  action_fallback RebuWebApiWeb.FallbackController

  def get_users(conn, _params) do
    users = Accounts.get_users_by_role(:user)

    conn
    |> put_status(200)
    |> render(:get_users, users: users)
  end
end
