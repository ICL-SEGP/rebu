defmodule RebuWebApi.Sales.Offer do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder,
           only: [
             :id,
             :desc,
             :affiliate_link,
             :rebate_percentage,
             :item_cost,
             :status,
             :offer_start,
             :offer_end,
             :affiliate_id,
             :inserted_at
           ]}

  schema "offers" do
    field :desc, :string
    field :affiliate_link, :string
    field :rebate_percentage, :decimal
    field :item_cost, :decimal
    field :status, Ecto.Enum, values: [:scheduled, :active, :expired], default: :active
    field :offer_start, :naive_datetime
    field :offer_end, :naive_datetime

    belongs_to :affiliate, RebuWebApi.Accounts.Affiliate

    many_to_many :orders, RebuWebApi.Sales.Order,
      join_through: "offers_orders",
      on_delete: :delete_all,
      on_replace: :delete

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(offer, attrs) do
    offer
    |> cast(attrs, [
      :affiliate_link,
      :rebate_percentage,
      :desc,
      :offer_start,
      :offer_end,
      :status,
      :item_cost
    ])
    |> validate_inclusion(:status, [:scheduled, :active, :expired])
    |> validate_required([
      :affiliate_link,
      :rebate_percentage,
      :desc,
      :offer_start,
      :offer_end,
      :item_cost
    ])
  end


end
