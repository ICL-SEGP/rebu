defmodule RebuWebApi.Repo.Migrations.CreateUsers do
  @moduledoc false
  use Ecto.Migration

  def change do
    # execute "CREATE EXTENSION IF NOT EXISTS citext"

    create table(:users) do
      add :first_name, :string
      add :last_name, :string
      add :email, :citext
      add :balance, :integer

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])
  end
end
