defmodule RebuWebApiWeb.AuthJSON do
  alias RebuWebApi.Accounts.User

  def auth_success(%{user: user, token: token}) do
    Map.put(data(user), :token, token)
  end

  def signed_out(%{}) do
    %{sign_out: "successful", message: "Goodbye!"}
  end

  def balance(%{balance: balance}) do
    %{balance: balance }
  end

  @spec error(%{:error => any(), optional(any()) => any()}) :: %{error: any()}
  def error(%{error: error}) do
    %{
      error: error
    }
  end

  defp data(%User{} = user) do
    Map.from_struct(user)
    |> Map.drop([:__meta__, :password, :hashed_password, :offers, :orders])
    |> Map.put(:balance, handle_balance(user.balance))
  end

  defp data(nil), do: %{}

  defp handle_balance(balance) do
    String.to_float(to_string(balance))
  end
end
