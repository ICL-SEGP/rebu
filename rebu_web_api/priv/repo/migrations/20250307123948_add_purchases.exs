defmodule RebuWebApi.Repo.Migrations.AddPurchases do
  @moduledoc false
  use Ecto.Migration

  def change do
    create table(:purchases) do
      add :buyer_id, :integer
      add :buyer_type, :string
      add :seller_id, :integer
      add :seller_type, :string
      add :total_amount, :decimal
      add :purchase_date, :utc_datetime
      add :status, :string
      add :qty, :integer

      add :product_id, references(:products, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end
  end
end
