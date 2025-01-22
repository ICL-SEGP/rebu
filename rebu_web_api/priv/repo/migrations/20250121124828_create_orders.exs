defmodule RebuWebApi.Repo.Migrations.CreateOrders do
  use Ecto.Migration

  def change do
    create table(:orders) do
      add :status, :string
      add :total_rebate_amount, :decimal
      add :user_id, references(:users, on_delete: :nothing)


      timestamps(type: :utc_datetime)
    end

    create index(:orders, [:user_id])
  end
end
