defmodule RebuWebApi.Repo.Migrations.AddTableCategories do
  @moduledoc false
  use Ecto.Migration

  def change do
    create table(:categories) do
      add :name, :string
      add :image_url, :string

      timestamps(type: :utc_datetime)
    end

    alter table(:products) do
      add :category_id, references(:categories, on_delete: :nothing)
    end
  end
end
