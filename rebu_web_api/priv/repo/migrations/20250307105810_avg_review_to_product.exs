defmodule RebuWebApi.Repo.Migrations.AvgReviewToProduct do
  use Ecto.Migration

  def change do
    alter table(:products) do
      add :avg_rating, :integer
    end
  end
end
