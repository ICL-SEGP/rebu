defmodule RebuWebApi.Marketplace.Review do
  use Ecto.Schema
  import Ecto.Changeset

  schema "reviews" do
    field :rating, :integer
    field :comment, :string

    field :reviewer_id, :integer
    field :reviewer_type, Ecto.Enum, values: [:user, :affiliate]

    belongs_to :product, RebuWebApi.Marketplace.Product

    # Using createdAt
    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(review, attrs) do
    review
    |> cast(attrs, [:rating, :comment])
    |> validate_required([:rating, :comment])
    |> validate_number(:rating, greater_than_or_equal_to: 1, less_than_or_equal_to: 5)
  end
end
