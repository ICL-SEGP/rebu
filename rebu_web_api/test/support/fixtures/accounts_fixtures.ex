defmodule RebuWebApi.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `RebuWebApi.Accounts` context.
  """

  @doc """
  Generate a user.
  """
  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        name: "some name"
      })
      |> RebuWebApi.Accounts.create_user()

    user
  end
end
