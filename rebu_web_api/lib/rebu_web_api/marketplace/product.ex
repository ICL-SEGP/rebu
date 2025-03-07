defmodule RebuWebApi.Marketplace.Product do
  use Ecto.Schema
  import Ecto.Changeset

  schema "products" do
    field :name, :string
    field :status, Ecto.Enum, values: [:scheduled, :active, :expired, :sold_out], default: :active
    field :desc, :string
    field :price, :decimal
    field :image_url, :string
    field :file_url, :string
    field :file_type, :string
    field :qty, :integer

    field :seller_id, :integer
    field :seller_type, Ecto.Enum, values: [:user, :affiliate]

    belongs_to :category, RebuWebApi.Marketplace.Category

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(product, attrs) do
    product
    |> cast(attrs, [
      :name,
      :desc,
      :price,
      :image_url,
      :file_url,
      :file_type,
      :status,
      :qty,
      :seller_id,
      :seller_type
    ])
    |> validate_required([
      :name,
      :desc,
      :price,
      :image_url,
      :file_url,
      :file_type,
      :status
    ])
    |> validate_inclusion(:status, [:scheduled, :active, :expired, :sold_out])
    |> validate_inclusion(:seller_type, [:user, :affiliate])
  end
end
