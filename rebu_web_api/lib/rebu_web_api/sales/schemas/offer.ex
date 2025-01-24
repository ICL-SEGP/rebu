defmodule RebuWebApi.Sales.Offer do
  use Ecto.Schema
  import Ecto.Changeset

  schema "offers" do
    field :desc, :string
    field :affiliate_link, :string
    field :rebate_percentage, :decimal
    field :offer_start, :naive_datetime
    field :offer_end, :naive_datetime

    belongs_to :user, RebuWebApi.Accounts.User


    many_to_many :order, RebuWebApi.Sales.Order, join_through: "offers_orders"

    timestamps(type: :utc_datetime)

  end

  @doc false
  def changeset(offer, attrs) do
    offer
    |> cast(attrs, [:affiliate_link, :rebate_percentage, :desc, :offer_start, :offer_end])
    |> validate_required([:affiliate_link, :rebate_percentage, :desc, :offer_start, :offer_end])
  end
end
