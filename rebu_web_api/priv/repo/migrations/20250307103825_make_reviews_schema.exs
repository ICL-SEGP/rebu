defmodule RebuWebApi.Repo.Migrations.MakeReviewsSchema do
  @moduledoc false
  use Ecto.Migration

  def change do
    create table(:reviews) do
      add :rating, :integer
      add :comment, :string
      add :reviewer_id, :integer
      add :reviewer_type, :string

      add :product_id, references(:products, on_delete: :nothing)

      timestamps(type: :utc_datetime, inserted_at: :created_at, updated_at: false)
    end
  end
end
