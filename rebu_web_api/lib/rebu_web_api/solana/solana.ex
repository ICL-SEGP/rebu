defmodule RebuWebApi.Solana do
  import Ecto.Query, warn: false
  alias RebuWebApi.Repo

  alias RebuWebApi.Accounts.User

  def update_key(%User{} = user, key) do
    user
    |> Ecto.Changeset.change(%{solana_pub_key: key})
    |> Repo.update()
  end
end
