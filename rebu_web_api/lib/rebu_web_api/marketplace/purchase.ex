defmodule RebuWebApi.Marketplace.Purchase do
  use Ecto.Schema
  import Ecto.Changeset

  schema "purchases" do
    field :buyer_id, :integer
    field :buyer_type, Ecto.Enum, values: [:user, :affiliate]
    field :seller_id, :integer
    field :seller_type, Ecto.Enum, values: [:user, :affiliate]

    field :total_amount, :decimal
    field :purchase_date, :utc_datetime
    field :status, Ecto.Enum, values: [:processing, :delivered, :cancelled]
    field :qty, :integer
    belongs_to :product, RebuWebApi.Marketplace.Product

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(purchase, attrs) do
    purchase
    |> cast(attrs, [
      :buyer_id,
      :buyer_type,
      :seller_id,
      :seller_type,
      :product_id,
      :total_amount,
      :status,
      :purchase_date
    ])
    |> validate_required([
      :buyer_id,
      :seller_id,
      :product_id,
      :total_amount,
      :purchase_date,
      :status
    ])
    |> validate_inclusion(:seller_type, [:user, :affiliate])
    |> validate_inclusion(:buyer_type, [:user, :affiliate])
    |> validate_inclusion(:status, [:processing, :delivered, :cancelled])
  end
end
