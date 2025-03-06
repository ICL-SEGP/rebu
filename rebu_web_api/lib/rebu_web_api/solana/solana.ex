defmodule RebuWebApi.Solana do
  import Ecto.Query, warn: false
  alias RebuWebApi.Repo

  def update_key(user, key) do
    user
    |> Ecto.Changeset.change(%{solana_pub_key: key})
    |> Repo.update()
  end
end
