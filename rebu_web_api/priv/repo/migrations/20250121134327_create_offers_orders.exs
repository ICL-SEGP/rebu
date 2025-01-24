defmodule RebuWebApi.Repo.Migrations.CreateOffersOrders do
  @moduledoc false
  use Ecto.Migration

  def change do
    create table(:offers_orders) do
      add :offer_id, references(:offers)
      add :order_id, references(:orders)
    end

    create unique_index(:offers_orders, [:offer_id, :order_id])
  end
end
