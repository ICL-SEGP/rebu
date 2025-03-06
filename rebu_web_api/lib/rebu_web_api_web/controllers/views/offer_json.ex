defmodule RebuWebApiWeb.OfferJSON do
  use JsonView

  # define which fields return without modifying
  @fields [
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
  ]
  # define which fields that need to format or calculate, you have to define `render_field/2` below
  @relationships [
    orders: RebuWebApiWeb.OrderJSON,
    affiliate: RebuWebApiWeb.AffiliateJSON
  ]

  def render("offer.json", %{offer: offer}) do
    # 1st way if `use JsonView`
    render_json(offer, @fields, [], @relationships)
  end
end
