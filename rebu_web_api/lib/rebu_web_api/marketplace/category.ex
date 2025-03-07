defmodule RebuWebApi.Marketplace.Category do
  use Ecto.Schema
  import Ecto.Changeset

  schema "categories" do
    field :name, :string
    field :image_url, :string

    has_many :products, RebuWebApi.Marketplace.Product

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(category, attrs) do
    category
    |> cast(attrs, [:name, :image_url])
    |> validate_required([:name, :image_url])
    |> transform_name()
    |> unique_constraint(:name, name: :categories_name_index) # Added unique constraint
  end

  defp transform_name(changeset) do
    case get_field(changeset, :name) do
      nil -> changeset
      name -> put_change(changeset, :name, String.downcase(name))
    end
  end
end
