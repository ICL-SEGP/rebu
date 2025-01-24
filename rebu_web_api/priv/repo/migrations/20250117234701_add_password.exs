defmodule RebuWebApi.Repo.Migrations.AddPassword do
  @moduledoc false
  use Ecto.Migration

  def change do
    alter table(:users) do
      modify :balance, :numeric, default: 0.0, null: false
      add :hashed_password, :string, null: false
    end
  end
end
