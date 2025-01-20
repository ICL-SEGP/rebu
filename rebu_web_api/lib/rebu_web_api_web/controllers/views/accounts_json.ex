defmodule RebuWebApiWeb.AccountsJSON do
  alias RebuWebApi.Accounts.User
  def register_success(%{user: user}) do
    data(user)
  end

  defp data(%User{} = user) do
    Map.from_struct(user)
    |> Map.drop([:__meta__, :password, :hashed_password])
  end
end
