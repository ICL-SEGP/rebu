defmodule RebuWebApiWeb.AccountsController do
  use RebuWebApiWeb, :controller
  alias RebuWebApi.Accounts

  action_fallback RebuWebApiWeb.FallbackController

  def create(conn, params) do
    with {:ok, user} <- Accounts.register_user(params) do
      

      conn
      |> put_status(:created)
      |> render(:register_success, user: user)
    end
  end
end
