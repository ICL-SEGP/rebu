defmodule RebuWebApi.Repo.Migrations.AffiliateUsers do
  @moduledoc false
  use Ecto.Migration

  def change do
    alter table("users") do
      add :role, :string
    end
  end
end
