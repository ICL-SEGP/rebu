defmodule RebuWebApi.Repo.Migrations.AddBlockedBoolToUser do
  @moduledoc false
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :blocked, :boolean
    end
  end
end
