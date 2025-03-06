defmodule RebuWebApi.Sales.Order do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder,
           only: [
             :id,
             :status,
             :total_rebate_amount,
             :order_date
           ]}

  schema "orders" do
    field :status, Ecto.Enum, values: [:pending, :cancelled, :completed], default: :pending
    field :total_rebate_amount, :decimal
    field :order_date, :date

    belongs_to :user, RebuWebApi.Accounts.User

    many_to_many :offers, RebuWebApi.Sales.Offer,
      join_through: "offers_orders",
      on_delete: :delete_all,
      on_replace: :delete

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(order, attrs) do
    order
    |> cast(attrs, [:status, :total_rebate_amount, :order_date])
    |> validate_inclusion(:status, [:pending, :cancelled, :completed])
    |> validate_required([:status, :total_rebate_amount])
  end

  def status_changeset(user, attrs) do
    user
    |> cast(attrs, [:status])
    |> validate_inclusion(:status, [:pending, :cancelled, :completed])
    |> case do
      %{changes: %{status: _}} = changeset -> changeset
      %{} = changeset -> add_error(changeset, :name, "invalid option")
    end
  end
end
