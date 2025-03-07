defmodule RebuWebApi.Repo.Migrations.AddUniqueCategoryName do
  @moduledoc false
  use Ecto.Migration

  def change do
    create unique_index(:categories, [:name], name: :categories_name_index)
  end
end
