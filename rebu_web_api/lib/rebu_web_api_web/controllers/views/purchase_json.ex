defmodule RebuWebApiWeb.PurchaseJSON do
  use JsonView

  # define which fields return without modifying
  @fields [
    :id,
    :buyer_id,
    :buyer_type,
    :seller_id,
    :seller_type,
    :purchase_date,
    :status,
    :qty
  ]
  # define which fields that need to format or calculate, you have to define `render_field/2` below
  @relationships [
    product: RebuWebApiWeb.ProductJSON
  ]

  def render("purchase.json", %{purchase: purchase}) do
    # 1st way if `use JsonView`
    render_json(purchase, @fields, [], @relationships)
  end

  def render("purchase.json", %{purchases: purchases}) do
    # 1st way if `use JsonView`
    JsonView.render_many(purchases, __MODULE__, "purchase.json")
  end
end
