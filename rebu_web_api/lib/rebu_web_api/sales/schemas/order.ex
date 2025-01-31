defmodule RebuWebApi.Sales.Order do
  use Ecto.Schema
  import Ecto.Changeset

  schema "orders" do
    field :status, Ecto.Enum, values: [:in_progress, :refunded, :completed], default: :in_progress
    field :total_rebate_amount, :decimal

    belongs_to :user, RebuWebApi.Accounts.User

    many_to_many :offers, RebuWebApi.Sales.Offer, join_through: "offers_orders"

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(order, attrs) do
    order
    |> cast(attrs, [:status, :total_rebate_amount])
    |> validate_inclusion(:status, [:in_progress, :refunded, :completed])
    |> validate_required([:status, :total_rebate_amount])
  end

  def status_changeset(user, attrs) do
    user
    |> cast(attrs, [:status])
    |> validate_inclusion(:status, [:in_progress, :refunded, :completed])
    |> case do
      %{changes: %{status: _}} = changeset -> changeset
      %{} = changeset -> add_error(changeset, :name, "invalid option")
    end
  end
end
