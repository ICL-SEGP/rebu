defmodule RebuWebApi.Repo.Migrations.AdminUsers do
  @moduledoc false
  use Ecto.Migration

  def change do
    alter table("users") do
      add :role, :string
    end
  end
end
