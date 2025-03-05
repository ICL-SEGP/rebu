defmodule RebuWebApi.Uploads.Upload do
  use Ecto.Schema
  import Ecto.Changeset

  schema "uploads" do
    field :type, :string
    field :metadata, :map
    field :url, :string
    field :owner_id, :integer
    field :owner_type, Ecto.Enum, values: [:user, :affiliate]
    field :key, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(upload, attrs) do
    upload
    |> cast(attrs, [:url, :metadata, :type, :owner_id, :owner_type, :key])
    |> validate_required([:url, :type, :owner_id, :owner_type, :key])
    |> validate_inclusion(:owner_type, [:user, :affiliate])
  end
end
