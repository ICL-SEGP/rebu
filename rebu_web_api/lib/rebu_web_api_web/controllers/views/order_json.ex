defmodule RebuWebApiWeb.OrderJSON do
  use JsonView

  # define which fields return without modifying
  @fields [:id, :status, :total_rebate_amount, :order_date]
  # define which fields that need to format or calculate, you have to define `render_field/2` below
  @relationships [
    offers: RebuWebApiWeb.OfferJSON,
    user: RebuWebApiWeb.UserJSON
  ]

  def render("order.json", %{order: order}) do
    # 1st way if `use JsonView`
    render_json(order, @fields, [], @relationships)
  end

  def render("order.json", %{orders: orders}) do
    # 1st way if `use JsonView`
    JsonView.render_many(orders, __MODULE__, "order.json")
  end
end
